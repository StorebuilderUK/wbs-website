import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing blog posts
const blogDir = path.join(__dirname, 'src', 'content', 'blog');

let totalUpdates = 0;

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
  
  // Check if file has a heroImage with wrong dimensions
  if (content.includes('heroImage:') && content.includes('w_800,h_450')) {
    // Replace the dimensions in the heroImage URL
    content = content.replace(/w_800,h_450/g, 'w_740,h_420');
    
    // Write back to file
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✓ Updated hero image dimensions in ${filename}`);
    totalUpdates++;
  }
});

console.log(`\nComplete! Updated ${totalUpdates} hero images to 740x420.`);