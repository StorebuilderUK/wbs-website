import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing blog posts
const blogDir = path.join(__dirname, 'src', 'content', 'blog');

// Correct dates from the live website
const correctDates = {
  'effortless-business-growth.md': '2025-04-17',
  'hire-a-website-designer.md': '2023-10-09',
  'how-much-does-a-wix-website-cost-to-build.md': '2023-11-18',
  'introduction-to-seo.md': '2024-06-28',
  'local-seo-strategies.md': '2024-05-28',
  'pre-made-logos-podcast-cover-art.md': '2024-02-29',
  'pre-made-trades-logos.md': '2024-09-05',
  'starting-a-small-business-blog.md': '2022-01-24',
  'the-best-mobile-credit-card-machines-for-uk-small-business.md': '2022-06-01',
  'wix-ecommerce-design.md': '2024-08-29',
  'your-169-pathway-to-success.md': '2023-06-30'
};

let totalUpdates = 0;

// Process each file
Object.entries(correctDates).forEach(([filename, newDate]) => {
  const filepath = path.join(blogDir, filename);
  
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Update the pubDate
    content = content.replace(/pubDate: "[^"]+"/m, `pubDate: "${newDate}"`);
    
    // Write back to file
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✓ Updated ${filename} - Date: ${newDate}`);
    totalUpdates++;
  } else {
    console.log(`✗ File not found: ${filename}`);
  }
});

console.log(`\nComplete! Updated ${totalUpdates} blog posts with correct dates from the live website.`);