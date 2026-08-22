/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'p16-webcast.tiktokcdn.com' },
    ],
  },
}
export default nextConfig
