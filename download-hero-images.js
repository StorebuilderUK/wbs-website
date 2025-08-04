import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';
import https from 'https';
import { createWriteStream } from 'fs';

// Configuration
const config = {
  contentDirs: ['src/content/blog', 'src/content/pages'],
  imageDir: 'public/images/blog',
  dryRun: false // Set to true to see what would be downloaded
};

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath).catch(() => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

// Generate local filename from URL
function getLocalFilename(url, slug) {
  // Extract file extension from URL
  const urlParts = url.split('/');
  const mediaId = urlParts.find(part => part.includes('~mv2'));
  
  if (mediaId) {
    // Extract the base ID before ~mv2
    const baseId = mediaId.split('~')[0];
    return `${slug}-${baseId}.jpg`;
  }
  
  // Fallback to simple slug-based name
  return `${slug}-hero.jpg`;
}

// Process a single file
async function processFile(filepath) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const lines = content.split('\n');
    
    // Parse frontmatter
    let inFrontmatter = false;
    let frontmatterStart = -1;
    let frontmatterEnd = -1;
    let heroImageLine = -1;
    let heroImageUrl = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true;
          frontmatterStart = i;
        } else {
          frontmatterEnd = i;
          break;
        }
      }
      
      if (inFrontmatter && line.startsWith('heroImage:')) {
        heroImageLine = i;
        // Extract URL, removing quotes if present
        heroImageUrl = line.replace('heroImage:', '').trim().replace(/^["']|["']$/g, '');
      }
    }
    
    if (!heroImageUrl || !heroImageUrl.startsWith('http')) {
      console.log(`⏭️  No hero image URL found: ${filepath}`);
      return;
    }
    
    // Get the slug from the filepath
    const slug = path.basename(filepath, '.md');
    const localFilename = getLocalFilename(heroImageUrl, slug);
    const localPath = `/images/blog/${localFilename}`;
    const fullLocalPath = path.join(config.imageDir, localFilename);
    
    if (config.dryRun) {
      console.log(`📄 Would download: ${filepath}`);
      console.log(`   From: ${heroImageUrl}`);
      console.log(`   To: ${fullLocalPath}`);
      console.log(`   New path: ${localPath}`);
      return;
    }
    
    // Ensure image directory exists
    await fs.mkdir(config.imageDir, { recursive: true });
    
    // Check if image already exists
    try {
      await fs.access(fullLocalPath);
      console.log(`⏭️  Image already exists: ${localFilename}`);
    } catch {
      // Download the image
      console.log(`📥 Downloading: ${localFilename}`);
      await downloadImage(heroImageUrl, fullLocalPath);
    }
    
    // Update the markdown file with local path
    lines[heroImageLine] = `heroImage: "${localPath}"`;
    const updatedContent = lines.join('\n');
    await fs.writeFile(filepath, updatedContent, 'utf-8');
    
    console.log(`✅ Updated: ${filepath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filepath}:`, error.message);
  }
}

// Main execution
async function main() {
  console.log('🖼️  Hero Image Downloader');
  console.log('========================\n');
  
  if (config.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be downloaded\n');
  } else {
    console.log('📥 Downloading images and updating markdown files...\n');
  }
  
  // Find all markdown files
  const patterns = config.contentDirs.map(dir => `${dir}/**/*.md`);
  const files = await globby(patterns);
  
  console.log(`Found ${files.length} markdown files to check\n`);
  
  // Process files
  for (const file of files) {
    await processFile(file);
  }
  
  console.log('\n✨ Hero image download complete!');
  
  if (config.dryRun) {
    console.log('\nTo download images, set dryRun: false in the config');
  }
}

// Run the script
main().catch(console.error);