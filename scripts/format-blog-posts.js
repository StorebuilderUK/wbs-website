import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blogDir = path.join(dirname(__dirname), 'src', 'content', 'blog');

// Read all MDX files
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.mdx'));

let totalFiles = 0;
let fixes = {
  spacing: 0,
  headers: 0,
  formatting: 0,
  lists: 0,
  quotes: 0,
  links: 0
};

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Split content into frontmatter and body
  const parts = content.split('---');
  const frontmatter = parts[1];
  let body = parts.slice(2).join('---');
  
  // Fix spacing issues
  // Remove multiple consecutive blank lines
  body = body.replace(/\n{3,}/g, '\n\n');
  
  // Ensure proper spacing before ## headers
  body = body.replace(/([^\n])\n(##\s)/g, '$1\n\n$2');
  
  // Ensure proper spacing before ### headers
  body = body.replace(/([^\n])\n(###\s)/g, '$1\n\n$2');
  
  // Remove empty headers
  body = body.replace(/##\s*\n/g, '');
  body = body.replace(/###\s*\n/g, '');
  
  // Fix first paragraph after hero image - remove bold/italic
  const heroImageMatch = body.match(/<BlogHeroImage[^>]*\/>\s*\n/);
  if (heroImageMatch) {
    const afterHeroImage = body.substring(heroImageMatch.index + heroImageMatch[0].length);
    const firstParagraphMatch = afterHeroImage.match(/^(.+?)(?:\n\n|$)/);
    
    if (firstParagraphMatch && firstParagraphMatch[1]) {
      let firstParagraph = firstParagraphMatch[1];
      const originalFirstParagraph = firstParagraph;
      
      // Remove bold and italic formatting from first paragraph
      firstParagraph = firstParagraph.replace(/\*\*_(.+?)_\*\*/g, '$1');
      firstParagraph = firstParagraph.replace(/\*\*(.+?)\*\*/g, '$1');
      firstParagraph = firstParagraph.replace(/_(.+?)_/g, '$1');
      firstParagraph = firstParagraph.replace(/\*(.+?)\*/g, '$1');
      
      if (firstParagraph !== originalFirstParagraph) {
        body = body.replace(originalFirstParagraph, firstParagraph);
        fixes.formatting++;
      }
    }
  }
  
  // Fix list spacing
  body = body.replace(/([^\n])\n(\s*[-*]\s)/g, '$1\n\n$2');
  body = body.replace(/(\s*[-*]\s.+)\n([^\s*[-])/g, '$1\n\n$2');
  
  // Fix quote spacing
  body = body.replace(/([^\n])\n(>\s)/g, '$1\n\n$2');
  body = body.replace(/(>\s.+)\n([^>])/g, '$1\n\n$2');
  
  // Standardize list markers to -
  body = body.replace(/^\s*\*\s/gm, ' - ');
  
  // Fix broken markdown links
  body = body.replace(/\[([^\]]+)\]\s+\(([^)]+)\)/g, '[$1]($2)');
  
  // Clean up extra spaces at end of lines
  body = body.replace(/ +$/gm, '');
  
  // Reconstruct the file
  const newContent = `---${frontmatter}---${body}`;
  
  if (newContent !== originalContent) {
    fs.writeFileSync(filePath, newContent);
    totalFiles++;
    
    // Count fixes
    if (body.match(/\n{2,}##/)) fixes.spacing++;
    if (body.includes('###')) fixes.headers++;
    if (!body.includes('**_') && originalContent.includes('**_')) fixes.formatting++;
    if (body.includes(' - ') && !originalContent.includes(' - ')) fixes.lists++;
  }
  
  console.log(`Processed: ${file}`);
});

console.log(`\nFormatting complete!`);
console.log(`Files updated: ${totalFiles}`);
console.log(`Fixes applied:`);
console.log(`- Spacing fixes: ${fixes.spacing}`);
console.log(`- Header fixes: ${fixes.headers}`);
console.log(`- Formatting fixes: ${fixes.formatting}`);
console.log(`- List fixes: ${fixes.lists}`);