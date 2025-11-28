// app/api/holidays/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'rMDLXeg0Oq2sLTDQS9pB9xGvNbQAJZB2'; // ← Зарегистрируйся на https://calendarific.com/

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || new Date().getFullYear();
  const country = searchParams.get('country') || 'RU'; // по умолчанию — Россия

  try {
    const res = await fetch(
      `https://calendarific.com/api/v2/holidays?&api_key=${API_KEY}&country=${country}&year=${year}`
    );

    if (!res.ok) {
      throw new Error('Не удалось загрузить праздники');
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      holidays: data.response.holidays || [],
    });
  } catch (err: any) {
    console.error('Ошибка API праздников:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
