'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.success) {
      router.push('/admin/dashboard'); // أو صفحة الأدمن لديك
    } else {
      setError(data.message || 'بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b132b', color: '#fff' }}>
      <form onSubmit={handleLogin} style={{ background: '#1c2541', padding: '30px', borderRadius: '15px', width: '350px', textAlign: 'center' }}>
        <h2>دخول الإدارة</h2>
        {error && <p style={{ color: '#ff6b6b', background: 'rgba(255,0,0,0.1)', padding: '8px', borderRadius: '5px' }}>{error}</p>}
        <div style={{ marginBottom: '15px', textAlign: 'right' }}>
          <label>اسم المستخدم</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #48cae4', background: '#0b132b', color: '#fff', marginTop: '5px' }} />
        </div>
        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
          <label>الكود السري</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #48cae4', background: '#0b132b', color: '#fff', marginTop: '5px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#48cae4', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', color: '#000' }}>تأكيد الدخول للإدارة</button>
      </form>
    </div>
  );
}
