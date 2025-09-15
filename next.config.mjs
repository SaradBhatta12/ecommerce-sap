// next.config.js (ESM with "type": "module")
/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://dns-technology-11.localhost:3000",
    "https://dns-technology-11.localhost:3000",
    "dns-technology-11.localhost",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Enable server components
  },
  serverExternalPackages: ['mongodb', 'mongoose'],
  webpack: (config, { isServer }) => {
    // Fix for MongoDB native dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        process: false,
      };
    }
    
    // Mark MongoDB native dependencies as external
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        'snappy': 'commonjs snappy',
        'aws4': 'commonjs aws4',
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
        'kerberos': 'commonjs kerberos',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
      });
    }
    
    return config;
  },
};

export default nextConfig;
