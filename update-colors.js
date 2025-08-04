import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';

// Configuration
const config = {
  srcDir: 'src',
  backupDir: 'color-backup',
  dryRun: false // Set to true to preview changes
};

// Color mappings: purple to navy blue
const colorMappings = [
  // Main brand color (purple to navy)
  { from: 'purple-700', to: 'blue-900' },
  
  // Purple variants to navy/blue variants
  { from: 'purple-800', to: 'blue-950' },
  { from: 'purple-600', to: 'blue-800' },
  { from: 'purple-500', to: 'blue-700' },
  { from: 'purple-400', to: 'blue-600' },
  { from: 'purple-300', to: 'blue-500' },
  { from: 'purple-200', to: 'blue-400' },
  { from: 'purple-100', to: 'blue-300' },
  { from: 'purple-50', to: 'blue-50' },
  
  // Background and opacity variants
  { from: 'from-purple-700', to: 'from-blue-900' },
  { from: 'to-purple-800', to: 'to-blue-950' },
  { from: 'to-purple-600', to: 'to-blue-800' },
  { from: 'to-purple-500', to: 'to-blue-700' },
  { from: 'from-purple-800', to: 'from-blue-950' },
  { from: 'hover:from-purple-800', to: 'hover:from-blue-950' },
  { from: 'hover:to-purple-700', to: 'hover:to-blue-900' },
  
  // Opacity variants
  { from: 'purple-700/20', to: 'blue-900/20' },
  { from: 'purple-700/10', to: 'blue-900/10' },
  { from: 'purple-600/20', to: 'blue-800/20' },
  { from: 'purple-700/10', to: 'blue-900/10' },
  
  // Hover states
  { from: 'hover:bg-purple-800', to: 'hover:bg-blue-950' },
  { from: 'hover:text-purple-800', to: 'hover:text-blue-950' },
  { from: 'focus:ring-purple-700', to: 'focus:ring-blue-900' },
  { from: 'focus:ring-purple-300', to: 'focus:ring-blue-300' },
  
  // Border variants
  { from: 'border-purple-700', to: 'border-blue-900' },
  { from: 'border-purple-800', to: 'border-blue-950' },
  
  // Text variants
  { from: 'text-purple-700', to: 'text-blue-900' },
  
  // Background colors
  { from: 'bg-purple-700', to: 'bg-blue-900' },
  { from: 'bg-purple-800', to: 'bg-blue-950' },
  { from: 'bg-purple-50', to: 'bg-blue-50' }
];

// Process a single file
async function processFile(filepath) {
  try {
    let content = await fs.readFile(filepath, 'utf-8');
    let originalContent = content;
    let changesMade = [];
    
    // Apply each color mapping
    for (const mapping of colorMappings) {
      const regex = new RegExp(mapping.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      
      if (matches) {
        content = content.replace(regex, mapping.to);
        changesMade.push(`${mapping.from} → ${mapping.to} (${matches.length} times)`);
      }
    }
    
    if (changesMade.length === 0) {
      console.log(`⏭️  No color changes needed: ${filepath}`);
      return { modified: false };
    }
    
    if (config.dryRun) {
      console.log(`📄 Would update: ${filepath}`);
      console.log(`   Changes: ${changesMade.join(', ')}`);
      return { modified: true, dryRun: true };
    }
    
    // Create backup
    const backupPath = path.join(config.backupDir, path.relative('.', filepath));
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.writeFile(backupPath, originalContent, 'utf-8');
    
    // Write updated content
    await fs.writeFile(filepath, content, 'utf-8');
    console.log(`✅ Updated colors in: ${filepath}`);
    console.log(`   Changes: ${changesMade.join(', ')}`);
    
    return { modified: true, changes: changesMade };
    
  } catch (error) {
    console.error(`❌ Error processing ${filepath}:`, error.message);
    return { modified: false, error };
  }
}

// Main execution
async function main() {
  console.log('🎨 Color Scheme Update: Orange → Purple');
  console.log('=====================================\n');
  
  if (config.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  } else {
    console.log('⚠️  LIVE MODE - Files will be modified!');
    console.log(`📁 Backups will be saved to: ${config.backupDir}\n`);
  }
  
  // Find all relevant files
  const patterns = [
    `${config.srcDir}/**/*.astro`,
    `${config.srcDir}/**/*.js`,
    `${config.srcDir}/**/*.ts`,
    `${config.srcDir}/**/*.jsx`,
    `${config.srcDir}/**/*.tsx`,
    `${config.srcDir}/**/*.css`
  ];
  
  const files = await globby(patterns);
  
  console.log(`Found ${files.length} files to check\n`);
  
  // Process files
  let modifiedCount = 0;
  let errorCount = 0;
  let totalChanges = [];
  
  for (const file of files) {
    const result = await processFile(file);
    if (result.modified && !result.dryRun) {
      modifiedCount++;
      if (result.changes) {
        totalChanges.push(...result.changes);
      }
    }
    if (result.error) errorCount++;
  }
  
  console.log('\n🎨 Color scheme update complete!');
  console.log(`📊 Modified: ${modifiedCount} files`);
  console.log(`📊 Unchanged: ${files.length - modifiedCount - errorCount} files`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} files`);
  }
  
  console.log(`\n🔄 Total color changes made: ${totalChanges.length}`);
  
  if (config.dryRun) {
    console.log('\nTo apply changes, set dryRun: false in the config');
  }
}

// Run the script
main().catch(console.error);