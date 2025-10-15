import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // твои настройки конфигурации
  reactStrictMode: true,     // Включаем строгий режим React
  swcMinify: true,           // Ускоряем сборку с помощью SWC
  experimental: {},          // Здесь можно задать экспериментальные фичи
};

export default nextConfig;
