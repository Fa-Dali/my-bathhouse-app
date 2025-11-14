// Ссылка страницы http://localhost:3000/dashboard/staff-table

// app/dashboard/staff_table/page.tsx

'use client';

import React, { useEffect } from 'react';
import CalculatorAdmin from './calculator/page';
import StaffPage from './staff-page/page';
import { useAuth } from '@/app/auth/contexts/auth-provider';
import { usePathname, redirect } from 'next/navigation';

export default function Page() {



	return (
		<div className="container p-1 beautiful-scroll overflow-y-auto h-[500px]">
			<StaffPage />
		</div>
	);
}

// className="beautiful-scroll overflow-y-auto h-[300px]"
