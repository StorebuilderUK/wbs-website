import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';

// Configuration
const config = {
  contentDirs: ['src/content/blog', 'src/content/pages'],
  dryRun: false, // Set to true to preview changes
  backupDir: 'heading-backup'
};

// Patterns that suggest H3 headings
const h3Patterns = [
  /^(Step|Tip|Note|Example|Warning|Important)[\s:]?\d*[:.]?\s*/i,
  /^\d+\.\s+\w+/, // Numbered items like "1. First Step"
  /^(How|What|Why|When|Where|Who)\s+\w+/i, // Short question headings
  /^(Option|Method|Approach|Solution|Problem)[\s:]?\d*[:.]?\s*/i,
  /^(Pro|Con|Pros|Cons|Advantages?|Disadvantages?)[:.]?\s*/i,
  /^(Before|After|First|Second|Third|Finally|Next)[:.]?\s*/i,
];

// Patterns that suggest H4 headings
const h4Patterns = [
  /^(Sub-?step|Sub-?tip|Details?|More info)[:.]?\s*/i,
  /^[a-z]\.?\s+/, // Lowercase letter bullets (a. b. c.)
  /^(Also|Additionally|Furthermore|Moreover)[:.]?\s*/i,
];

// Words/phrases that typically indicate major sections (keep as H2)
const majorSectionIndicators = [
  'introduction', 'conclusion', 'summary', 'overview', 'getting started',
  'prerequisites', 'requirements', 'installation', 'setup', 'configuration',
  'wrapping up', 'final thoughts', 'next steps', 'resources', 'references'
];

// Analyze heading structure and suggest hierarchy
function analyzeHeadingHierarchy(lines) {
  const headings = [];
  let lastH2Index = -1;
  let contentSinceLastHeading = 0;
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Track content between headings
    if (trimmed && !trimmed.startsWith('#')) {
      contentSinceLastHeading++;
    }
    
    // Found a heading
    if (trimmed.match(/^#{1,6}\s+/)) {
      const level = trimmed.match(/^(#{1,6})/)[1].length;
      const text = trimmed.replace(/^#{1,6}\s+/, '').trim();
      
      const heading = {
        index,
        originalLevel: level,
        suggestedLevel: level,
        text,
        contentBefore: contentSinceLastHeading
      };
      
      // Reset content counter
      contentSinceLastHeading = 0;
      
      // Keep H1 as is
      if (level === 1) {
        headings.push(heading);
        return;
      }
      
      // Analyze if this should be demoted to H3 or H4
      if (level === 2) {
        const lowerText = text.toLowerCase();
        
        // Check if it's a major section
        const isMajorSection = majorSectionIndicators.some(indicator => 
          lowerText.includes(indicator)
        );
        
        if (!isMajorSection) {
          // Check if it matches H3 patterns
          const matchesH3 = h3Patterns.some(pattern => pattern.test(text));
          
          // Check if it's a short heading after substantial content
          const isShortAfterContent = text.length < 30 && heading.contentBefore > 5;
          
          // Check if it's inside a major section
          const isInsideSection = lastH2Index !== -1 && 
            headings[lastH2Index].suggestedLevel === 2;
          
          if (matchesH3 || (isShortAfterContent && isInsideSection)) {
            heading.suggestedLevel = 3;
            
            // Check if it should be H4
            const matchesH4 = h4Patterns.some(pattern => pattern.test(text));
            if (matchesH4 && lastH2Index !== -1) {
              heading.suggestedLevel = 4;
            }
          } else {
            lastH2Index = headings.length;
          }
        } else {
          lastH2Index = headings.length;
        }
      }
      
      // Handle existing H3+ headings
      if (level >= 3) {
        // Keep relative hierarchy but adjust based on parent
        if (lastH2Index !== -1) {
          const parentLevel = headings[lastH2Index].suggestedLevel;
          heading.suggestedLevel = Math.min(parentLevel + 1, 6);
        }
      }
      
      headings.push(heading);
    }
  });
  
  return headings;
}

// Apply heading hierarchy to content
function applyHeadingHierarchy(lines, headings) {
  const updatedLines = [...lines];
  
  headings.forEach(heading => {
    if (heading.originalLevel !== heading.suggestedLevel) {
      const newPrefix = '#'.repeat(heading.suggestedLevel);
      updatedLines[heading.index] = `${newPrefix} ${heading.text}`;
    }
  });
  
  return updatedLines;
}

// Process a single file
async function processFile(filepath) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const lines = content.split('\n');
    
    // Skip if no headings found
    if (!lines.some(line => line.trim().match(/^#{1,6}\s+/))) {
      console.log(`⏭️  No headings found: ${filepath}`);
      return;
    }
    
    // Analyze heading structure
    const headings = analyzeHeadingHierarchy(lines);
    
    // Count changes
    const changes = headings.filter(h => h.originalLevel !== h.suggestedLevel);
    
    if (changes.length === 0) {
      console.log(`⏭️  No changes needed: ${filepath}`);
      return;
    }
    
    if (config.dryRun) {
      console.log(`\n📄 Would update: ${filepath}`);
      console.log(`   Found ${changes.length} heading(s) to adjust:`);
      changes.forEach(h => {
        console.log(`   ${'#'.repeat(h.originalLevel)} → ${'#'.repeat(h.suggestedLevel)} "${h.text}"`);
      });
    } else {
      // Create backup
      const backupPath = path.join(config.backupDir, path.relative('.', filepath));
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.copyFile(filepath, backupPath);
      
      // Apply changes
      const updatedLines = applyHeadingHierarchy(lines, headings);
      const updatedContent = updatedLines.join('\n');
      
      await fs.writeFile(filepath, updatedContent, 'utf-8');
      console.log(`✅ Updated ${changes.length} heading(s) in: ${filepath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filepath}:`, error.message);
  }
}

// Main execution
async function main() {
  console.log('🎯 Heading Hierarchy Restoration');
  console.log('================================\n');
  
  if (config.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  } else {
    console.log('⚠️  LIVE MODE - Files will be modified!');
    console.log(`📁 Backups will be saved to: ${config.backupDir}\n`);
  }
  
  // Find all markdown files
  const patterns = config.contentDirs.map(dir => `${dir}/**/*.md`);
  const files = await globby(patterns);
  
  console.log(`Found ${files.length} markdown files to analyze\n`);
  
  // Process files
  for (const file of files) {
    await processFile(file);
  }
  
  console.log('\n✨ Heading hierarchy restoration complete!');
  
  if (config.dryRun) {
    console.log('\nTo apply changes, set dryRun: false in the config');
  } else {
    console.log('\n💡 Tip: Review the changes and manually adjust any headings that need correction');
  }
}

// Run the script
main().catch(console.error);