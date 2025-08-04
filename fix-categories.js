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
  
  // Fix broken category fields
  if (content.includes('category: "["')) {
    content = content.replace('category: "["', 'category: "General"');
    fs.writeFileSync(filePath, content);
    console.log(`Fixed category in: ${file}`);
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files with broken categories.`);