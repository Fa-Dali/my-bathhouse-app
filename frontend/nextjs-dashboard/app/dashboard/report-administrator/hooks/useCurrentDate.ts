// hooks/useCurrentDate.ts
import { useMemo } from 'react';

const useCurrentDate = () => {
  const today = new Date();
  const formattedDate =`${today.getDate()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getFullYear()).padStart(2, '0')}`;

  return useMemo(() => formattedDate, []);
};

export default useCurrentDate;
