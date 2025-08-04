import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup directory
const backupDir = 'remove-telford-footer-backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Patterns to remove
const footerPatterns = [
  // Main footer pattern
  /Choose a Telford Website Company for your next project!\s*\n\s*Make Enquiry\s*\n\s*Make Enquiry\s*\n\s*Are You Ready To Level Up Your Digital Marketing Game\?\s*\n\s*​\s*\n\s*Want massive amounts of search engine traffic\? Then a pay monthly SEO plan is what you need\.\s*\n\s*​\s*\n\s*Crush the competition on Social Media\? Pay for our social media marketing on a monthly basis\.\s*\n\s*​\s*\n\s*Would you like all of your digital marketing done for you\? Talk to us!\s*\n\s*Make An Enquiry Today!/gi,
  
  // Variations with different spacing
  /Choose a Telford Website Company for your next project![\s\S]*?Make An Enquiry Today!/gi,
  
  // Individual components that might appear separately
  /Choose a Telford Website Company for your next project!\s*\n/gi,
  /Make Enquiry\s*\n\s*Make Enquiry/gi,
  /Are You Ready To Level Up Your Digital Marketing Game\?\s*\n/gi,
  /Want massive amounts of search engine traffic\? Then a pay monthly SEO plan is what you need\.\s*\n/gi,
  /Crush the competition on Social Media\? Pay for our social media marketing on a monthly basis\.\s*\n/gi,
  /Would you like all of your digital marketing done for you\? Talk to us!\s*\n/gi,
  /Make An Enquiry Today!\s*$/gim,
  
  // Clean up any standalone "Make Enquiry" at the end of files
  /\n\s*Make Enquiry\s*$/gi,
  
  // Clean up the "​" (zero-width space) characters
  /​/g,
];

// Function to clean the content
function cleanContent(content) {
  let cleaned = content;
  
  footerPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Clean up multiple blank lines left behind
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Clean up trailing whitespace
  cleaned = cleaned.replace(/\s+$/g, '\n');
  
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
console.log('Removing Telford footer content from markdown files...\n');

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