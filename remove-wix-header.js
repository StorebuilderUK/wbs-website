import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup directory
const backupDir = 'remove-header-backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Header patterns to remove
const headerPatterns = [
  // Main header text variations
  /Enhance Your Online Presence with Website Design Telford[\s\S]*?Put My Crackerjack Digital Marketing Skills To Work On Your Next Website Design Project!\s*\n\s*Get Started/gi,
  
  // Shorter variations
  /Website Design Telford\s*\n\s*Local Website Design For A Global Audience[\s\S]*?Get Started/gi,
  
  // Just the photo and signature part
  /Photo-Tony-CIRCULAR-2025-1\. png[\s\S]*?Signature_edited_edited\. png[\s\S]*?Get Started/gi,
  
  // Individual components that might appear separately
  /Online shop\s*\n\s*Website Design Telford/gi,
  /Local Website Design For A Global Audience\s*\n/gi,
  /Put My Crackerjack Digital Marketing Skills To Work On Your Next Website Design Project!\s*\n/gi,
  
  // Clean up any standalone "Get Started" that might be left
  /^\s*Get Started\s*$/gm,
];

// Function to clean the content
function cleanContent(content) {
  let cleaned = content;
  
  headerPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Clean up multiple blank lines left behind
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Clean up whitespace at the start of the file after frontmatter
  cleaned = cleaned.replace(/^---\n([\s\S]*?)\n---\n\s*\n+/, '---\n$1\n---\n\n');
  
  return cleaned;
}

// Process a single file
function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    return { success: false, message: `File not found: ${filePath}` };
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const cleanedContent = cleanContent(content);
  
  if (content !== cleanedContent) {
    // Create backup
    const backupPath = path.join(backupDir, path.basename(filePath));
    fs.writeFileSync(backupPath, content);
    
    // Write cleaned content
    fs.writeFileSync(fullPath, cleanedContent);
    
    return { success: true, changed: true };
  }
  
  return { success: true, changed: false };
}

// Get all markdown files
function getAllMarkdownFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && item !== 'node_modules' && item !== '.git') {
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith('.md')) {
        files.push(path.relative(process.cwd(), fullPath));
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Main execution
console.log('Removing Wix header content from markdown files...\n');

// Process all markdown files in content directory
const contentDir = path.join(process.cwd(), 'src/content');
const markdownFiles = getAllMarkdownFiles(contentDir);

let totalProcessed = 0;
let totalChanged = 0;
let errors = 0;

markdownFiles.forEach(file => {
  const result = processFile(file);
  
  if (result.success) {
    totalProcessed++;
    if (result.changed) {
      totalChanged++;
      console.log(`✓ Cleaned: ${file}`);
    } else {
      console.log(`- No changes needed: ${file}`);
    }
  } else {
    errors++;
    console.log(`✗ Error: ${result.message}`);
  }
});

console.log('\n=== Summary ===');
console.log(`Total files processed: ${totalProcessed}`);
console.log(`Files cleaned: ${totalChanged}`);
console.log(`Errors: ${errors}`);
console.log(`Backups saved in: ${backupDir}/`);