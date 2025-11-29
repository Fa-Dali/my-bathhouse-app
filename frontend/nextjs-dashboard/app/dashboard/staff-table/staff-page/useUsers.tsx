// app/dashboard/staff-table/useUsers.tsx

// Хук для работы с пользователями

import { useEffect, useState } from 'react';
// import axios from 'axios';
import api from '@/app/utils/axiosConfig';

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
  roles: { code: string; name: string }[];
  can_edit: boolean;
}

let cachedUsers: User[] | null = null;

const useUsers = () => {
  const [users, setUsers] = useState<User[]>(cachedUsers || []);
  const [loading, setLoading] = useState(!cachedUsers);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get('/api/users/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
      const data = response.data;
      console.log('🔄 Получены обновлённые пользователи:', response.data);
      setUsers(response.data);
      cachedUsers = data;
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refresh = () => fetchUsers();

  return { users, loading, refresh: fetchUsers };
};

export default useUsers;
