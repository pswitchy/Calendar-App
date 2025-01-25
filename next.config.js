/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['lh3.googleusercontent.com'],
    },
    experimental: {
      // serverActions: true,
      serverComponentsExternalPackages: ["mongoose"]
    },
  }
  
  module.exports = nextConfig