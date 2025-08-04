import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup directory
const backupDir = 'remove-images-backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Image patterns to remove
const imagePatterns = [
  // Markdown image syntax: ![alt text](url)
  /!\[.*?\]\(.*?\)/g,
  
  // HTML img tags
  /<img[^>]*>/gi,
  
  // Wix-specific image URLs that might be standalone
  /https:\/\/static\.wixstatic\.com\/media\/[^\s\n]+/g,
  
  // Common image file references
  /\[.*?\]\(.*?\.(jpg|jpeg|png|gif|webp|svg)\)/gi,
];

// Function to clean the content
function cleanContent(content) {
  // Split content by frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    // No frontmatter, process entire content
    return removeImages(content);
  }
  
  // Preserve frontmatter and only clean body
  const frontmatter = frontmatterMatch[1];
  let body = frontmatterMatch[2];
  
  // Remove images from body only
  body = removeImages(body);
  
  // Reconstruct the file
  return `---\n${frontmatter}\n---\n${body}`;
}

function removeImages(text) {
  let cleaned = text;
  
  imagePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Clean up multiple blank lines left behind
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Clean up spaces at the end of lines
  cleaned = cleaned.replace(/ +$/gm, '');
  
  // Clean up blank lines at the start
  cleaned = cleaned.replace(/^\n+/, '\n');
  
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
    
    // Count how many images were removed
    const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length +
                      (content.match(/<img[^>]*>/gi) || []).length;
    
    return { success: true, changed: true, imageCount };
  }
  
  return { success: true, changed: false, imageCount: 0 };
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
console.log('Removing images from markdown body content...\n');

// Process all markdown files in content directory
const contentDir = path.join(process.cwd(), 'src/content');
const markdownFiles = getAllMarkdownFiles(contentDir);

let totalProcessed = 0;
let totalChanged = 0;
let totalImagesRemoved = 0;
let errors = 0;

markdownFiles.forEach(file => {
  const result = processFile(file);
  
  if (result.success) {
    totalProcessed++;
    if (result.changed) {
      totalChanged++;
      totalImagesRemoved += result.imageCount;
      console.log(`✓ Cleaned: ${file} (${result.imageCount} images removed)`);
    } else {
      console.log(`- No images found: ${file}`);
    }
  } else {
    errors++;
    console.log(`✗ Error: ${result.message}`);
  }
});

console.log('\n=== Summary ===');
console.log(`Total files processed: ${totalProcessed}`);
console.log(`Files cleaned: ${totalChanged}`);
console.log(`Total images removed: ${totalImagesRemoved}`);
console.log(`Errors: ${errors}`);
console.log(`Backups saved in: ${backupDir}/`);
console.log('\nNote: heroImage in frontmatter has been preserved.');