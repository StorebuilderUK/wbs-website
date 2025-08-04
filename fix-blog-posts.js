import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const blogDir = path.join(__dirname, 'src', 'content', 'blog');
const backupDir = path.join(__dirname, 'src', 'content', 'blog-backup');

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Function to convert title from slug
function titleFromSlug(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Function to extract clean description
function createDescription(title, content) {
  // Try to extract first paragraph of actual content
  const lines = content.split('\n').filter(line => line.trim());
  const firstContent = lines.find(line => 
    !line.startsWith('#') && 
    !line.startsWith('!') && 
    !line.includes('](') &&
    line.length > 50
  );
  
  if (firstContent) {
    return firstContent.trim().substring(0, 160) + '...';
  }
  
  // Fallback description based on title
  return `Learn about ${title.toLowerCase()} and how it can help your business grow.`;
}

// Process each markdown file
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
let processedCount = 0;
let errorCount = 0;
const report = [];

console.log(`Found ${files.length} blog posts to process...\n`);

files.forEach(file => {
  try {
    const filePath = path.join(blogDir, file);
    const backupPath = path.join(backupDir, file);
    
    // Read the file and normalize line endings
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Create backup
    fs.writeFileSync(backupPath, content);
    
    // Extract frontmatter and body
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      console.log(`❌ No frontmatter found in ${file}`);
      console.log(`First 100 chars: ${content.substring(0, 100)}`);
      errorCount++;
      return;
    }
    
    const [, frontmatter, body] = frontmatterMatch;
    
    // Parse frontmatter
    const fm = {};
    frontmatter.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        const value = valueParts.join(':').trim();
        fm[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    });
    
    // Fix frontmatter
    const updatedFm = {
      title: fm.title === 'Untitled Blog Post' || !fm.title 
        ? titleFromSlug(fm.slug || file.replace('.md', '')) 
        : fm.title,
      description: fm.description || createDescription(
        fm.title || titleFromSlug(fm.slug || file.replace('.md', '')), 
        body
      ),
      pubDate: fm.date || fm.migrated_date || '2024-01-01',
      author: fm.author || 'Tony Cooper',
      heroImage: fm.featured_image || fm.heroImage || '',
      category: fm.categories && fm.categories[0] ? fm.categories[0] : 'General',
      tags: Array.isArray(fm.tags) ? fm.tags : []
    };
    
    // Remove quotes from dates
    if (updatedFm.pubDate.includes('"') || updatedFm.pubDate.includes("'")) {
      updatedFm.pubDate = updatedFm.pubDate.replace(/['"]/g, '');
    }
    
    // Build new frontmatter
    const newFrontmatter = `---
title: "${updatedFm.title}"
description: "${updatedFm.description}"
pubDate: ${updatedFm.pubDate}
author: "${updatedFm.author}"
category: "${updatedFm.category}"
tags: ${JSON.stringify(updatedFm.tags)}
${updatedFm.heroImage ? `heroImage: "${updatedFm.heroImage}"` : ''}
---`;
    
    // Check if body has actual content
    const hasContent = body.trim().length > 100 && !body.includes('The age of "vibe coding"');
    
    // If no real content, add placeholder
    const newBody = hasContent ? body : `
# ${updatedFm.title}

${updatedFm.description}

*[This content needs to be added from the original Wix post. The Wix export didn't capture the full article content.]*

## Key Points

- Topic: ${updatedFm.title}
- Category: ${updatedFm.category}
- Published: ${new Date(updatedFm.pubDate).toLocaleDateString()}

---

*Note: This is a placeholder. The original content from Wix needs to be manually added.*
`;
    
    // Write updated file
    const updatedContent = `${newFrontmatter}\n${newBody}`;
    fs.writeFileSync(filePath, updatedContent);
    
    processedCount++;
    report.push({
      file,
      status: 'success',
      title: updatedFm.title,
      hasContent
    });
    
    console.log(`✅ Processed: ${file}`);
    
  } catch (error) {
    console.log(`❌ Error processing ${file}: ${error.message}`);
    errorCount++;
    report.push({
      file,
      status: 'error',
      error: error.message
    });
  }
});

// Generate report
const reportContent = `# Blog Migration Report
Generated: ${new Date().toISOString()}

## Summary
- Total files: ${files.length}
- Successfully processed: ${processedCount}
- Errors: ${errorCount}

## Files Needing Content
${report
  .filter(r => r.status === 'success' && !r.hasContent)
  .map(r => `- ${r.file}: ${r.title}`)
  .join('\n')}

## Successfully Migrated
${report
  .filter(r => r.status === 'success' && r.hasContent)
  .map(r => `- ${r.file}: ${r.title}`)
  .join('\n')}

## Errors
${report
  .filter(r => r.status === 'error')
  .map(r => `- ${r.file}: ${r.error}`)
  .join('\n')}
`;

fs.writeFileSync(path.join(__dirname, 'migration-report.md'), reportContent);

console.log('\n=================================');
console.log(`Migration complete!`);
console.log(`✅ Processed: ${processedCount} files`);
console.log(`❌ Errors: ${errorCount} files`);
console.log(`📁 Backups saved to: ${backupDir}`);
console.log(`📄 Report saved to: migration-report.md`);
console.log('=================================\n');