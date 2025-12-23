/** @type {import('next').NextConfig} */
const webpackLib = require("webpack");
const nextConfig = {
  experimental: { instrumentationHook: true },
  // Alternative approach for older Next.js versions
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack(config, { dev, isServer }) {
    // Figma export sometimes pins package versions in import specifiers, e.g.
    //   "@radix-ui/react-dialog@1.1.6" or "lucide-react@0.487.0"
    // Next/webpack cannot resolve these, so we strip the "@version" suffix at build time.
    config.plugins.push(
      new webpackLib.NormalModuleReplacementPlugin(
        /^(@radix-ui\/react-[^@]+)@[\d.]+$/,
        (resource) => {
          resource.request = resource.request.replace(/@[\d.]+$/, "");
        }
      )
    );
    config.plugins.push(
      new webpackLib.NormalModuleReplacementPlugin(/^lucide-react@[\d.]+$/, (resource) => {
        resource.request = "lucide-react";
      })
    );
    config.plugins.push(
      new webpackLib.NormalModuleReplacementPlugin(
        /^(class-variance-authority|react-day-picker|embla-carousel-react)@[\d.]+$/,
        (resource) => {
          resource.request = resource.request.replace(/@[\d.]+$/, "");
        }
      )
    );

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
      const patterns = [];
      const v = process.env.NEXT_PUBLIC_API_SERVER;
      if (v && /^https?:\/\//.test(v)) {
        try {
          const u = new URL(v);
          patterns.push({
            protocol: u.protocol.replace(':',''),
            hostname: u.hostname,
            port: u.port || '',
            pathname: '/**',
          });
        } catch {}
      }
      // Always allow local backend during dev
      patterns.push({ protocol: 'http', hostname: 'localhost', port: '3006', pathname: '/**' });
      return patterns;
    })(),
  },
  async rewrites() {
    const origin = process.env.NEXT_PUBLIC_API_SERVER
      || process.env.NEXT_PUBLIC_BACKEND_ORIGIN
      || "http://localhost:3006";
    return [
      // Proxy all FE calls under /api/backend/* to the real backend origin
      { source: "/api/backend/:path*", destination: `${origin}/api/backend/:path*` },
    ];
  },
};

module.exports = nextConfig;
