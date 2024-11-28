import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('src'),
      reactStrictMode: true, // Update alias for '@'
    };
    return config;
  },
};

export default nextConfig;
