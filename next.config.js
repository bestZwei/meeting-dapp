/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 移除 output: 'export' 以支持Vercel部署
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
