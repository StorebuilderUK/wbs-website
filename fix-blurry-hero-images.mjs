import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing blog posts
const blogDir = path.join(__dirname, 'src', 'content', 'blog');

let totalUpdates = 0;

// Function to convert blurry image URL to high quality
function fixImageUrl(url) {
  // Remove blur parameter and update dimensions
  let newUrl = url
    .replace(/blur_2,/, '') // Remove blur
    .replace(/w_133,h_76/, 'w_800,h_450') // Increase dimensions for hero image
    .replace(/q_80/, 'q_90'); // Increase quality
  
  return newUrl;
}

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
  
  // Check if file has a heroImage with blur parameters
  if (content.includes('heroImage:') && content.includes('blur_2')) {
    // Replace the heroImage URL in frontmatter
    content = content.replace(
      /heroImage: "(https:\/\/static\.wixstatic\.com\/media\/[^"]+)"/,
      (match, url) => {
        const newUrl = fixImageUrl(url);
        return `heroImage: "${newUrl}"`;
      }
    );
    
    // Write back to file
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✓ Fixed blurry hero image in ${filename}`);
    totalUpdates++;
  }
});

console.log(`\nComplete! Fixed ${totalUpdates} blurry hero images.`);