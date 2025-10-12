// frontend/nextjs-dashboard/app/auth/login/page.tsx

import React, { useState } from 'react';
import axios from 'axios';

interface Credentials {
  username: string;
  password: string;
}

const LoginPage = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: ""
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();  // Предотвращаем стандартную отправку формы

    try {
      const response = await axios.post('/api/login/', credentials);
      localStorage.setItem('token', response.data.access_token);  // Сохраняем токен в LocalStorage
      alert('Вы вошли!');
    } catch (error) {
      alert('Ошибка входа');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}/>
        <br />
        <input type="password" placeholder="Password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}/>
        <br />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default LoginPage;
