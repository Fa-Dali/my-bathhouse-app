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
		<div className="container mx-auto p-0">
			<StaffPage />
		</div>
	);
}
