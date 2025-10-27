/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
  // Optimize fonts
  optimizeFonts: true,
}

export default nextConfig
