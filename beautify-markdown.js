import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';

// Configuration
const config = {
  // Directories to process
  contentDirs: ['src/content/blog', 'src/content/pages'],
  
  // Backup directory
  backupDir: 'markdown-backup',
  
  // Dry run mode (true = preview changes, false = apply changes)
  dryRun: false
};

// Formatting rules
const formatRules = {
  // Remove duplicate titles (H1 after frontmatter)
  removeDuplicateTitles: true,
  
  // Remove metadata lines (URL:, Meta Description:, etc)
  removeMetadataLines: true,
  
  // Remove author/date/read time bullets
  removeAuthorDateBullets: true,
  
  // Fix spacing issues
  fixSpacing: true,
  
  // Fix bold/italic formatting
  fixEmphasis: true,
  
  // Clean up links
  cleanLinks: true,
  
  // Remove empty lines
  removeExcessiveEmptyLines: true,
  
  // Fix quotes
  fixQuotes: true
};

// Main beautification function
async function beautifyMarkdown(content, filename) {
  let lines = content.split('\n');
  let inFrontmatter = false;
  let frontmatterEnd = 0;
  let processedLines = [];
  
  // First pass: identify frontmatter
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
      } else {
        frontmatterEnd = i;
        break;
      }
    }
  }
  
  // Keep frontmatter as-is
  processedLines = lines.slice(0, frontmatterEnd + 1);
  
  // Process content after frontmatter
  let contentLines = lines.slice(frontmatterEnd + 1);
  let newContentLines = [];
  let skipNextLines = 0;
  
  for (let i = 0; i < contentLines.length; i++) {
    if (skipNextLines > 0) {
      skipNextLines--;
      continue;
    }
    
    let line = contentLines[i];
    let trimmedLine = line.trim();
    
    // Skip duplicate H1 title (usually appears right after frontmatter)
    if (formatRules.removeDuplicateTitles && i < 5 && trimmedLine.startsWith('# ')) {
      continue;
    }
    
    // Skip metadata lines
    if (formatRules.removeMetadataLines) {
      if (trimmedLine.startsWith('**URL:**') || 
          trimmedLine.startsWith('**Meta Description:**') ||
          trimmedLine === '---' && i < 10) {
        continue;
      }
    }
    
    // Skip author/date/read time bullets
    if (formatRules.removeAuthorDateBullets) {
      if (trimmedLine.includes('min read') || 
          (trimmedLine.startsWith('* ') && i < 20 && 
           (trimmedLine.includes('Updated:') || 
            trimmedLine.includes('https://www.webuildstores.co.uk/profile/')))) {
        // Also skip the "Updated:" line that follows
        if (i + 1 < contentLines.length && contentLines[i + 1].trim().startsWith('Updated:')) {
          skipNextLines = 1;
        }
        continue;
      }
      // Skip standalone "Updated:" lines
      if (trimmedLine.startsWith('Updated:')) {
        continue;
      }
    }
    
    // Fix spacing and formatting
    if (formatRules.fixSpacing) {
      // Remove multiple spaces (but not in URLs)
      line = line.replace(/(?<!:\/\/)  +/g, ' ');
      
      // Fix space before punctuation (but not in URLs)
      // First, protect URLs
      let urlMatches = [];
      line = line.replace(/(https?:\/\/[^\s\)]+)/g, (match, url) => {
        urlMatches.push(url);
        return `__URL_${urlMatches.length - 1}__`;
      });
      
      // Now fix spacing
      line = line.replace(/ ([,.:;!?])/g, '$1');
      line = line.replace(/([,:;!?])([A-Za-z])/g, '$1 $2');
      
      // Restore URLs
      urlMatches.forEach((url, index) => {
        line = line.replace(`__URL_${index}__`, url);
      });
    }
    
    // Fix emphasis formatting
    if (formatRules.fixEmphasis) {
      // Fix weird bold+italic combinations like **_text_**
      line = line.replace(/\*\*_([^_]+)_\*\*/g, '**$1**');
      line = line.replace(/_\*\*([^*]+)\*\*_/g, '**$1**');
      
      // Fix spaces around emphasis
      line = line.replace(/\*\* +/g, '**');
      line = line.replace(/ +\*\*/g, '**');
      line = line.replace(/_ +/g, '_');
      line = line.replace(/ +_/g, '_');
      
      // Fix unclosed emphasis
      const boldCount = (line.match(/\*\*/g) || []).length;
      if (boldCount % 2 === 1) {
        line = line.replace(/\*\*([^*]+)$/, '**$1**');
      }
    }
    
    // Clean links
    if (formatRules.cleanLinks) {
      // Remove self-referential links
      line = line.replace(/\[([^\]]+)\]\(https:\/\/www\.webuildstores\.co\.uk\/blog\)/g, '$1');
      
      // Fix link spacing
      line = line.replace(/\] +\(/g, '](');
    }
    
    // Fix quotes
    if (formatRules.fixQuotes) {
      // Ensure quotes are on their own lines with proper spacing
      if (trimmedLine.startsWith('> ') && i > 0 && contentLines[i-1].trim() !== '') {
        newContentLines.push('');
      }
    }
    
    newContentLines.push(line);
  }
  
  // Remove excessive empty lines
  if (formatRules.removeExcessiveEmptyLines) {
    let finalLines = [];
    let emptyCount = 0;
    
    for (let line of newContentLines) {
      if (line.trim() === '') {
        emptyCount++;
        if (emptyCount <= 2) {
          finalLines.push(line);
        }
      } else {
        emptyCount = 0;
        finalLines.push(line);
      }
    }
    
    newContentLines = finalLines;
  }
  
  // Ensure single empty line before headers
  let headerFixedLines = [];
  for (let i = 0; i < newContentLines.length; i++) {
    let line = newContentLines[i];
    let trimmedLine = line.trim();
    
    // Add empty line before headers (except first line)
    if (trimmedLine.match(/^#{1,6} /) && i > 0 && newContentLines[i-1].trim() !== '') {
      headerFixedLines.push('');
    }
    
    headerFixedLines.push(line);
  }
  
  // Combine frontmatter and processed content
  let result = [...processedLines, ...headerFixedLines].join('\n');
  
  // Final cleanup
  result = result.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
  result = result.trim() + '\n'; // Ensure file ends with single newline
  
  return result;
}

