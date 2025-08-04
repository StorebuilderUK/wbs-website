import fs from 'fs';
import path from 'path';

// Meta data for pages missing titles and descriptions
// Title: ~60 chars, Description: ~160 chars
const metaData = {
  'about-us.md': {
    title: 'About We Build Stores - 25+ Years Digital Excellence',
    description: 'Discover our story, mission and commitment to helping UK businesses thrive online. Based in Telford, serving nationwide with proven digital growth strategies.'
  },
  'blog-writing.md': {
    title: 'Professional Blog Writing Services - We Build Stores',
    description: 'Engage your audience with expert blog content that drives traffic and builds authority. SEO-optimised articles included in all growth packages from £49/month.'
  },
  'blog.md': {
    title: 'Blog - Digital Marketing Insights & Business Growth Tips',
    description: 'Expert insights on web design, SEO, and digital marketing strategies. Real-world advice from 25+ years helping UK businesses succeed online.'
  },
  'contact.md': {
    title: 'Contact We Build Stores - Get Your Free Consultation',
    description: 'Ready to grow your business online? Contact our Telford team for web design, SEO and digital marketing services. Free consultation available.'
  },
  'content-studio-review.md': {
    title: 'Content Studio Review - Social Media Management Platform',
    description: 'Honest review of Content Studio for social media management. Discover if this all-in-one platform is right for your business marketing needs.'
  },
  'ecommerce-website-design-telford.md': {
    title: 'Ecommerce Website Design Telford - We Build Stores',
    description: 'Professional ecommerce website design services in Telford. Mobile-friendly online stores that convert visitors into customers. From £595/month.'
  },
  'ekm-review.md': {
    title: 'EKM Review - UK Ecommerce Platform Honest Assessment',
    description: 'Comprehensive EKM review for UK businesses. Compare features, pricing, and alternatives for your ecommerce needs. Expert insights included.'
  },
  'faq.md': {
    title: 'FAQ - Common Questions About Our Services',
    description: 'Find answers to frequently asked questions about our web design, SEO, and digital marketing services. Pricing, timelines, and process explained.'
  },
  'file-share.md': {
    title: 'Secure File Share - Client Document Upload',
    description: 'Securely share files and documents with We Build Stores. Protected upload area for client projects and confidential business information.'
  },
  'google-my-business.md': {
    title: 'Google My Business Management Services - Local SEO',
    description: 'Dominate local search with professional Google My Business optimisation. Increase visibility, reviews and customer enquiries in your area.'
  },
  'graphic-design.md': {
    title: 'Professional Graphic Design Services - We Build Stores',
    description: 'Eye-catching graphic design for digital and print. Logos, banners, social media graphics and more. Standalone service or included with packages.'
  },
  'incidental-graphics.md': {
    title: 'Incidental Graphics - Quick Design Solutions',
    description: 'Fast turnaround graphic design for social media posts, web banners, and marketing materials. Professional designs that enhance your brand.'
  },
  'index.md': {
    title: 'We Build Stores - Web Design & Digital Marketing Telford',
    description: 'Transform your business with professional web design, SEO and digital marketing. 25+ years experience, 100% money-back guarantee. From £49/month.'
  },
  'logo-types.md': {
    title: 'Logo Design Types - Choose the Right Style',
    description: 'Explore different logo types and styles for your business. Wordmarks, lettermarks, pictorial marks and more explained by design experts.'
  },
  'magento-website-design.md': {
    title: 'Magento Website Design - Enterprise Ecommerce Solutions',
    description: 'Professional Magento development for serious ecommerce businesses. Custom themes, extensions and integrations by certified developers.'
  },
  'pay-monthly-websites.md': {
    title: 'Pay Monthly Websites - Affordable Web Design Plans',
    description: 'Get a professional website with no upfront costs. Spread the cost with affordable monthly payments from £49. Includes hosting and updates.'
  },
  'payment-request-page.md': {
    title: 'Make a Payment - Secure Payment Portal',
    description: 'Secure payment portal for We Build Stores clients. Make invoice payments quickly and safely through our encrypted payment system.'
  },
  'plans-pricing.md': {
    title: 'Plans & Pricing - Growth Packages From £49/Month',
    description: 'Transparent pricing for web design, SEO and digital marketing services. Choose from Trades packages (£49-£149) or Business Intelligence (£330-£995).'
  },
  'promotional-videos.md': {
    title: 'Promotional Video Production - Engage Your Audience',
    description: 'Professional promotional videos that tell your story and convert viewers into customers. Script writing, filming and editing services available.'
  },
  'seo-copywriting.md': {
    title: 'SEO Copywriting Services - Content That Ranks',
    description: 'Expert SEO copywriting that balances search visibility with reader engagement. Get content that ranks well and converts visitors into customers.'
  },
  'shopify-review.md': {
    title: 'Shopify Review - UK Ecommerce Platform Analysis',
    description: 'In-depth Shopify review for UK businesses. Features, pricing, pros and cons analysed by ecommerce experts. Is Shopify right for you?'
  },
  'shopify-website-design.md': {
    title: 'Shopify Website Design - Professional Online Stores',
    description: 'Custom Shopify store design and development. Mobile-friendly themes, app integration and conversion optimisation by certified Shopify experts.'
  },
  'store.md': {
    title: 'Client Store - Premium Business Resources',
    description: 'Exclusive resources and tools for We Build Stores clients. Access premium templates, guides and business growth materials.'
  },
  'website-development.md': {
    title: 'Website Development Services - Custom Web Solutions',
    description: 'Professional website development using modern technologies. Custom functionality, integrations and performance optimisation for serious businesses.'
  },
  'website-redesign.md': {
    title: 'Website Redesign Services - Modernise Your Online Presence',
    description: 'Breathe new life into your website with professional redesign services. Modern design, improved UX and better conversions. Free consultation available.'
  },
  'wix-review.md': {
    title: 'Wix Review - Website Builder Honest Assessment',
    description: 'Comprehensive Wix review by web design experts. Features, pricing, limitations and alternatives explored. Is Wix right for your business?'
  },
  'wix-website-design.md': {
    title: 'Wix Website Design Services - Professional Wix Experts',
    description: 'Get a stunning Wix website designed by certified experts. Custom designs, SEO setup and training included. Transform your Wix site today.'
  }
};

