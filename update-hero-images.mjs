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
  
  // Split frontmatter and content
  const parts = content.split('---');
  if (parts.length < 3) return;
  
  let frontmatter = parts[1];
  const bodyContent = parts.slice(2).join('---');
  
  // Look for the pattern of date followed by an image
  // Pattern: "* [date info]" followed by "* [time info]" then an image
  const datePattern = /\* \[.*?\]\(.*?\)\s*\n\s*\* .*?\s*\n\s*\* \d+ min read\s*\n\s*!\[.*?\]\((https:\/\/static\.wixstatic\.com\/media\/[^)]+)\)/;
  
  // Alternative pattern: just look for first image after "Search" or after the navigation menu
  const searchPattern = /Search\s*\n\s*#.*?\n.*?\n.*?\n!\[.*?\]\((https:\/\/static\.wixstatic\.com\/media\/[^)]+)\)/;
  
  // Another pattern: look for image after "min read"
  const minReadPattern = /min read\s*\n\s*!\[.*?\]\((https:\/\/static\.wixstatic\.com\/media\/[^)]+)\)/;
  
  let heroImageUrl = null;
  
  // Try different patterns to find the hero image
  let match = bodyContent.match(datePattern) || bodyContent.match(minReadPattern) || bodyContent.match(searchPattern);
  
  if (!match) {
    // If no pattern matches, look for any image that's NOT the Tony circular photo or signature
    const allImages = [...bodyContent.matchAll(/!\[.*?\]\((https:\/\/static\.wixstatic\.com\/media\/[^)]+)\)/g)];
    
    for (const imgMatch of allImages) {
      const imgUrl = imgMatch[1];
      // Skip Tony's photo and signature
      if (!imgUrl.includes('b0d63a_15ab6144f0084ab89ae5dee757358a72') && 
          !imgUrl.includes('6b7f88_4ab6ca94f0294629bd01283c7688cd7c') &&
          !imgUrl.includes('6b7f88_a675ac7772b54b729fec8f6a16b92078')) { // Also skip guarantee badge
        heroImageUrl = imgUrl;
        break;
      }
    }
  } else {
    heroImageUrl = match[1];
  }
  
  if (heroImageUrl) {
    // Update or add heroImage in frontmatter
    const heroImageLine = `heroImage: "${heroImageUrl}"`;
    
    if (frontmatter.includes('heroImage:')) {
      // Replace existing heroImage
      frontmatter = frontmatter.replace(/heroImage: ".*?"/, heroImageLine);
    } else {
      // Add heroImage after tags
      frontmatter = frontmatter.replace(/tags: \[.*?\]/, (match) => `${match}\n${heroImageLine}`);
    }
    
    // Reconstruct the file
    const newContent = `---${frontmatter}---${bodyContent}`;
    
    // Write back to file
    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log(`✓ Updated ${filename} - Hero image set`);
    totalUpdates++;
  } else {
    console.log(`  No suitable hero image found for ${filename}`);
  }
});

console.log(`\nComplete! Updated ${totalUpdates} blog posts with correct hero images.`);