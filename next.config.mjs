/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Keep production deployments moving; run `npm run lint` separately during development/CI.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
