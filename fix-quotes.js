import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(__dirname, 'src', 'content', 'blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix smart quotes in YAML frontmatter
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    let frontmatter = frontmatterMatch[1];
    const originalFrontmatter = frontmatter;
    
    // Replace smart quotes with escaped regular quotes in descriptions
    frontmatter = frontmatter.replace(/description: "(.*?)"/g, (match, desc) => {
      const fixedDesc = desc.replace(/[""]/g, '\\"').replace(/['']/g, "'");
      return `description: "${fixedDesc}"`;
    });
    
    // Do the same for titles
    frontmatter = frontmatter.replace(/title: "(.*?)"/g, (match, title) => {
      const fixedTitle = title.replace(/[""]/g, '\\"').replace(/['']/g, "'");
      return `title: "${fixedTitle}"`;
    });
    
    if (frontmatter !== originalFrontmatter) {
      content = content.replace(originalFrontmatter, frontmatter);
      fs.writeFileSync(filePath, content);
      console.log(`Fixed quotes in: ${file}`);
      fixedCount++;
      modified = true;
    }
  }
});

console.log(`\nFixed ${fixedCount} files with quote issues.`);