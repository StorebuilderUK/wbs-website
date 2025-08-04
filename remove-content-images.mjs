import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing blog posts
const blogDir = path.join(__dirname, 'src', 'content', 'blog');

let totalUpdates = 0;
let totalImagesRemoved = 0;

// Process each markdown file
fs.readdirSync(blogDir).forEach(filename => {
  if (!filename.endsWith('.md')) return;
  
  const filepath = path.join(blogDir, filename);
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Skip if doesn't have frontmatter
  if (!content.startsWith('---')) {
    console.log(`Skipping ${filename} - no frontmatter`);
    return;
  }
  
  // Split frontmatter and body
  const parts = content.split('---');
  if (parts.length < 3) return;
  
  const frontmatter = parts[1];
  let bodyContent = parts.slice(2).join('---');
  const originalBody = bodyContent;
  
  // Count images before removal
  const imageMatches = bodyContent.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
  const imageCount = imageMatches.length;
  
  if (imageCount > 0) {
    // Remove all markdown images from body content
    bodyContent = bodyContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');
    
    // Clean up extra blank lines left after image removal
    bodyContent = bodyContent.replace(/\n{3,}/g, '\n\n');
    
    // Reconstruct the file
    const newContent = `---${frontmatter}---${bodyContent}`;
    
    // Write back to file
    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log(`✓ Removed ${imageCount} images from ${filename}`);
    totalImagesRemoved += imageCount;
    totalUpdates++;
  }
});

console.log(`\nComplete! Updated ${totalUpdates} blog posts.`);
console.log(`Total images removed: ${totalImagesRemoved}`);