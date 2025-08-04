import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing blog posts
const blogDir = path.join(__dirname, 'src', 'content', 'blog');

// Manual mapping of blog posts to their correct dates from the live site
// I'll need to fetch this data from the website
const correctDates = {
  // This will be populated after fetching from the website
};

// First, let's create a script to help identify which posts need dates
console.log("Blog posts that need correct dates:\n");

fs.readdirSync(blogDir).forEach(filename => {
  if (!filename.endsWith('.md')) return;
  
  const filepath = path.join(blogDir, filename);
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Extract current date and original URL
  const dateMatch = content.match(/pubDate: "([^"]+)"/);
  const urlMatch = content.match(/originalUrl: "([^"]+)"/);
  const titleMatch = content.match(/title: "([^"]+)"/);
  
  if (dateMatch && urlMatch) {
    const currentDate = dateMatch[1];
    const originalUrl = urlMatch[1];
    const title = titleMatch ? titleMatch[1] : filename;
    
    console.log(`File: ${filename}`);
    console.log(`Title: ${title}`);
    console.log(`Current Date: ${currentDate}`);
    console.log(`Original URL: ${originalUrl}`);
    console.log('---');
  }
});

console.log("\nPlease visit https://www.webuildstores.co.uk/blog to get the correct dates for each post.");
console.log("Then update the 'correctDates' object in this script with the mapping.");