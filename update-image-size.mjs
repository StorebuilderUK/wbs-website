import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to search
const directories = [
  path.join(__dirname, 'src', 'content', 'blog'),
  path.join(__dirname, 'src', 'content', 'pages')
];

// Old and new image URLs
const oldImageUrl = 'https://static.wixstatic.com/media/b0d63a_15ab6144f0084ab89ae5dee757358a72~mv2.png/v1/fill/w_153,h_153,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Photo-Tony-CIRCULAR-2025-1.png';
const newImageUrl = 'https://static.wixstatic.com/media/b0d63a_15ab6144f0084ab89ae5dee757358a72~mv2.png/v1/fill/w_200,h_200,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Photo-Tony-CIRCULAR-2025-1.png';

let totalUpdates = 0;

// Function to process files in a directory
function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(filename => {
    if (!filename.endsWith('.md')) return;
    
    const filepath = path.join(dir, filename);
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Count occurrences
    const occurrences = (content.match(new RegExp(oldImageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    
    if (occurrences > 0) {
      // Replace all occurrences
      content = content.replace(new RegExp(oldImageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImageUrl);
      
      // Write back to file
      fs.writeFileSync(filepath, content, 'utf8');
      
      console.log(`✓ Updated ${filename} - ${occurrences} image(s) resized to 200x200`);
      totalUpdates += occurrences;
    }
  });
}

// Process all directories
console.log('Updating Tony\'s circular photo to 200x200px...\n');

directories.forEach(dir => {
  console.log(`Processing ${path.basename(dir)} directory...`);
  processDirectory(dir);
  console.log('');
});

console.log(`\nComplete! Updated ${totalUpdates} image references to 200x200px.`);