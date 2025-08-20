/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  reactStrictMode: false, // Add reactStrictMode option here
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_API_SERVER
      ? [
          {
            protocol: new URL(process.env.NEXT_PUBLIC_API_SERVER).protocol.replace(':',''),
            hostname: new URL(process.env.NEXT_PUBLIC_API_SERVER).hostname,
            port: new URL(process.env.NEXT_PUBLIC_API_SERVER).port || '',
          },
        ]
      : [],
  },
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_SERVER || "http://localhost:3006/api/backend";
    const url = new URL(backend);
    return [
      {
        source: "/api/backend/:path*",
        destination: `${url.origin}${url.pathname}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
