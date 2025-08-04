import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';

// Configuration
const config = {
  contentDirs: ['src/content/blog', 'src/content/pages'],
  backupDir: 'footer-backup',
  dryRun: false // Set to true to preview changes
};

// The promotional text to remove
const footerVariations = [
  // Main variation
  `Are You Ready To Level Up Your Internet Marketing Game?

Backed up by our 100% money-back guarantee you can purchase any or all of our services on a pay monthly basis.

​

Want massive amounts of search engine traffic? Then a pay monthly SEO plan is what you need.

​

Crush the competition on Social Media? Pay for our social media marketing on a monthly basis.

​

Would you like all of your digital marketing done for you? Talk to us!

[Make An Enquiry Today!](https://www.webuildstores.co.uk/contact)`,
  
  // Variation without the link markdown
  `Are You Ready To Level Up Your Internet Marketing Game?

Backed up by our 100% money-back guarantee you can purchase any or all of our services on a pay monthly basis.

​

Want massive amounts of search engine traffic? Then a pay monthly SEO plan is what you need.

​

Crush the competition on Social Media? Pay for our social media marketing on a monthly basis.

​

Would you like all of your digital marketing done for you? Talk to us!

Make An Enquiry Today!`,

  // Variation with different spacing
  `Are You Ready To Level Up Your Internet Marketing Game?
Backed up by our 100% money-back guarantee you can purchase any or all of our services on a pay monthly basis.
​
Want massive amounts of search engine traffic? Then a pay monthly SEO plan is what you need.
​
Crush the competition on Social Media? Pay for our social media marketing on a monthly basis.
​
Would you like all of your digital marketing done for you? Talk to us!
[Make An Enquiry Today!](https://www.webuildstores.co.uk/contact)`,

  // Variation with single line breaks
  `Are You Ready To Level Up Your Internet Marketing Game?
Backed up by our 100% money-back guarantee you can purchase any or all of our services on a pay monthly basis.
​
Want massive amounts of search engine traffic? Then a pay monthly SEO plan is what you need.
​
Crush the competition on Social Media? Pay for our social media marketing on a monthly basis.
​
Would you like all of your digital marketing done for you? Talk to us!
Make An Enquiry Today!`
];

// Process a single file
async function processFile(filepath) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    let updatedContent = content;
    let found = false;
    
    // Try to remove each variation
    for (const footer of footerVariations) {
      if (updatedContent.includes(footer)) {
        updatedContent = updatedContent.replace(footer, '');
        found = true;
        break;
      }
    }
    
    // Also try a regex approach for more flexible matching
    if (!found) {
      const regexPattern = /Are You Ready To Level Up Your Internet Marketing Game\?[\s\S]*?(?:Make An Enquiry Today!|\[Make An Enquiry Today!\]\([^)]+\))/g;
      const matches = updatedContent.match(regexPattern);
      if (matches) {
        updatedContent = updatedContent.replace(regexPattern, '');
        found = true;
      }
    }
    
    // Clean up any trailing whitespace
    updatedContent = updatedContent.trimEnd() + '\n';
    
    if (!found) {
      console.log(`⏭️  No promotional footer found: ${filepath}`);
      return;
    }
    
    if (config.dryRun) {
      console.log(`📄 Would remove footer from: ${filepath}`);
      return;
    }
    
    // Create backup
    const backupPath = path.join(config.backupDir, path.relative('.', filepath));
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(filepath, backupPath);
    
    // Write updated content
    await fs.writeFile(filepath, updatedContent, 'utf-8');
    console.log(`✅ Removed promotional footer from: ${filepath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filepath}:`, error.message);
  }
}

// Main execution
async function main() {
  console.log('🧹 Promotional Footer Removal');
  console.log('=============================\n');
  
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
  for (const file of files) {
    await processFile(file);
  }
  
  console.log('\n✨ Footer removal complete!');
  
  if (config.dryRun) {
    console.log('\nTo apply changes, set dryRun: false in the config');
  }
}

// Run the script
main().catch(console.error);