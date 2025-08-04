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
  let originalContent = content;
  
  // Remove the category navigation block
  // Pattern to match the navigation text block
  const patterns = [
    // Pattern 1: With Tony's photo and signature before it
    /!\[Photo-Tony-CIRCULAR[^\]]*\]\([^)]+\)\s*\n\s*!\[Signature[^\]]*\]\([^)]+\)\s*\n\s*Put My Crackerjack[^]*?Search\s*\n/g,
    // Pattern 2: Just the navigation text
    /Put My Crackerjack Digital Marketing Skills[^]*?Search\s*\n/g,
    // Pattern 3: Individual lines
    /Put My Crackerjack Digital Marketing Skills To Work On Your Next Website Design Project!\s*\n/g,
    /\[Get Started\]\(https:\/\/www\.webuildstores\.co\.uk\/contact\)\s*\n/g,
    /\* \[All Posts\]\(https:\/\/www\.webuildstores\.co\.uk\/blog\)\s*\n/g,
    /\* \[Blogging\]\(https:\/\/www\.webuildstores\.co\.uk\/blog\/categories\/blogging\)\s*\n/g,
    /\* \[Social Media\]\(https:\/\/www\.webuildstores\.co\.uk\/blog\/categories\/social-media\)\s*\n/g,
    /\* \[Website Design\]\(https:\/\/www\.webuildstores\.co\.uk\/blog\/categories\/website-design\)\s*\n/g,
    /\* \[SEO\]\(https:\/\/www\.webuildstores\.co\.uk\/blog\/categories\/seo\)\s*\n/g,
    /\* \[Analytics\]\(https:\/\/www\.webuildstores\.co\.uk\/blog\/categories\/analytics\)\s*\n/g,
    /\* \[Branding\]\(https:\/\/www\.webuildstores\.co\.uk\/blog\/categories\/branding\)\s*\n/g,
    /Search\s*\n/g
  ];
  
  // Apply all patterns
  patterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });
  
  // Clean up extra newlines
  content = content.replace(/\n{4,}/g, '\n\n\n');
  
  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✓ Cleaned ${filename}`);
    totalUpdates++;
  }
});

console.log(`\nComplete! Cleaned ${totalUpdates} blog posts.`);