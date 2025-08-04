// Generate dynamic sitemap
export async function GET({ site }) {
  const posts = await import.meta.glob('../content/blog/*.md');
  const pages = await import.meta.glob('../content/pages/*.md');
  
  const blogUrls = Object.keys(posts).map(path => {
    const slug = path.split('/').pop().replace('.md', '');
    return `
    <url>
      <loc>${site}blog/${slug}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`;
  }).join('');
  
  const pageUrls = Object.keys(pages).map(path => {
    const slug = path.split('/').pop().replace('.md', '');
    return `
    <url>
      <loc>${site}${slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
  }).join('');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${site}blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${blogUrls}
  ${pageUrls}
</urlset>`;
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}