// Process a single file
async function processFile(filepath) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const beautified = await beautifyMarkdown(content, path.basename(filepath));
    
    if (config.dryRun) {
      console.log(`\n📄 Would process: ${filepath}`);
      console.log('First 20 lines of output:');
      console.log(beautified.split('\n').slice(0, 20).join('\n'));
      console.log('...\n');
    } else {
      // Create backup
      const backupPath = path.join(config.backupDir, path.relative('.', filepath));
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.copyFile(filepath, backupPath);
      
      // Write beautified content
      await fs.writeFile(filepath, beautified, 'utf-8');
      console.log(`✅ Beautified: ${filepath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filepath}:`, error.message);
  }
}

// Main execution
async function main() {
  console.log('🎨 Markdown Beautification Script');
  console.log('==================================\n');
  
  if (config.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  } else {
    console.log('⚠️  LIVE MODE - Files will be modified!');
    console.log(`📁 Backups will be saved to: ${config.backupDir}\n`);
  }
  
  // Find all markdown files
  const patterns = config.contentDirs.map(dir => `${dir}/**/*.md`);
  const files = await globby(patterns);
  
  console.log(`Found ${files.length} markdown files to process\n`);
  
  // Process files
  for (const file of files) {
    await processFile(file);
  }
  
  console.log('\n✨ Beautification complete!');
  
  if (config.dryRun) {
    console.log('\nTo apply changes, set dryRun: false in the config');
  }
}

// Run the script
main().catch(console.error);