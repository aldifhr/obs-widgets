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
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' https://p16-webcast.tiktokcdn.com data: blob:",
              "connect-src 'self' https://p16-webcast.tiktokcdn.com",
              "media-src 'self' https://p16-webcast.tiktokcdn.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
export default nextConfig
