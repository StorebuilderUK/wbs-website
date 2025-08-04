import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup directory
const backupDir = 'remove-remaining-header-backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Patterns to remove
const patternsToRemove = [
  // Main pattern
  /Enhance Your Online Presence with Website Design Telford\s*\n\s*Online shop/gi,
  
  // Individual parts that might appear separately
  /Enhance Your Online Presence with Website Design Telford/gi,
  /^\s*Online shop\s*$/gm,
  
  // Clean up any orphaned "Online shop" lines
  /^Online shop\s*\n/gm,
];

// Function to clean the content
function cleanContent(content) {
  let cleaned = content;
  
  patternsToRemove.forEach(pattern => {
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
console.log('Removing remaining header elements from markdown files...\n');

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