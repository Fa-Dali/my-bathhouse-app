// next.config.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,     // Включаем строгий режим React
  experimental: {},          // Здесь можно задать экспериментальные фичи
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Перенаправляем запросы на Django
      },
    ];
  },
};

export default nextConfig;
