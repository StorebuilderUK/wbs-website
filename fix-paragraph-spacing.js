import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';

// Configuration
const config = {
  contentDirs: ['src/content/blog', 'src/content/pages'],
  backupDir: 'spacing-backup',
  dryRun: false // Set to true to preview changes
};

// Process a single file
async function processFile(filepath) {
  try {
    let content = await fs.readFile(filepath, 'utf-8');
    let originalContent = content;
    
    // Split content into lines
    let lines = content.split('\n');
    let fixedLines = [];
    let inFrontmatter = false;
    let inCodeBlock = false;
    let lastLineWasEmpty = true; // Start true to avoid empty line at beginning
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Track frontmatter
      if (line === '---') {
        inFrontmatter = !inFrontmatter;
        fixedLines.push(line);
        lastLineWasEmpty = false;
        continue;
      }
      
      // Skip processing in frontmatter
      if (inFrontmatter) {
        fixedLines.push(line);
        lastLineWasEmpty = false;
        continue;
      }
      
      // Track code blocks
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        // Add blank line before code block if needed
        if (!lastLineWasEmpty && !inCodeBlock) {
          fixedLines.push('');
        }
        fixedLines.push(line);
        // Add blank line after code block
        if (!inCodeBlock && i < lines.length - 1) {
          fixedLines.push('');
          lastLineWasEmpty = true;
        } else {
          lastLineWasEmpty = false;
        }
        continue;
      }
      
      // Skip processing in code blocks
      if (inCodeBlock) {
        fixedLines.push(line);
        lastLineWasEmpty = false;
        continue;
      }
      
      // Handle different line types
      if (trimmedLine === '') {
        // Empty line - only add if last line wasn't empty
        if (!lastLineWasEmpty) {
          fixedLines.push('');
          lastLineWasEmpty = true;
        }
      } else if (trimmedLine === ' ') {
        // Line with just a space - treat as empty
        if (!lastLineWasEmpty) {
          fixedLines.push('');
          lastLineWasEmpty = true;
        }
      } else if (trimmedLine.startsWith('#')) {
        // Heading - ensure blank line before (unless at start or after blank)
        if (!lastLineWasEmpty && fixedLines.length > 0) {
          fixedLines.push('');
        }
        fixedLines.push(line);
        lastLineWasEmpty = false;
      } else if (trimmedLine.startsWith('*') || trimmedLine.match(/^\d+\./)) {
        // List item - don't add extra spacing between list items
        fixedLines.push(line);
        lastLineWasEmpty = false;
      } else if (trimmedLine.startsWith('>')) {
        // Blockquote - ensure blank line before if not continuing quote
        if (!lastLineWasEmpty && fixedLines.length > 0 && !fixedLines[fixedLines.length - 1].trim().startsWith('>')) {
          fixedLines.push('');
        }
        fixedLines.push(line);
        lastLineWasEmpty = false;
      } else if (trimmedLine.startsWith('[](') || trimmedLine.match(/^!\[.*\]\(.*\)$/)) {
        // Link or image on its own line - add spacing
        if (!lastLineWasEmpty) {
          fixedLines.push('');
        }
        fixedLines.push(line);
        if (i < lines.length - 1) {
          fixedLines.push('');
          lastLineWasEmpty = true;
        } else {
          lastLineWasEmpty = false;
        }
      } else {
        // Regular paragraph
        // Check if this is starting a new paragraph (not continuing from previous line)
        const prevLine = i > 0 ? lines[i - 1].trim() : '';
        const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
        
        // Add blank line before if previous line was content and this looks like a new paragraph
        if (!lastLineWasEmpty && prevLine && !prevLine.startsWith('*') && !prevLine.match(/^\d+\./) && 
            (trimmedLine.match(/^[A-Z]/) || trimmedLine.startsWith('**'))) {
          fixedLines.push('');
        }
        
        fixedLines.push(line);
        
        // Add blank line after if next line looks like a new paragraph
        if (nextLine && !nextLine.startsWith('*') && !nextLine.match(/^\d+\./) && 
            (nextLine.match(/^[A-Z#>]/) || nextLine.startsWith('**') || nextLine === '')) {
          // Don't add if next line is already empty
          if (nextLine !== '' && nextLine !== ' ') {
            fixedLines.push('');
            lastLineWasEmpty = true;
          } else {
            lastLineWasEmpty = false;
          }
        } else {
          lastLineWasEmpty = false;
        }
      }
    }
    
    // Join lines back together
    let fixedContent = fixedLines.join('\n');
    
    // Clean up any triple+ blank lines
    fixedContent = fixedContent.replace(/\n{3,}/g, '\n\n');
    
    // Ensure file ends with single newline
    fixedContent = fixedContent.trimEnd() + '\n';
    
    // Check if content changed
    if (fixedContent === originalContent) {
      console.log(`⏭️  No spacing changes needed: ${filepath}`);
      return { modified: false };
    }
    
    if (config.dryRun) {
      console.log(`📄 Would fix spacing in: ${filepath}`);
      return { modified: true, dryRun: true };
    }
    
    // Create backup
    const backupPath = path.join(config.backupDir, path.relative('.', filepath));
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(filepath, backupPath);
    
    // Write updated content
    await fs.writeFile(filepath, fixedContent, 'utf-8');
    console.log(`✅ Fixed paragraph spacing in: ${filepath}`);
    
    return { modified: true };
    
  } catch (error) {
    console.error(`❌ Error processing ${filepath}:`, error.message);
    return { modified: false, error };
  }
}

// Main execution
async function main() {
  console.log('📝 Markdown Paragraph Spacing Fix');
  console.log('=================================\n');
  
  if (config.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  } else {
    console.log('⚠️  LIVE MODE - Files will be modified!');
    console.log(`📁 Backups will be saved to: ${config.backupDir}\n`);
  }
  
  // Find all markdown files
  const patterns = config.contentDirs.map(dir => `${dir}/**/*.md`);
  const files = await globby(patterns);
  
  console.log(`Found ${files.length} markdown files to check\n`);
  
  // Process files
  let modifiedCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const result = await processFile(file);
    if (result.modified && !result.dryRun) modifiedCount++;
    if (result.error) errorCount++;
  }
  
  console.log('\n📝 Paragraph spacing fix complete!');
  console.log(`📊 Modified: ${modifiedCount} files`);
  console.log(`📊 Unchanged: ${files.length - modifiedCount - errorCount} files`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} files`);
  }
  
  if (config.dryRun) {
    console.log('\nTo apply changes, set dryRun: false in the config');
  }
}

// Run the script
main().catch(console.error);