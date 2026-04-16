import type { MetadataRoute } from "next";

/**
 * Index sitemap — points to sub-sitemaps.
 * Sub-sitemaps are served as static XML or via Edge Functions.
 * Max 50k URLs per sitemap file (SEO rule from CLAUDE.md).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://torqued.veloxlab.co";

  return [
    { url: `${base}/sitemap-makes.xml`,      lastModified: new Date() },
    { url: `${base}/sitemap-categories.xml`, lastModified: new Date() },
    { url: `${base}/sitemap-parts-1.xml`,    lastModified: new Date() },
  ];
}
