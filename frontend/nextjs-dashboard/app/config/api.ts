// СМОТРИ ЛУЧШИЙ ВАРИАНТ AXIOScONFIG.TSX

// app/config/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export { API_BASE };

// в файл использовать импорт
// import { API_BASE } from '@/app/config/api';

// Вместо:
// src={`http://localhost:8000${worker.avatar}`}

// Пишите:
// src={`${API_BASE}${worker.avatar}`}
