import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing blog posts
const blogDir = path.join(__dirname, 'src', 'content', 'blog');

// Manual date corrections for posts that couldn't be automatically dated
// These dates should be updated based on the actual dates from https://www.webuildstores.co.uk/blog
const manualDateCorrections = {
  'effortless-business-growth.md': '2024-11-08', // Update with correct date
  'hire-a-website-designer.md': '2024-10-15', // Update with correct date
  'how-much-does-a-wix-website-cost-to-build.md': '2024-09-20', // Update with correct date
  'introduction-to-seo.md': '2023-02-10', // Update with correct date
  'local-seo-strategies.md': '2024-08-12', // Update with correct date
  'pre-made-logos-podcast-cover-art.md': '2023-06-15', // Update with correct date
  'pre-made-trades-logos.md': '2023-07-20', // Update with correct date
  'starting-a-small-business-blog.md': '2023-01-05', // Update with correct date
  'the-best-mobile-credit-card-machines-for-uk-small-business.md': '2023-09-18', // Update with correct date
  'wix-ecommerce-design.md': '2024-02-28', // Update with correct date
  'your-169-pathway-to-success.md': '2024-10-01', // Update with correct date
};

let totalUpdates = 0;

// Process each file that needs updating
Object.entries(manualDateCorrections).forEach(([filename, newDate]) => {
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

console.log(`\nComplete! Updated ${totalUpdates} blog posts with manual date corrections.`);
console.log("\nIMPORTANT: The dates in this script are placeholders!");
console.log("Please update them with the actual dates from https://www.webuildstores.co.uk/blog");
console.log("\nTo find the correct dates:");
console.log("1. Visit https://www.webuildstores.co.uk/blog");
console.log("2. Look for each of these blog posts");
console.log("3. Note the publication date shown");
console.log("4. Update the dates in the 'manualDateCorrections' object");
console.log("5. Run this script again");