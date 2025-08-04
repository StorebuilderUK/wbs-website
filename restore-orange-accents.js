import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color replacements - restoring orange where it was changed to navy
const colorReplacements = [
  // Navy blues back to orange
  { from: /#1e3a8a/gi, to: '#ff6b35' },
  { from: /#2563eb/gi, to: '#ff6b35' },
  { from: /#1e40af/gi, to: '#ff6b35' },
  { from: /#3b82f6/gi, to: '#ff6b35' },
  
  // Restore specific classes
  { from: /bg-blue-900/g, to: 'bg-orange-500' },
  { from: /bg-blue-800/g, to: 'bg-orange-600' },
  { from: /bg-blue-700/g, to: 'bg-orange-500' },
  { from: /bg-blue-600/g, to: 'bg-orange-500' },
  { from: /text-blue-900/g, to: 'text-orange-500' },
  { from: /text-blue-800/g, to: 'text-orange-600' },
  { from: /text-blue-700/g, to: 'text-orange-500' },
  { from: /text-blue-600/g, to: 'text-orange-500' },
  { from: /hover:bg-blue-800/g, to: 'hover:bg-orange-600' },
  { from: /hover:bg-blue-700/g, to: 'hover:bg-orange-600' },
  { from: /hover:text-blue-700/g, to: 'hover:text-orange-600' },
  { from: /hover:text-blue-600/g, to: 'hover:text-orange-500' },
  { from: /border-blue-900/g, to: 'border-orange-500' },
  { from: /border-blue-800/g, to: 'border-orange-600' },
  { from: /border-blue-700/g, to: 'border-orange-500' },
  { from: /border-blue-600/g, to: 'border-orange-500' },
  { from: /from-blue-900/g, to: 'from-orange-500' },
  { from: /to-blue-800/g, to: 'to-orange-600' },
  { from: /accent-blue-600/g, to: 'accent-orange-500' },
  { from: /decoration-blue-600/g, to: 'decoration-orange-500' },
  { from: /ring-blue-500/g, to: 'ring-orange-500' },
  { from: /focus:border-blue-500/g, to: 'focus:border-orange-500' },
  { from: /focus:ring-blue-500/g, to: 'focus:ring-orange-500' },
];

// Files to restore orange (excluding GuaranteeSection.astro)
const filesToUpdate = [
  'src/components/Header.astro',
  'src/components/Footer.astro',
  'src/components/Card.astro',
  'src/components/FormattedDate.astro',
  'src/pages/index.astro',
  'src/pages/blog/index.astro',
  'src/pages/blog/[...slug].astro',
  'src/pages/services.astro',
  'src/pages/about.astro',
  'src/pages/contact.astro',
  'src/pages/contact-success.astro',
  'src/layouts/Layout.astro',
  'src/layouts/BlogPost.astro',
  'src/styles/global.css',
];

// Backup directory
const backupDir = 'restore-orange-backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

let totalReplacements = 0;
let filesUpdated = 0;

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    // Read the file
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Create backup
    const backupPath = path.join(backupDir, path.basename(filePath));
    fs.writeFileSync(backupPath, originalContent);
    
    // Apply color replacements
    let fileReplacements = 0;
    colorReplacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        fileReplacements += matches.length;
        content = content.replace(from, to);
      }
    });
    
    // Write the updated file if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✓ Updated ${filePath} (${fileReplacements} replacements)`);
      totalReplacements += fileReplacements;
      filesUpdated++;
    } else {
      console.log(`- No changes needed in ${filePath}`);
    }
  } else {
    console.log(`⚠ File not found: ${filePath}`);
  }
});

console.log('\n=== Restoration Complete ===');
console.log(`Files updated: ${filesUpdated}`);
console.log(`Total replacements: ${totalReplacements}`);
console.log(`Backups saved in: ${backupDir}/`);
console.log('\nNote: GuaranteeSection.astro was intentionally left in navy blue.');