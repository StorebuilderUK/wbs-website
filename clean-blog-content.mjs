import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing blog posts
const blogDir = path.join(__dirname, 'src', 'content', 'blog');

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
  
  const frontmatter = parts[1];
  let bodyContent = parts.slice(2).join('---');
  
  // Remove duplicate title (the one starting with #)
  bodyContent = bodyContent.replace(/^\n*# .+\n\n/, '\n');
  
  // Remove the metadata lines
  bodyContent = bodyContent.replace(/^\*\*URL:\*\* .+\n/, '');
  bodyContent = bodyContent.replace(/^\*\*Meta Description:\*\* .+\n\n/, '');
  
  // Remove the --- separator after metadata
  bodyContent = bodyContent.replace(/^---\n\n/, '');
  
  // Clean up extra newlines at the start
  bodyContent = bodyContent.replace(/^\n+/, '\n');
  
  // Reconstruct the file
  const newContent = `---${frontmatter}---\n${bodyContent}`;
  
  // Write back to file
  fs.writeFileSync(filepath, newContent, 'utf8');
  console.log(`✓ Cleaned ${filename}`);
});

console.log('\nAll blog posts cleaned!');