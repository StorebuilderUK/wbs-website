const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to extract frontmatter from markdown files
function extractFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim();
      frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '');
    }
  }
  
  return frontmatter;
}

// Function to extract title and description from Astro files
function extractFromAstro(content, filePath) {
  // Check if it's using BaseLayout
  const layoutMatch = content.match(/BaseLayout.*?title\s*=\s*["'`]([^"'`]+)["'`].*?description\s*=\s*["'`]([^"'`]+)["'`]/s);
  if (layoutMatch) {
    return {
      title: layoutMatch[1],
      description: layoutMatch[2]
    };
  }
  
  // Fallback to check for any title/description props
  const titleMatch = content.match(/title\s*=\s*["'`]([^"'`]+)["'`]/);
  const descMatch = content.match(/description\s*=\s*["'`]([^"'`]+)["'`]/);
  
  return {
    title: titleMatch ? titleMatch[1] : 'No title found',
    description: descMatch ? descMatch[1] : 'No description found'
  };
}

console.log('SEO META DATA REPORT');
console.log('===================\n');

// Check pages directory
console.log('PAGES (.astro files)');
console.log('-------------------');
const pageFiles = glob.sync('src/pages/**/*.astro');
pageFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const meta = extractFromAstro(content, file);
  const route = file.replace('src/pages', '').replace('/index.astro', '/').replace('.astro', '');
  
  console.log(`Route: ${route}`);
  console.log(`Title: ${meta.title}`);
  console.log(`Description: ${meta.description}`);
  console.log(`File: ${file}`);
  console.log('');
});

// Check content/pages directory
console.log('\nCONTENT PAGES (.md files)');
console.log('------------------------');
const contentPages = glob.sync('src/content/pages/**/*.md');
contentPages.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const frontmatter = extractFrontmatter(content);
  const slug = path.basename(file, '.md');
  
  console.log(`Route: /${slug}`);
  console.log(`Title: ${frontmatter.title || 'No title found'}`);
  console.log(`Description: ${frontmatter.description || 'No description found'}`);
  console.log(`File: ${file}`);
  console.log('');
});

// Check content/blog directory
console.log('\nBLOG POSTS (.md files)');
console.log('---------------------');
const blogPosts = glob.sync('src/content/blog/**/*.md');
console.log(`Total blog posts: ${blogPosts.length}\n`);

// Just show first 5 as example
blogPosts.slice(0, 5).forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const frontmatter = extractFrontmatter(content);
  const slug = path.basename(file, '.md');
  
  console.log(`Route: /blog/${slug}`);
  console.log(`Title: ${frontmatter.title || 'No title found'}`);
  console.log(`Description: ${frontmatter.description || 'No description found'}`);
  console.log('');
});

if (blogPosts.length > 5) {
  console.log(`... and ${blogPosts.length - 5} more blog posts\n`);
}

// Summary
console.log('\nSUMMARY');
console.log('-------');
console.log(`Total pages: ${pageFiles.length}`);
console.log(`Total content pages: ${contentPages.length}`);
console.log(`Total blog posts: ${blogPosts.length}`);
console.log(`Total URLs: ${pageFiles.length + contentPages.length + blogPosts.length}`);