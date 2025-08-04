// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx()],
  site: 'https://www.webuildstores.co.uk',
  redirects: {
    // Generic posts being deleted - redirect to home
    '/blog/introduction-to-seo': '/',
    '/blog/what-is-social-media-marketing': '/',
    '/blog/instagram-basics-for-complete-beginners': '/',
    '/blog/your-introduction-to-google-analytics': '/',
    '/blog/the-art-of-search-engine-optimisation': '/',
    '/blog/starting-a-small-business-blog': '/',
    '/blog/creative-ideas-for-social-media-marketing-campaigns': '/',
    '/blog/should-twitter-be-part-of-your-social-media-marketing-strategy': '/',
    '/blog/beginners-guide-to-building-a-website': '/',
    '/blog/how-to-design-a-blog-content-planning-schedule': '/',
    '/blog/small-business-seo': '/',
    '/blog/measure-website-growth': '/',
    '/blog/local-seo-strategies': '/',
    '/blog/become-the-website-copywriting-superhero-your-company-needs': '/',
    '/blog/six-great-reasons-why-you-should-hire-a-website-designer': '/',
    '/blog/three-essential-website-design-services-for-your-small-business': '/',
    '/blog/hire-a-website-designer': '/',
    '/blog/hire-a-crackerjack-website-design-agency-and-skyrocket-your-profits': '/',
  }
});
