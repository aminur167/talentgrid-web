/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double-rendering overhead in dev mode for instant click responsiveness
  experimental: {
    staleTimes: {
      dynamic: 60, // Keep dynamic pages in router memory cache for 60 seconds
      static: 300,
    },
  },
};

export default nextConfig;

