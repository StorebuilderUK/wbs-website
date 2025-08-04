const fs = require('fs');
const path = require('path');

// Directory containing blog posts
const blogDir = path.join(__dirname, 'src', 'content', 'blog');

// Categories mapping based on content
const categoryMapping = {
  'seo': ['seo', 'search-engine', 'keyword', 'ranking', 'google'],
  'website-design': ['website', 'design', 'wix', 'wordpress', 'shopify', 'magento'],
  'marketing': ['marketing', 'social-media', 'facebook', 'instagram', 'twitter', 'lead-generation'],
  'business': ['business', 'growth', 'small-business', 'entrepreneur'],
  'ecommerce': ['ecommerce', 'shop', 'store', 'selling', 'product'],
  'content': ['content', 'blog', 'writing', 'copy', 'copywriting'],
  'technology': ['ai', 'algorithm', 'python', 'django', 'code']
};

// Function to determine category based on title and content
function determineCategory(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryMapping)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  return 'general';
}

// Function to extract tags from content
function extractTags(title, content) {
  const tags = new Set();
  const text = (title + ' ' + content).toLowerCase();
  
  // Common tags to look for
  const commonTags = [
    'seo', 'website design', 'marketing', 'small business', 'ecommerce',
    'social media', 'content marketing', 'wix', 'shopify', 'wordpress',
    'ai', 'growth', 'strategy', 'tips', 'guide', 'tutorial'
  ];
  
  commonTags.forEach(tag => {
    if (text.includes(tag)) {
      tags.add(tag);
    }
  });
  
  // Limit to 5 tags
  return Array.from(tags).slice(0, 5);
}

// Process each markdown file
fs.readdirSync(blogDir).forEach(filename => {
  if (!filename.endsWith('.md')) return;
  
  const filepath = path.join(blogDir, filename);
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Skip if already has frontmatter
  if (content.startsWith('---')) {
    console.log(`Skipping ${filename} - already has frontmatter`);
    return;
  }
  
  // Extract title and meta description
  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : filename.replace('.md', '').replace(/-/g, ' ');
  
  const metaDescMatch = content.match(/\*\*Meta Description:\*\* (.+)$/m);
  const description = metaDescMatch ? metaDescMatch[1].trim() : title;
  
  // Extract URL if present
  const urlMatch = content.match(/\*\*URL:\*\* (.+)$/m);
  const originalUrl = urlMatch ? urlMatch[1].trim() : '';
  
  // Determine category and tags
  const category = determineCategory(title, content);
  const tags = extractTags(title, content);
  
  // Create a date (using current date, you might want to extract from content if available)
  const pubDate = new Date().toISOString().split('T')[0];
  
  // Find first image in content for hero image
  const imageMatch = content.match(/!\[.*?\]\((.+?)\)/);
  const heroImage = imageMatch ? imageMatch[1] : null;
  
  // Create frontmatter
  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
pubDate: "${pubDate}"
category: "${category}"
tags: ${JSON.stringify(tags)}
${heroImage ? `heroImage: "${heroImage}"` : ''}
${originalUrl ? `originalUrl: "${originalUrl}"` : ''}
---

`;
  
  // Remove the original title and metadata lines
  content = content.replace(/^# .+\n\n/, ''); // Remove title
  content = content.replace(/\*\*URL:\*\* .+\n/, ''); // Remove URL line
  content = content.replace(/\*\*Meta Description:\*\* .+\n\n/, ''); // Remove meta description
  content = content.replace(/^---\n\n/, ''); // Remove separator
  
  // Add frontmatter to content
  const newContent = frontmatter + content;
  
  // Write back to file
  fs.writeFileSync(filepath, newContent, 'utf8');
  console.log(`✓ Updated ${filename}`);
  console.log(`  Category: ${category}`);
  console.log(`  Tags: ${tags.join(', ')}`);
});

console.log('\nAll blog posts updated with Astro frontmatter!');