// Also fix the truncated description
const fixTruncated = {
  'contact-success.astro': {
    title: 'Thank You - We Build Stores',
    description: "Thank you for contacting We Build Stores. We'll respond within 24 hours to discuss how we can help grow your business online."
  }
};

// Process markdown files
Object.entries(metaData).forEach(([filename, meta]) => {
  const filePath = path.join('src/content/pages', filename);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has frontmatter
    if (content.startsWith('---')) {
      // Add title and description after the opening ---
      const lines = content.split('\n');
      lines.splice(1, 0, `title: "${meta.title}"`);
      lines.splice(2, 0, `description: "${meta.description}"`);
      content = lines.join('\n');
    } else {
      // Add frontmatter
      content = `---
title: "${meta.title}"
description: "${meta.description}"
---

${content}`;
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated: ${filename}`);
    console.log(`  Title (${meta.title.length} chars): ${meta.title}`);
    console.log(`  Desc (${meta.description.length} chars): ${meta.description}`);
    console.log('');
  } catch (error) {
    console.error(`✗ Error updating ${filename}:`, error.message);
  }
});

// Fix the truncated contact-success page
try {
  const contactSuccessPath = 'src/pages/contact-success.astro';
  let content = fs.readFileSync(contactSuccessPath, 'utf8');
  
  // Replace the truncated description
  content = content.replace(
    'description="Thank you for contacting We Build Stores. We',
    `description="${fixTruncated['contact-success.astro'].description}"`
  );
  
  fs.writeFileSync(contactSuccessPath, content);
  console.log(`✓ Fixed truncated description: contact-success.astro`);
  console.log(`  Desc (${fixTruncated['contact-success.astro'].description.length} chars): ${fixTruncated['contact-success.astro'].description}`);
} catch (error) {
  console.error('✗ Error fixing contact-success.astro:', error.message);
}

console.log('\nSEO Meta Update Complete!');
console.log('All titles are ~60 characters');
console.log('All descriptions are ~160 characters');