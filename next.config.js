/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { instrumentationHook: true },
  // Alternative approach for older Next.js versions
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack(config, { dev, isServer }) {
    // Allow cross-origin requests in development
    if (dev && !isServer) {
      config.devServer = {
        ...config.devServer,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        }
      };
    }
    
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
    remotePatterns: (() => {
      const v = process.env.NEXT_PUBLIC_API_SERVER;
      if (!v || !/^https?:\/\//.test(v)) return [];
      try {
        const u = new URL(v);
        return [{
          protocol: u.protocol.replace(':',''),
          hostname: u.hostname,
          port: u.port || '',
        }];
      } catch {
        return [];
      }
    })(),
  },
  async rewrites() {
    const origin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:3006";
    return [
      // /api/backend/* -> http://localhost:3006/api/backend/*
      { source: "/api/backend/:path*", destination: `${origin}/api/backend/:path*` },
    ];
  },
};

module.exports = nextConfig;
