import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';

// Fix URLs that were broken by adding spaces
async function fixUrls(content) {
  // Fix URLs with spaces
  content = content.replace(/https:\/\/www\. webuildstores\. co\. uk/g, 'https://www.webuildstores.co.uk');
  content = content.replace(/https:\/\/www\. /g, 'https://www.');
  content = content.replace(/\. com/g, '.com');
  content = content.replace(/\. co\. uk/g, '.co.uk');
  content = content.replace(/\. org\. uk/g, '.org.uk');
  content = content.replace(/\. org/g, '.org');
  content = content.replace(/\. net/g, '.net');
  
  // Fix other common URL patterns
  content = content.replace(/https: \/\//g, 'https://');
  content = content.replace(/http: \/\//g, 'http://');
  
  // Fix markdown links that got spaces added
  content = content.replace(/\]\(([^)]+)\)/g, (match, url) => {
    const fixedUrl = url.replace(/ /g, '');
    return `](${fixedUrl})`;
  });
  
  return content;
}

async function processFile(filepath) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const fixed = await fixUrls(content);
    
    if (content !== fixed) {
      await fs.writeFile(filepath, fixed, 'utf-8');
      console.log(`✅ Fixed URLs in: ${filepath}`);
    } else {
      console.log(`⏭️  No URL fixes needed: ${filepath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filepath}:`, error.message);
  }
}

async function main() {
  console.log('🔧 URL Fix Script');
  console.log('=================\n');
  
  const patterns = ['src/content/blog/**/*.md', 'src/content/pages/**/*.md'];
  const files = await globby(patterns);
  
  console.log(`Found ${files.length} markdown files to check\n`);
  
  for (const file of files) {
    await processFile(file);
  }
  
  console.log('\n✨ URL fixes complete!');
}

main().catch(console.error);