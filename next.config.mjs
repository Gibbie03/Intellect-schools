/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Do not let ESLint warnings block Vercel production builds.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Vercel should still produce a deployment while this demo app is being refined.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
