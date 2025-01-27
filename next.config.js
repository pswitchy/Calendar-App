/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['lh3.googleusercontent.com'],
    },
    experimental: {
      serverActions: true,
    },
    generateBuildId: async () => {
      return process.env.RENDER_GIT_COMMIT || 'custom-build-id';
    },
  }
  
  module.exports = nextConfig