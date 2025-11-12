// next.config.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,     // Включаем строгий режим React
  // experimental: {},          Здесь можно задать экспериментальные фичи
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Перенаправляем запросы на Django
      },
    ];
  },

  // Добавил для обработки шрифтов
  webpack(config) {
    // Добавляем новое правило для обработки шрифтов
    config.module.rules.push({
      test: /\.(ttf|eot|svg|gif)$/,
      use: 'file-loader',
    });
    return config;
  },

  // ЯВНО отключи Turbopack
  experimental: {
    // Отключаем Turbopack
    // Это заставит Next.js использовать Webpack
    externalDir: true,
  },
};

export default nextConfig;
