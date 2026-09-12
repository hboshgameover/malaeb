import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // بيانات الأدمن المعتمدة
    if (username === 'hbosh' && password === 'Zz@101629') {
      return NextResponse.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
    }
    
    return NextResponse.json({ success: false, message: 'اسم المستخدم أو الكود السري غير صحيح' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
