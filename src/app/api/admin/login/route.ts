import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const ADMIN_USERNAME = "hbosh";
    const ADMIN_PASSWORD = "Zz@101629";

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, message: "تم تسجيل الدخول بنجاح" });
    }

    return NextResponse.json({ success: false, message: "بيانات الدخول غير صحيحة" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
