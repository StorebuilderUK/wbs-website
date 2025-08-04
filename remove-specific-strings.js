import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup directory
const backupDir = 'remove-strings-backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Strings to remove
const stringsToRemove = [
  // Make Enquiry patterns
  /Make Enquiry\s*\n\s*Make Enquiry/gi,
  /Make Enquiry/gi,
  
  // Project Management Guide pattern
  /How To Build An eCommerce Website – Project Management Guide/gi,
  
  // Clean up any variations with different dashes
  /How To Build An eCommerce Website [–-] Project Management Guide/gi,
];

// Function to clean the content
function cleanContent(content) {
  let cleaned = content;
  
  stringsToRemove.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Clean up multiple blank lines left behind
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Clean up trailing whitespace
  cleaned = cleaned.replace(/\s+$/g, '\n');
  
  // Clean up any standalone empty lines with just spaces
  cleaned = cleaned.replace(/^\s+$/gm, '');
  
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
    
    // Count occurrences
    let occurrences = 0;
    stringsToRemove.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        occurrences += matches.length;
      }
    });
    
    return { success: true, changed: true, occurrences };
  }
  
  return { success: true, changed: false, occurrences: 0 };
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
console.log('Removing specific strings from markdown files...\n');
console.log('Strings to remove:');
console.log('- "Make Enquiry"');
console.log('- "Make Enquiry\\nMake Enquiry"');
console.log('- "How To Build An eCommerce Website – Project Management Guide"\n');

// Process all markdown files in content directory
const contentDir = path.join(process.cwd(), 'src/content');
const markdownFiles = getAllMarkdownFiles(contentDir);

let totalProcessed = 0;
let totalChanged = 0;
let totalOccurrences = 0;
let errors = 0;

markdownFiles.forEach(file => {
  const result = processFile(file);
  
  if (result.success) {
    totalProcessed++;
    if (result.changed) {
      totalChanged++;
      totalOccurrences += result.occurrences;
      console.log(`✓ Cleaned: ${file} (${result.occurrences} occurrences removed)`);
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
console.log(`Total occurrences removed: ${totalOccurrences}`);
console.log(`Errors: ${errors}`);
console.log(`Backups saved in: ${backupDir}/`);