import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(__dirname, 'src', 'content', 'blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

let fixedCount = 0;
const errors = [];

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  try {
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      let frontmatter = frontmatterMatch[1];
      let modified = false;
      
      // Fix each line in frontmatter
      const lines = frontmatter.split('\n');
      const fixedLines = lines.map(line => {
        // Check if this is a description or title line
        if (line.startsWith('description:') || line.startsWith('title:')) {
          // Check if there are unescaped quotes within the value
          const match = line.match(/^(description|title):\s*"(.*)"$/);
          if (match) {
            const [, key, value] = match;
            // Remove any smart quotes and problematic characters
            let fixedValue = value
              .replace(/[""]/g, "'") // Replace smart quotes with single quotes
              .replace(/['']/g, "'") // Replace smart single quotes
              .replace(/…/g, "...") // Replace ellipsis
              .trim();
            
            // If the value still contains quotes, we need to handle them
            if (fixedValue.includes('"')) {
              fixedValue = fixedValue.replace(/"/g, "'");
            }
            
            modified = true;
            return `${key}: "${fixedValue}"`;
          }
        }
        return line;
      });
      
      if (modified) {
        const newFrontmatter = fixedLines.join('\n');
        content = content.replace(frontmatterMatch[0], `---\n${newFrontmatter}\n---`);
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${file}`);
        fixedCount++;
      }
    }
  } catch (error) {
    errors.push({ file, error: error.message });
  }
});

console.log(`\nFixed ${fixedCount} files.`);
if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(({ file, error }) => {
    console.log(`- ${file}: ${error}`);
  });
}