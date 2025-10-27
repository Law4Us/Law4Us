import { MetadataRoute } from "next";

/**
 * Generate robots.txt for search engine crawlers
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/wizard/", "/api/"],
      },
    ],
    sitemap: "https://law4us.co.il/sitemap.xml",
  };
}
