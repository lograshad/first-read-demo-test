/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@repo/ui"],
  },
  // Exclude heavy packages from Edge middleware bundle
  // todo: revisit this later
  webpack: (config, { isServer, nextRuntime }) => {
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@prisma/client": false,
        "bcryptjs": false,
      };
    }
    return config;
  },
};

export default nextConfig;
