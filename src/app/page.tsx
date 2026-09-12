'use client';
import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.success) {
      setSuccess('تم تسجيل الدخول بنجاح!');
    } else {
      setError(data.message || 'بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b132b', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* شاشة تسجيل الدخول مع شعار الساعة */}
      <div style={{ background: '#1c2541', padding: '35px', borderRadius: '15px', width: '380px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', textAlign: 'center' }}>
        
        {/* شعار الساعة بدلاً من الشعار القديم */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#48cae4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>

        <h2 style={{ marginBottom: '5px', fontSize: '22px' }}>دخول الإدارة</h2>
        <p style={{ color: '#8d99ae', fontSize: '13px', marginBottom: '20px' }}>منظومة إدارة ملاعب العراق</p>

        {error && <p style={{ color: '#ff6b6b', background: 'rgba(255,0,0,0.1)', padding: '8px', borderRadius: '5px', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}
        {success && <p style={{ color: '#51cf66', background: 'rgba(81,207,102,0.1)', padding: '8px', borderRadius: '5px', fontSize: '14px', marginBottom: '15px' }}>{success}</p>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px', textAlign: 'right' }}>
            <label style={{ fontSize: '14px', color: '#caf0f8' }}>اسم المستخدم</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="اكتب اسم المستخدم هنا"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #48cae4', background: '#0b132b', color: '#fff', marginTop: '5px', boxSizing: 'border-box' }} 
            />
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'right' }}>
            <label style={{ fontSize: '14px', color: '#caf0f8' }}>الكود السري</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #48cae4', background: '#0b132b', color: '#fff', marginTop: '5px', boxSizing: 'border-box' }} 
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '12px', background: '#48cae4', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', color: '#000', fontSize: '15px' }}
          >
            تأكيد الدخول للإدارة
          </button>
        </form>
      </div>

    </div>
  );
}
