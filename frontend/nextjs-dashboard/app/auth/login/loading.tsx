// frontend/nextjs-dashboard/app/shared/LoadingPage.tsx

import React from 'react';

const LoadingPage = () => {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fafafa',
      color: '#333',
      fontSize: '2em'
    }}>
      Загрузка...
    </div>
  );
};

export default LoadingPage;
