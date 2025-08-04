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
  firstParagraph: 0,
  spacing: 0,
  headers: 0,
  lists: 0,
  quotes: 0,
  links: 0,
  emptyHeaders: 0
};

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Split content into frontmatter and body
  const parts = content.split('---');
  const frontmatter = parts[1];
  let body = parts.slice(2).join('---');
  
  // Step 1: Clean up the first paragraph after hero image
  const heroImageMatch = body.match(/<BlogHeroImage[^>]*\/>\s*\n/);
  if (heroImageMatch) {
    const afterHeroIndex = heroImageMatch.index + heroImageMatch[0].length;
    const beforeHero = body.substring(0, afterHeroIndex);
    let afterHero = body.substring(afterHeroIndex);
    
    // Look for the first paragraph (up to double newline or next heading)
    const firstParaMatch = afterHero.match(/^(.+?)(?:\n\n|(?=\n##))/s);
    
    if (firstParaMatch && firstParaMatch[1]) {
      let firstParagraph = firstParaMatch[1].trim();
      const originalFirstPara = firstParagraph;
      
      // Remove all formatting from first paragraph
      firstParagraph = firstParagraph.replace(/\*\*_(.+?)_\*\*/g, '$1');
      firstParagraph = firstParagraph.replace(/\*\*(.+?)\*\*/g, '$1');
      firstParagraph = firstParagraph.replace(/_(.+?)_/g, '$1');
      firstParagraph = firstParagraph.replace(/\*(.+?)\*/g, '$1');
      
      // Clean up any remaining formatting artifacts
      firstParagraph = firstParagraph.replace(/\[_(.+?)_\]/g, '[$1]');
      firstParagraph = firstParagraph.replace(/\[__(.+?)__\]/g, '[$1]');
      
      if (firstParagraph !== originalFirstPara) {
        afterHero = afterHero.replace(originalFirstPara, firstParagraph);
        body = beforeHero + afterHero;
        fixes.firstParagraph++;
      }
    }
  }
  
  // Step 2: Fix spacing around headers
  // Add blank line before ## headers
  body = body.replace(/([^\n])\n(##\s)/g, '$1\n\n$2');
  // Add blank line before ### headers
  body = body.replace(/([^\n])\n(###\s)/g, '$1\n\n$2');
  
  // Step 3: Remove empty headers
  body = body.replace(/##\s*\n(?=\n)/g, '');
  body = body.replace(/###\s*\n(?=\n)/g, '');
  body = body.replace(/##\s*\n$/g, '');
  body = body.replace(/###\s*\n$/g, '');
  
  // Step 4: Fix list formatting
  // Ensure lists start with a blank line
  body = body.replace(/([^\n])\n(\s*[-*]\s)/g, '$1\n\n$2');
  // Ensure blank line after lists
  body = body.replace(/(\s*[-*]\s.+)(\n)([^-*\s\n])/g, '$1\n\n$3');
  
  // Standardize all lists to use - instead of *
  body = body.replace(/^\s*\*\s/gm, '- ');
  
  // Fix lists that are all on one line
  body = body.replace(/(-\s[^-\n]+)(-\s)/g, '$1\n$2');
  
  // Step 5: Fix quote formatting
  // Add blank line before quotes
  body = body.replace(/([^\n])\n(>\s)/g, '$1\n\n$2');
  // Add blank line after quotes
  body = body.replace(/(>\s.+)\n([^>\n])/g, '$1\n\n$2');
  
  // Step 6: Fix multiple consecutive blank lines
  body = body.replace(/\n{3,}/g, '\n\n');
  
  // Step 7: Clean up links
  // Fix broken markdown links with spaces
  body = body.replace(/\[([^\]]+)\]\s+\(([^)]+)\)/g, '[$1]($2)');
  
  // Step 8: Remove trailing spaces
  body = body.replace(/ +$/gm, '');
  
  // Step 9: Ensure proper spacing at end of file
  body = body.trimEnd() + '\n';
  
  // Reconstruct the file
  const newContent = `---${frontmatter}---${body}`;
  
  if (newContent !== originalContent) {
    fs.writeFileSync(filePath, newContent);
    totalFiles++;
  }
  
  console.log(`Processed: ${file}`);
});

console.log(`\nDeep formatting complete!`);
console.log(`Files updated: ${totalFiles}`);
console.log(`Fixes applied:`);
console.log(`- First paragraph formatting removed: ${fixes.firstParagraph}`);
console.log(`- Spacing fixes: ${fixes.spacing}`);
console.log(`- Empty headers removed: ${fixes.emptyHeaders}`);
console.log(`- List formatting: ${fixes.lists}`);