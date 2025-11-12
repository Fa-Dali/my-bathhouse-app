// Для проверки токена
'use client';

import { useState, useEffect } from 'react';

export default function DebugToken() {
  const [tokens, setTokens] = useState<{ auth: string | null; refresh: string | null }>({
    auth: null,
    refresh: null,
  });

  useEffect(() => {
    // Этот код выполнится ТОЛЬКО в браузере
    setTokens({
      auth: localStorage.getItem('authToken'),
      refresh: localStorage.getItem('refreshToken'),
    });
  }, []);

  const clearTokens = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setTokens({ auth: null, refresh: null });
    alert('Токены удалены');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Отладка: Токены</h2>

      <div style={{ margin: '10px 0' }}>
        <strong>authToken:</strong>
        <pre style={{ background: '#f0f0f0', padding: '5px', borderRadius: '3px' }}>
          {tokens.auth ? tokens.auth.substring(0, 50) + '...' : 'Нет'}
        </pre>
      </div>

      <div style={{ margin: '10px 0' }}>
        <strong>refreshToken:</strong>
        <pre style={{ background: '#f0f0f0', padding: '5px', borderRadius: '3px' }}>
          {tokens.refresh ? tokens.refresh.substring(0, 50) + '...' : 'Нет'}
        </pre>
      </div>

      <button
        onClick={clearTokens}
        style={{
          marginTop: '20px',
          padding: '10px 15px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Очистить токены
      </button>
    </div>
  );
}
