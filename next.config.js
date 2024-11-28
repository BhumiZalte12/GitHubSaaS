import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('src'), // Update alias for '@'
    };
    return config;
  },
};

export default nextConfig;
