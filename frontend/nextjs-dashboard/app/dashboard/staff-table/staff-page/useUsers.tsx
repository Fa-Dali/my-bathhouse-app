// app/dashboard/staff-table/useUsers.tsx

// Хук для работы с пользователями

import { useEffect, useState } from 'react';
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
  roles: { code: string; name: string }[];
  can_edit: boolean;
}

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/users/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, refresh: fetchUsers };
};

export default useUsers;
