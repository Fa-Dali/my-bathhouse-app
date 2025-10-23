// app/dashboard/staff-table/useUsers.tsx

// Хук для работы с пользователями

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password: string;
  confirm_password: string;
  pin_code: string;
  avatar?: string | null; // Предположительно, возвращаемый сервером URL аватара
}

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/users/');
        setUsers(response.data);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      }
    };

    fetchUsers();
  }, []);

  return { users };
};

export default useUsers;
