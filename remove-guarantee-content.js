import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';

// Configuration
const config = {
  contentDirs: ['src/content/blog', 'src/content/pages'],
  backupDir: 'guarantee-backup',
  dryRun: false // Set to true to preview changes
};

// Process a single file
async function processFile(filepath) {
  try {
    let content = await fs.readFile(filepath, 'utf-8');
    let updatedContent = content;
    let modified = false;
    
    // Remove guarantee images
    const guaranteeImagePatterns = [
      // Standard guarantee badge
      /!\[.*?750-750-WBS-Guarantee-1\.\s?jpg.*?\]\([^)]+\)/gi,
      // Money back guarantee with longer alt text
      /!\[.*?100%.*?[Gg]uarantee.*?\]\([^)]+750-750-WBS-Guarantee-1\.jpg[^)]*\)/gi,
      /!\[.*?Money Back Guarantee.*?\]\([^)]+WBS-Guarantee[^)]*\)/gi,
      // Any image with guarantee in the filename
      /!\[.*?\]\([^)]*guarantee[^)]*\.(?:jpg|jpeg|png|gif|webp)[^)]*\)/gi
    ];
    
    for (const pattern of guaranteeImagePatterns) {
      if (pattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(pattern, '');
        modified = true;
      }
    }
    
    // Remove guarantee text sections
    const guaranteeTextPatterns = [
      // Section headings with guarantee
      /###?\s*100%\s*Money[- ]Back\s*Guarantee[!]*\s*\n+/gi,
      /###?\s*Satisfaction\s*Guaranteed?\s*\n+/gi,
      
      // Paragraphs mentioning guarantee
      /^.*?Backed up by (?:our|my) 100% money-back guarantee.*?$/gim,
      /^.*?With our 100% money-back guarantee.*?$/gim,
      
      // Bullet points with satisfaction guaranteed
      /^\s*\*\s*####?\s*Satisfaction Guaranteed?\s*$/gim,
      
      // In index.md specific content
      /Backed up by my 100% money-back guarantee.*?conversion machine\.\s*/gs,
      
      // Any standalone lines with guarantee
      /^.*?100%\s*Money[- ]Back\s*Guarantee.*?$/gim
    ];
    
    for (const pattern of guaranteeTextPatterns) {
      if (pattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(pattern, '');
        modified = true;
      }
    }
    
    // Clean up multiple blank lines (more than 2 consecutive)
    updatedContent = updatedContent.replace(/\n{3,}/g, '\n\n');
    
    // Clean up trailing whitespace
    updatedContent = updatedContent.trimEnd() + '\n';
    
    if (!modified) {
      console.log(`⏭️  No guarantee content found: ${filepath}`);
      return { modified: false };
    }
    
    if (config.dryRun) {
      console.log(`📄 Would update: ${filepath}`);
      return { modified: true, dryRun: true };
    }
    
    // Create backup
    const backupPath = path.join(config.backupDir, path.relative('.', filepath));
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(filepath, backupPath);
    
    // Write updated content
    await fs.writeFile(filepath, updatedContent, 'utf-8');
    console.log(`✅ Removed guarantee content from: ${filepath}`);
    
    return { modified: true };
    
  } catch (error) {
    console.error(`❌ Error processing ${filepath}:`, error.message);
    return { modified: false, error };
  }
}

// Main execution
async function main() {
  console.log('🧹 Guarantee Content Removal');
  console.log('============================\n');
  
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
  
  console.log('\n✨ Guarantee content removal complete!');
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