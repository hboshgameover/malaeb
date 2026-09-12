import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (username === 'hbosh' && password === 'Zz@101620') {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, message: 'اسم المستخدم أو الكود السري غير صحيح' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: 'خطأ في الخادم' }, { status: 500 });
  }
}
