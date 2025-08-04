import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing blog posts
const blogDir = path.join(__dirname, 'src', 'content', 'blog');

// Month mappings
const months = {
  'Jan': '01', 'January': '01',
  'Feb': '02', 'February': '02',
  'Mar': '03', 'March': '03',
  'Apr': '04', 'April': '04',
  'May': '05',
  'Jun': '06', 'June': '06',
  'Jul': '07', 'July': '07',
  'Aug': '08', 'August': '08',
  'Sep': '09', 'September': '09',
  'Oct': '10', 'October': '10',
  'Nov': '11', 'November': '11',
  'Dec': '12', 'December': '12'
};

let totalUpdates = 0;
let notFound = 0;

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
  
  // Look for date patterns in the content
  // Pattern 1: "* May 29" or "* December 15"
  const monthDayPattern = /\* ([A-Za-z]+) (\d{1,2})\s*\n/;
  
  // Pattern 2: "* 7 days ago" or "* 2 weeks ago"
  const daysAgoPattern = /\* (\d+) days? ago\s*\n/;
  const weeksAgoPattern = /\* (\d+) weeks? ago\s*\n/;
  const monthsAgoPattern = /\* (\d+) months? ago\s*\n/;
  
  // Pattern 3: "Updated: Nov 22, 2024"
  const updatedPattern = /Updated: ([A-Za-z]+) (\d{1,2}), (\d{4})/;
  
  let newDate = null;
  
  // Try to find a date
  const updatedMatch = content.match(updatedPattern);
  if (updatedMatch) {
    const month = months[updatedMatch[1]];
    const day = updatedMatch[2].padStart(2, '0');
    const year = updatedMatch[3];
    newDate = `${year}-${month}-${day}`;
  } else {
    const monthDayMatch = content.match(monthDayPattern);
    if (monthDayMatch) {
      const month = months[monthDayMatch[1]];
      const day = monthDayMatch[2].padStart(2, '0');
      // Assume current year if just month/day
      const year = '2024'; // Most posts seem to be from 2024
      newDate = `${year}-${month}-${day}`;
    } else {
      // Check for relative dates
      const daysMatch = content.match(daysAgoPattern);
      const weeksMatch = content.match(weeksAgoPattern);
      const monthsMatch = content.match(monthsAgoPattern);
      
      if (daysMatch) {
        const daysAgo = parseInt(daysMatch[1]);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        newDate = date.toISOString().split('T')[0];
      } else if (weeksMatch) {
        const weeksAgo = parseInt(weeksMatch[1]);
        const date = new Date();
        date.setDate(date.getDate() - (weeksAgo * 7));
        newDate = date.toISOString().split('T')[0];
      } else if (monthsMatch) {
        const monthsAgo = parseInt(monthsMatch[1]);
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);
        newDate = date.toISOString().split('T')[0];
      }
    }
  }
  
  if (newDate) {
    // Update the pubDate in frontmatter
    content = content.replace(/pubDate: "[^"]+"/m, `pubDate: "${newDate}"`);
    
    // Write back to file
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✓ Updated ${filename} - Date: ${newDate}`);
    totalUpdates++;
  } else {
    console.log(`  No date found for ${filename}`);
    notFound++;
  }
});

console.log(`\nComplete! Updated ${totalUpdates} blog posts with correct dates.`);
console.log(`Could not find dates for ${notFound} posts.`);