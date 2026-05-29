import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.trycloudflare.com', '*.ngrok-free.app', '*.ngrok.io'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Allow Discord (and self) to embed this app in an iframe
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://discord.com https://*.discord.com https://*.discordsays.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
