/** @type {import('next').NextConfig} */
const nextConfig = { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true },
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false };
    }
    return config;
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    }];
  },
};
module.exports = nextConfig;

