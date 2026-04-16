import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/go/",          // affiliate redirect URLs
          "/(seller)/",
          "/(b2b)/",
        ],
      },
    ],
    sitemap: "https://torqued.veloxlab.co/sitemap.xml",
  };
}
