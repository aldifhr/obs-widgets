/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'p16-webcast.tiktokcdn.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://p16-webcast.tiktokcdn.com; connect-src 'self' https://p16-webcast.tiktokcdn.com; media-src 'self' https://p16-webcast.tiktokcdn.com;",
          },
        ],
      },
    ]
  },
}
export default nextConfig
