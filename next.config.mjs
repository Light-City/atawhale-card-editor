/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/card', // 设置子路径为 /card
  assetPrefix: '/card/', // 静态资源前缀，确保 CSS/JS 等资源正确加载
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
