'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Phone, 
  User, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  MessageCircle, 
  AlertTriangle, 
  Zap, 
  Search, 
  MapPin, 
  Star, 
  Edit3, 
  ArrowRight, 
  ShieldCheck, 
  Ban, 
  Plus, 
  PhoneCall, 
  Compass, 
  LayoutDashboard, 
  Sliders, 
  DollarSign, 
  UserPlus, 
  Eye, 
  Trash2, 
  X,
  CheckSquare,
  Square,
  LogOut,
  KeyRound,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

interface Slot {
  id: string;
  hourNumber: number;
  time: string;
  isBooked: boolean;
  bookedBy?: string;
  phone?: string;
  price: number;
}

interface Pitch {
  id: string;
  name: string;
  area: string;
  city: string;
  type: string;
  ownerName: string;
  ownerPhone: string;
  defaultPricePerHour: number;
  rating: number;
  imageUrl: string;
  bio: string;
  features: string[];
  subscriptionStatus: 'active' | 'expired' | 'emergency';
  subscriptionDaysLeft: number;
  lastRenewDate: string;
  emergencyUsedInCurrentCycle: boolean;
}

const MASTER_24_HOURS = [
  { h: 0, label: '12:00 ص - 01:00 ص', period: 'ليل' },
  { h: 1, label: '01:00 ص - 02:00 ص', period: 'ليل' },
  { h: 2, label: '02:00 ص - 03:00 ص', period: 'ليل' },
  { h: 3, label: '03:00 ص - 04:00 ص', period: 'فجر' },
  { h: 4, label: '04:00 ص - 05:00 ص', period: 'فجر' },
  { h: 5, label: '05:00 ص - 06:00 ص', period: 'صباح' },
  { h: 6, label: '06:00 ص - 07:00 ص', period: 'صباح' },
  { h: 7, label: '07:00 ص - 08:00 ص', period: 'صباح' },
  { h: 8, label: '08:00 ص - 09:00 ص', period: 'صباح' },
  { h: 9, label: '09:00 ص - 10:00 ص', period: 'صباح' },
  { h: 10, label: '10:00 ص - 11:00 ص', period: 'صباح' },
  { h: 11, label: '11:00 ص - 12:00 م', period: 'ظهر' },
  { h: 12, label: '12:00 م - 01:00 م', period: 'ظهر' },
  { h: 13, label: '01:00 م - 02:00 م', period: 'ظهر' },
  { h: 14, label: '02:00 م - 03:00 م', period: 'عصر' },
  { h: 15, label: '03:00 م - 04:00 م', period: 'عصر' },
  { h: 16, label: '04:00 م - 05:00 م', period: 'عصر' },
  { h: 17, label: '05:00 م - 06:00 م', period: 'مساء' },
  { h: 18, label: '06:00 م - 07:00 م', period: 'مساء' },
  { h: 19, label: '07:00 م - 08:00 م', period: 'مساء' },
  { h: 20, label: '08:00 م - 09:00 م', period: 'مساء' },
  { h: 21, label: '09:00 م - 10:00 م', period: 'ليل' },
  { h: 22, label: '10:00 م - 11:00 م', period: 'ليل' },
  { h: 23, label: '11:00 م - 12:00 ص', period: 'ليل' },
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState<{
    role: 'guest' | 'player' | 'owner' | 'admin';
    name?: string;
    phone?: string;
  }>({ role: 'guest' });

  const [activePortal, setActivePortal] = useState<'player' | 'owner'>('player');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regPitchName, setRegPitchName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');
  const [authError, setAuthError] = useState('');

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [ownerTab, setOwnerTab] = useState<'bookings' | 'profile'>('bookings');

  const [pitchesList, setPitchesList] = useState<Pitch[]>([
    {
      id: 'p-1',
      name: 'ملعب الأساطير الدولي',
      area: 'المنصور - شارع 14 رمضان',
      city: 'بغداد',
      type: 'خماسي ثيل تركي درجة أولى',
      ownerName: 'كابتن hbosh',
      ownerPhone: '07800000000',
      defaultPricePerHour: 20000,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1529900241456-075e81d77a82?w=800&auto=format&fit=crop&q=60',
      bio: 'أحدث ساحة خماسية في المنصور، ثيل هولندي معتمد، كشافات ليد إضاءة نهارية، كافتيريا وغرف تبديل مع دوش حار وبارد، بارك سيارات مخصص ومراقب.',
      features: ['ثيل عالي الجودة', 'إنارة ليد دولية', 'كافتيريا وعصائر', 'غرف تبديل وتبريد', 'كراج سيارات'],
      subscriptionStatus: 'active',
      subscriptionDaysLeft: 30,
      lastRenewDate: '2026-09-01',
      emergencyUsedInCurrentCycle: false
    }
  ]);

  const pitch = pitchesList[0] || null;

  const [editName, setEditName] = useState(pitch?.name || '');
  const [editArea, setEditArea] = useState(pitch?.area || '');
  const [editBio, setEditBio] = useState(pitch?.bio || '');
  const [editImage, setEditImage] = useState(pitch?.imageUrl || '');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingCaptainName, setBookingCaptainName] = useState('');
  const [bookingCaptainPhone, setBookingCaptainPhone] = useState('');

  const [ownerManualSlot, setOwnerManualSlot] = useState<Slot | null>(null);
  const [ownerTeamName, setOwnerTeamName] = useState('');
  const [ownerTeamPhone, setOwnerTeamPhone] = useState('');

  const [viewDetailsSlot, setViewDetailsSlot] = useState<Slot | null>(null);
  const [slotToConfirmCancel, setSlotToConfirmCancel] = useState<Slot | null>(null);

  const [adminConfirmAction, setAdminConfirmAction] = useState<'renew' | 'expire' | 'delete' | null>(null);

  const [selectedHours24, setSelectedHours24] = useState<number[]>([16, 17, 18, 19, 20, 21, 22, 23, 0]);
  const [scheduleTargetDateStr, setScheduleTargetDateStr] = useState('');
  const [schedulePrice, setSchedulePrice] = useState(20000);
  const [applyToAllDays, setApplyToAllDays] = useState(true);

  const [revenueFilter, setRevenueFilter] = useState<'daily' | 'monthly'>('daily');

  const adminWhatsAppNumber = "9647800000000";
  const zainCashWalletNumber = "0780XXXXXXX";

  // إظهار الشهر بجانب اليوم لكي لا يدوخ اللاعبون
  const dateOptions = useMemo(() => {
    const days = [];
    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const arabicMonths = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayName = arabicDays[d.getDay()];
      const dayNum = d.getDate();
      const monthName = arabicMonths[d.getMonth()];
      const dateStr = d.toISOString().split('T')[0];
      days.push({ index: i, dayName, dayNum, monthName, dateStr });
    }
    return days;
  }, []);

  const selectedDate = dateOptions[selectedDateIndex];

  const generateSlotsFromHours = (hoursList: number[], price: number, dateStr: string): Slot[] => {
    const sorted = [...hoursList].sort((a, b) => a - b);
    return sorted.map((h) => {
      const masterObj = MASTER_24_HOURS.find(m => m.h === h)!;
      return {
        id: `${dateStr}-${h}`,
        hourNumber: h,
        time: masterObj.label,
        isBooked: false,
        price: price
      };
    });
  };

  const [allSlots, setAllSlots] = useState<Record<string, Slot[]>>(() => {
    const initial: Record<string, Slot[]> = {};
    const defaultHours = [16, 17, 18, 19, 20, 21, 22, 23, 0];
    dateOptions.forEach((d, dIdx) => {
      const slots = generateSlotsFromHours(defaultHours, 20000, d.dateStr);
      if (dIdx === 0 && slots.length > 2) {
        slots[1] = { ...slots[1], isBooked: true, bookedBy: 'كابتن سرمد', phone: '07701234567' };
        slots[3] = { ...slots[3], isBooked: true, bookedBy: 'فريق النسور', phone: '07809876543' };
      }
      initial[d.dateStr] = slots;
    });
    return initial;
  });

  const currentDaySlots = allSlots[selectedDate.dateStr] || [];
  const currentDayBookedCount = currentDaySlots.filter(s => s.isBooked).length;
  const currentDayRevenue = currentDaySlots.filter(s => s.isBooked).reduce((sum, s) => sum + s.price, 0);

  const totalMonthlyRevenue = Object.values(allSlots).flat().filter(s => s.isBooked).reduce((sum, s) => sum + s.price, 0) + (26 * 20000);

  const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(
    `مرحباً إدارة لعبتنا ⚽\nأنا كابتن (${pitch?.name || 'الملعب'}). حولت مبلغ الاشتراك عبر زين كاش.\nمرفق لكم سكرين شوت التحويل 📸👇`
  )}`;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPhone.length !== 11 || !loginPhone.startsWith('07')) {
      setAuthError('يرجى إدخال رقم هاتف عراقي صحيح (11 رقماً يبدأ بـ 07)');
      return;
    }
    if (!loginPassword) {
      setAuthError('أدخل كلمة المرور');
      return;
    }

    setAuthError('');
    setCurrentUser({
      role: activePortal,
      name: activePortal === 'player' ? 'كابتن الفريق' : (pitch?.name || 'صاحب الملعب'),
      phone: loginPhone
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPhone.length !== 11 || !regPhone.startsWith('07')) {
      setAuthError('يرجى إدخال رقم هاتف عراقي مكون من 11 رقماً');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setAuthError('كلمة المرور يجب أن تكون 4 خانات على الأقل');
      return;
    }

    setAuthError('');
    if (activePortal === 'owner') {
      const newPitchObj: Pitch = {
        id: 'p-' + Date.now(),
        name: regPitchName || 'ملعب جديد',
        area: 'بغداد',
        city: 'بغداد',
        type: 'خماسي',
        ownerName: regName || 'صاحب الملعب',
        ownerPhone: regPhone,
        defaultPricePerHour: 20000,
        rating: 5.0,
        imageUrl: 'https://images.unsplash.com/photo-1529900241456-075e81d77a82?w=800&auto=format&fit=crop&q=60',
        bio: 'ملعب جديد مجهز بالكامل.',
        features: ['ثيل صناعي'],
        subscriptionStatus: 'expired',
        subscriptionDaysLeft: 0,
        lastRenewDate: '-',
        emergencyUsedInCurrentCycle: false
      };
      setPitchesList([newPitchObj]);
    }

    setCurrentUser({
      role: activePortal,
      name: regName || (activePortal === 'player' ? 'كابتن الفريق' : 'صاحب الملعب'),
      phone: regPhone
    });
  };

  const handleSendWhatsAppOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPhone.length !== 11 || !forgotPhone.startsWith('07')) {
      setAuthError('يرجى إدخال رقم هاتف عراقي صحيح (11 رقماً)');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setAuthError('');
    setAuthMsg(`تم إرسال كود التأكيد (6 أرقام) إلى واتساب رقمك: ${forgotPhone}`);
    setForgotStep(2);

    const waOtpLink = `https://wa.me/964${forgotPhone.replace(/^0/, '')}?text=${encodeURIComponent(
      `رمز استعادة كلمة السر لمنصة لعبتنا هو: ${code}\nلا تشارك هذا الرمز مع أي شخص.`
    )}`;
    window.open(waOtpLink, '_blank');
  };

  const handleVerifyOtpAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp !== generatedOtp) {
      setAuthError('رمز التأكيد غير صحيح! تأكد من الـ 6 أرقام الواردة على الواتساب');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setAuthError('كلمة المرور الجديدة يجب أن تكون 4 أحرف أو أرقام على الأقل');
      return;
    }

    setAuthError('');
    setAuthMsg('');
    setCurrentUser({
      role: activePortal,
      name: activePortal === 'player' ? 'كابتن الفريق' : (pitch?.name || 'صاحب الملعب'),
      phone: forgotPhone
    });
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'hbosh' && adminPassword === 'Zz@101620') {
      setCurrentUser({ role: 'admin', name: 'المسؤول الرئيسي' });
      setShowAdminModal(false);
      setAdminUsername('');
      setAdminPassword('');
      setAuthError('');
    } else {
      setAuthError('اسم المستخدم أو كلمة المرور غير صحيحة!');
    }
  };

  const openPlayerBookingModal = (slot: Slot) => {
    setSelectedSlot(slot);
    setBookingCaptainName(currentUser.name || '');
    setBookingCaptainPhone(currentUser.phone || '');
  };

  const handleConfirmPlayerBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !bookingCaptainName || bookingCaptainPhone.length !== 11) return;

    setAllSlots(prev => ({
      ...prev,
      [selectedDate.dateStr]: prev[selectedDate.dateStr].map(slot => 
        slot.id === selectedSlot.id 
          ? { ...slot, isBooked: true, bookedBy: bookingCaptainName, phone: bookingCaptainPhone }
          : slot
      )
    }));

    setSelectedSlot(null);
  };

  const handleOwnerManualBookingSubmit = () => {
    if (!ownerManualSlot || !ownerTeamName || ownerTeamPhone.length !== 11) return;
    setAllSlots(prev => ({
      ...prev,
      [selectedDate.dateStr]: (prev[selectedDate.dateStr] || []).map(slot =>
        slot.id === ownerManualSlot.id
          ? { ...slot, isBooked: true, bookedBy: ownerTeamName, phone: ownerTeamPhone }
          : slot
      )
    }));
    setOwnerManualSlot(null);
    setOwnerTeamName('');
    setOwnerTeamPhone('');
  };

  const executeClearSlot = () => {
    if (!slotToConfirmCancel) return;
    setAllSlots(prev => ({
      ...prev,
      [selectedDate.dateStr]: prev[selectedDate.dateStr].map(slot => 
        slot.id === slotToConfirmCancel.id
          ? { ...slot, isBooked: false, bookedBy: undefined, phone: undefined }
          : slot
      )
    }));
    setSlotToConfirmCancel(null);
    setViewDetailsSlot(null);
  };

  const toggleHour24 = (hour: number) => {
    setSelectedHours24(prev => 
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const saveFullSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch) return;
    setPitchesList(prev => prev.map(p => p.id === pitch.id ? {
      ...p,
      name: editName,
      area: editArea,
      bio: editBio,
      imageUrl: editImage,
      defaultPricePerHour: schedulePrice
    } : p));

    setAllSlots(prev => {
      const updated = { ...prev };
      const targetDateStrings = applyToAllDays 
        ? dateOptions.map(d => d.dateStr) 
        : [scheduleTargetDateStr || selectedDate.dateStr];

      targetDateStrings.forEach(dStr => {
        const existingBooked = (prev[dStr] || []).filter(s => s.isBooked);
        const newSlots = generateSlotsFromHours(selectedHours24, schedulePrice, dStr);

        const mergedSlots = newSlots.map(ns => {
          const matched = existingBooked.find(eb => eb.hourNumber === ns.hourNumber);
          if (matched) {
            return { ...ns, isBooked: true, bookedBy: matched.bookedBy, phone: matched.phone };
          }
          return ns;
        });

        updated[dStr] = mergedSlots;
      });

      return updated;
    });

    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3500);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 md:p-8 flex flex-col justify-between">
      <div>
        <header className="max-w-5xl mx-auto flex justify-between items-center pb-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-900/40">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">لعبتنا</h1>
              <p className="text-[10px] text-slate-400">منظومة حجز الملاعب في العراق</p>
            </div>
          </div>

          {currentUser.role !== 'guest' && (
            <div className="flex items-center gap-3">
              <div className="text-left">
                <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                <span className="text-[10px] text-emerald-400 block font-mono">
                  {currentUser.role === 'player' ? 'حساب كابتن' : currentUser.role === 'owner' ? 'لوحة الملعب' : 'الإدارة العامة'}
                </span>
              </div>
              <button
                onClick={() => {
                  setCurrentUser({ role: 'guest' });
                  setSelectedPitchId(null);
                }}
                className="p-2 bg-slate-900 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </header>

        <main className="max-w-5xl mx-auto mt-6">

          {currentUser.role === 'guest' && (
            <div className="py-8 md:py-14 max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">مرحباً بك في لعبتنا</h2>
                <p className="text-xs text-slate-400">سجّل دخولك للوصول إلى الملاعب والحجوزات</p>
              </div>

              <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal('player');
                    setAuthMode('login');
                    setAuthError('');
                    setAuthMsg('');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activePortal === 'player' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4" /> أنا لاعب / فريق
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal('owner');
                    setAuthMode('login');
                    setAuthError('');
                    setAuthMsg('');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activePortal === 'owner' ? 'bg-amber-600 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> أنا صاحب ملعب
                </button>
              </div>

              {authMode === 'login' && (
                <form onSubmit={handleLogin} className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <h3 className="font-bold text-sm text-white">
                      تسجيل دخول {activePortal === 'player' ? 'اللاعبين' : 'صاحب الملعب'}
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-bold">حساب مسجل</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">رقم الهاتف العراقي</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="07XXXXXXXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-300">كلمة المرور</label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setForgotStep(1);
                          setForgotPhone(loginPhone);
                          setAuthError('');
                          setAuthMsg('');
                        }}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        نسيت كلمة السر؟
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {authError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl text-xs font-black transition-all shadow-lg ${
                      activePortal === 'player'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                        : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-950'
                    }`}
                  >
                    تسجيل الدخول
                  </button>

                  <div className="text-center pt-3 border-t border-slate-800 text-xs text-slate-400">
                    ليس لديك حساب؟{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError('');
                        setAuthMsg('');
                      }}
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      أنشئ حسابك الآن مجاناً
                    </button>
                  </div>
                </form>
              )}

              {authMode === 'register' && (
                <form onSubmit={handleRegister} className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <h3 className="font-bold text-sm text-white">
                      إنشاء حساب مجاني ({activePortal === 'player' ? 'لاعب' : 'صاحب ملعب'})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> العودة للدخول
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      {activePortal === 'player' ? 'اسم الكابتن أو الفريق' : 'اسم صاحب الملعب'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="مثال: كابتن ليث"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {activePortal === 'owner' && (
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">اسم الملعب</label>
                      <input
                        type="text"
                        required
                        value={regPitchName}
                        onChange={(e) => setRegPitchName(e.target.value)}
                        placeholder="مثال: ملعب النجوم الدولي"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">رقم الهاتف (11 رقماً)</label>
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="07XXXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">كلمة المرور للحساب</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="اختر كلمة مرور"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {authError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl text-xs font-black transition-all shadow-lg ${
                      activePortal === 'player'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                        : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-950'
                    }`}
                  >
                    تأكيد إنشاء الحساب
                  </button>
                </form>
              )}

              {authMode === 'forgot' && (
                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-400" /> استعادة كلمة السر عبر واتساب
                    </h3>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      إلغاء
                    </button>
                  </div>

                  {forgotStep === 1 ? (
                    <form onSubmit={handleSendWhatsAppOtp} className="space-y-4">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        أدخل رقم هاتفك المسجل، وسيتم فتح تطبيق <strong>واتساب</strong> وإرسال رمز تأكيد مكوّن من <strong>6 أرقام</strong>.
                      </p>
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">رقم الهاتف المسجل</label>
                        <input
                          type="tel"
                          required
                          maxLength={11}
                          value={forgotPhone}
                          onChange={(e) => setForgotPhone(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="07XXXXXXXXX"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {authError && <p className="text-xs text-rose-400">{authError}</p>}

                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" /> إرسال رمز التأكيد (6 أرقام) للواتساب
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                      {authMsg && (
                        <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>تم إرسال كود التأكيد (رمز التجربة: <strong>{generatedOtp}</strong>)</span>
                        </div>
                      )}

                      <div>
                        <label className="text-xs text-slate-300 block mb-1">أدخل رمز التأكيد (6 أرقام)</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="مثلاً: 849201"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl text-center py-2.5 text-lg text-white font-mono tracking-widest focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 block mb-1">كلمة المرور الجديدة</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="أدخل كلمة المرور الجديدة"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {authError && <p className="text-xs text-rose-400">{authError}</p>}

                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg"
                      >
                        تأكيد الرمز والدخول إلى حسابي
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 1. واجهة صاحب الملعب */}
          {currentUser.role === 'owner' && (
            <div>
              {!pitch || pitch.subscriptionStatus === 'expired' ? (
                <div className="bg-slate-900 border border-rose-900/80 rounded-3xl p-6 md:p-10 max-w-2xl mx-auto my-8 text-center shadow-2xl space-y-6">
                  <div className="w-16 h-16 bg-rose-950/80 border border-rose-800 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white">تفعيل اشتراك الملعب</h3>
                    <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                      تم تعليق أو انتهاء اشتراك الملعب. لتفعيله مجدداً، يرجى التواصل مع الإدارة أو تحويل مبلغ الاشتراك عبر زين كاش.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-right">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <span className="text-slate-400">قيمة الاشتراك:</span>
                      <span className="text-emerald-400 font-bold text-sm">75,000 د.ع / 30 يوماً</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">محفظة زين كاش للإدارة:</span>
                      <span className="text-white font-mono font-black text-sm">{zainCashWalletNumber}</span>
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle className="w-5 h-5" /> إرسال سكرين شوت التحويل عبر واتساب
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex border-b border-slate-800 gap-6">
                    <button
                      onClick={() => setOwnerTab('bookings')}
                      className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                        ownerTab === 'bookings' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4" /> إدارة الحجوزات والأرباح
                    </button>
                    <button
                      onClick={() => setOwnerTab('profile')}
                      className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                        ownerTab === 'profile' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" /> البروفايل وساعات الـ 24 ساعة
                    </button>
                  </div>

                  {ownerTab === 'bookings' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">إحصائيات الأرباح</span>
                            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex gap-1">
                              <button
                                onClick={() => setRevenueFilter('daily')}
                                className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${
                                  revenueFilter === 'daily' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                                }`}
                              >
                                اليومية
                              </button>
                              <button
                                onClick={() => setRevenueFilter('monthly')}
                                className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${
                                  revenueFilter === 'monthly' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                                }`}
                              >
                                الشهرية
                              </button>
                            </div>
                          </div>
                          <p className="text-2xl font-black text-white mt-3">
                            {revenueFilter === 'daily' ? `${currentDayRevenue.toLocaleString()} د.ع` : `${totalMonthlyRevenue.toLocaleString()} د.ع`}
                          </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                          <span className="text-xs text-slate-400 font-medium">حجوزات اليوم ({selectedDate.dayName})</span>
                          <p className="text-2xl font-black text-white mt-3">
                            {currentDayBookedCount} / {currentDaySlots.length}
                          </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-xs text-slate-400 font-medium">الاشتراك</span>
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold mr-2">
                              نشط ({pitch.subscriptionDaysLeft} يوم)
                            </span>
                          </div>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-bold py-2 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> إرسال وصل تجديد مسبق
                          </a>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                        <h4 className="font-bold text-sm text-white mb-4">جدول ساعات: {selectedDate.dayName} ({selectedDate.dateStr})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {currentDaySlots.map(slot => (
                            <div
                              key={slot.id}
                              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                                slot.isBooked ? 'bg-slate-900/95 border-rose-900/50' : 'bg-slate-950 border-slate-800/80'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-white">{slot.time}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                  slot.isBooked ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-400'
                                }`}>
                                  {slot.isBooked ? 'محجوزة' : 'فارغة'}
                                </span>
                              </div>

                              {slot.isBooked ? (
                                <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-200">{slot.bookedBy}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{slot.phone}</span>
                                  </div>
                                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                                    <button
                                      onClick={() => setSlotToConfirmCancel(slot)}
                                      className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> تفريغ
                                    </button>
                                    <button
                                      onClick={() => setViewDetailsSlot(slot)}
                                      className="px-2.5 py-1 bg-slate-800 text-emerald-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> المعلومات
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setOwnerManualSlot(slot);
                                    setOwnerTeamName('');
                                    setOwnerTeamPhone('');
                                  }}
                                  className="w-full py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center justify-center gap-1.5"
                                >
                                  <UserPlus className="w-3.5 h-3.5" /> تسجيل حجز هاتفي يدوي
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {ownerTab === 'profile' && (
                    <form onSubmit={saveFullSettings} className="space-y-6 max-w-3xl">
                      {profileSavedToast && (
                        <div className="p-3 bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> تم حفظ التعديلات وتحديث كل الساعات والأسعار في الموقع!
                        </div>
                      )}
                      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
                        <h4 className="font-bold text-white text-base">تحديد الساعات من قائمة الـ 24</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto">
                          {MASTER_24_HOURS.map(slot => (
                            <button
                              type="button"
                              key={slot.h}
                              onClick={() => toggleHour24(slot.h)}
                              className={`p-2.5 rounded-xl border text-right text-xs transition-all flex justify-between items-center ${
                                selectedHours24.includes(slot.h) ? 'bg-emerald-950 border-emerald-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
                              }`}
                            >
                              <span>{slot.label}</span>
                              {selectedHours24.includes(slot.h) ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5 text-slate-600" />}
                            </button>
                          ))}
                        </div>
                        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="text-xs text-slate-300 block mb-1">سعر الساعة (د.ع):</label>
                            <input
                              type="number"
                              value={schedulePrice}
                              onChange={(e) => setSchedulePrice(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs transition-all"
                      >
                        حفظ الساعات والأسعار
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. واجهة اللاعب (يعرض اليوم مع الشهر بوضوح) */}
          {currentUser.role === 'player' && (
            <div>
              {!selectedPitchId ? (
                <div className="space-y-6">
                  <div className="text-center py-4 max-w-xl mx-auto">
                    <h2 className="text-2xl font-black text-white">الملاعب المتاحة للحجز</h2>
                    <p className="text-xs text-slate-400 mt-1">اختر ملعبك المفضل وتصفح أوقات الفراغ فوراً</p>
                  </div>

                  {pitchesList.filter(p => p.subscriptionStatus === 'active').length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl text-center space-y-3 max-w-md mx-auto">
                      <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                      <h4 className="font-bold text-white text-base">لا توجد ملاعب متاحة حالياً</h4>
                      <p className="text-xs text-slate-400">جميع اشتراكات الملاعب منتهية أو معطلة مؤقتاً من قبل الإدارة.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {pitchesList.filter(p => p.subscriptionStatus === 'active').map(p => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPitchId(p.id)}
                          className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-all group"
                        >
                          <img src={p.imageUrl} alt={p.name} className="w-full h-44 object-cover" />
                          <div className="p-5 space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="font-bold text-white text-base">{p.name}</h3>
                              <span className="text-emerald-400 font-bold text-sm">{p.defaultPricePerHour.toLocaleString()} د.ع</span>
                            </div>
                            <p className="text-xs text-slate-400">{p.area}</p>
                            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-emerald-400 font-bold">
                              <span>عرض الساعات والحجز</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={() => setSelectedPitchId(null)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-4 h-4" /> العودة لقائمة الملاعب
                  </button>

                  {pitch && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
                      <h2 className="text-2xl font-black text-white">{pitch.name}</h2>
                      <p className="text-xs text-slate-300">{pitch.bio}</p>

                      {/* شريط الأيام والتواريخ مع الشهر بوضوح */}
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {dateOptions.map(date => (
                          <button
                            key={date.index}
                            onClick={() => setSelectedDateIndex(date.index)}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-center text-xs transition-all ${
                              selectedDateIndex === date.index ? 'bg-emerald-600 text-white font-bold shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="block font-bold">{date.dayName} {date.dayNum}</span>
                            <span className="text-[10px] opacity-80 block mt-0.5">{date.monthName}</span>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
                        {currentDaySlots.map(slot => (
                          <button
                            key={slot.id}
                            disabled={slot.isBooked}
                            onClick={() => openPlayerBookingModal(slot)}
                            className={`p-4 rounded-2xl border text-right transition-all flex justify-between items-center ${
                              slot.isBooked ? 'bg-rose-950/20 border-rose-900/30 opacity-60' : 'bg-slate-950 border-slate-800 hover:border-emerald-500'
                            }`}
                          >
                            <div>
                              <span className="text-sm font-bold text-white block">{slot.time}</span>
                              <span className="text-xs text-emerald-400 font-bold block mt-0.5">{slot.price.toLocaleString()} د.ع</span>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                              slot.isBooked ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                            }`}>
                              {slot.isBooked ? 'مقفول' : 'احجز الآن'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. لوحة الإدارة المركزية */}
          {currentUser.role === 'admin' && (
            <div className="bg-slate-900 border border-blue-900/60 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-lg font-black text-white">لوحة الإدارة المركزية (إدارة الملاعب والتعاقدات)</h3>
              </div>

              {pitchesList.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                  لا توجد ملاعب مسجلة حالياً في النظام (تم حذف جميع التعاقدات).
                </div>
              ) : (
                pitchesList.map(p => (
                  <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-900">
                      <div>
                        <h4 className="font-bold text-white text-base">{p.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">العنوان: {p.area}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        p.subscriptionStatus === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {p.subscriptionStatus === 'active' ? `الاشتراك نشط (${p.subscriptionDaysLeft} يوم متبقي)` : 'الاشتراك منتهي / معطل'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 block">اسم صاحب الملعب:</span>
                        <span className="text-white font-bold text-sm block">{p.ownerName}</span>
                      </div>
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 block">رقم هاتفه:</span>
                        <span className="text-emerald-400 font-mono font-bold text-sm block">{p.ownerPhone}</span>
                      </div>
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 block">آخر تاريخ تجديد:</span>
                        <span className="text-amber-400 font-mono font-bold text-sm block">{p.lastRenewDate}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        onClick={() => setAdminConfirmAction('renew')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                      >
                        + تمديد الاشتراك 30 يوماً
                      </button>
                      <button
                        onClick={() => setAdminConfirmAction('expire')}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                      >
                        تعطيل اشتراك الملعب
                      </button>
                      <button
                        onClick={() => setAdminConfirmAction('delete')}
                        className="bg-slate-800 hover:bg-rose-900 text-rose-400 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-slate-700"
                      >
                        🗑️ حذف الملعب للأبد (إنهاء التعاقد)
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </main>
      </div>

      <footer className="mt-12 pt-4 border-t border-slate-900 text-center text-xs text-slate-600">
        <button
          onClick={() => setShowAdminModal(true)}
          className="hover:text-slate-400 transition-colors flex items-center justify-center gap-1 mx-auto"
        >
          <Lock className="w-3 h-3" /> بوابة الإدارة (Master Access)
        </button>
      </footer>

      {/* نافذة تأكيد الإدارة (الضغطرة الثانية) */}
      {adminConfirmAction && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-950 border border-amber-800 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h5 className="font-black text-white text-base">
              {adminConfirmAction === 'renew' && 'تأكيد تمديد اشتراك الملعب لشهر إضافي؟'}
              {adminConfirmAction === 'expire' && 'تأكيد تعطيل اشتراك هذا الملعب؟'}
              {adminConfirmAction === 'delete' && 'تأكيد حذف الملعب وإنهاء التعاقد للأبد؟'}
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              {adminConfirmAction === 'renew' && 'سيتم إضافة 30 يوماً وتحديث تاريخ التجديد لملعب الأساطير.'}
              {adminConfirmAction === 'expire' && 'سيتم إخفاء الملعب فوراً من واجهة اللاعبين ومنع الحجوزات.'}
              {adminConfirmAction === 'delete' && 'تحذير: سيتم إزالة الملعب من المنصة نهائياً ولن يظهر بعد الآن.'}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  if (adminConfirmAction === 'renew' && pitch) {
                    setPitchesList(prev => prev.map(p => ({
                      ...p,
                      subscriptionStatus: 'active',
                      subscriptionDaysLeft: p.subscriptionDaysLeft + 30,
                      lastRenewDate: todayStr
                    })));
                  } else if (adminConfirmAction === 'expire' && pitch) {
                    setPitchesList(prev => prev.map(p => ({
                      ...p,
                      subscriptionStatus: 'expired',
                      subscriptionDaysLeft: 0
                    })));
                  } else if (adminConfirmAction === 'delete') {
                    setPitchesList([]);
                    setSelectedPitchId(null);
                  }
                  setAdminConfirmAction(null);
                }}
                className={`text-white font-bold py-2.5 rounded-xl text-xs ${
                  adminConfirmAction === 'delete' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                تأكيد التنفيذ
              </button>
              <button
                onClick={() => setAdminConfirmAction(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تسجيل دخول الإدارة */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-blue-900/80 w-full max-w-xs rounded-3xl p-6 space-y-4 text-center">
            <div className="w-10 h-10 bg-blue-950 border border-blue-800 text-blue-400 rounded-full flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white text-sm">دخول الإدارة العامة</h4>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-400 text-xs">إلغاء</button>
            </div>
            <form onSubmit={handleAdminLoginSubmit} className="space-y-3 text-right">
              <div>
                <label className="text-xs text-slate-300 block mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="hbosh"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              {authError && <p className="text-[11px] text-rose-400 text-center">{authError}</p>}
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs">
                دخول الإدارة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة حجز اللاعب */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white text-base">تأكيد حجز الساعة</h4>
              <button onClick={() => setSelectedSlot(null)} className="text-slate-400 text-xs">إلغاء</button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>الوقت:</span>
                <span className="text-emerald-400 font-bold">{selectedSlot.time}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>المبلغ:</span>
                <span className="text-white font-bold">{selectedSlot.price.toLocaleString()} د.ع</span>
              </div>
            </div>

            <form onSubmit={handleConfirmPlayerBooking} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">اسم الكابتن أو الفريق:</label>
                <input
                  type="text"
                  required
                  value={bookingCaptainName}
                  onChange={(e) => setBookingCaptainName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-300">رقم الهاتف:</label>
                  <span className="text-[10px] text-amber-400 font-medium">يمكنك تعديله إذا كنت تحجز لصديقك</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={bookingCaptainPhone}
                  onChange={(e) => setBookingCaptainPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono"
                />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs">
                تأكيد تثبيت الحجز
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تسجيل حجز يدوي لصاحب الملعب */}
      {ownerManualSlot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-amber-800/80 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-base text-white">تسجيل حجز هاتفي يدوي</h4>
              <button onClick={() => setOwnerManualSlot(null)} className="text-slate-400 text-xs">إلغاء</button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                required
                value={ownerTeamName}
                onChange={(e) => setOwnerTeamName(e.target.value)}
                placeholder="اسم الفريق / الكابتن"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="tel"
                required
                maxLength={11}
                value={ownerTeamPhone}
                onChange={(e) => setOwnerTeamPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="رقم الهاتف (07XXXXXXXXX)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
              />
              <button
                onClick={handleOwnerManualBookingSubmit}
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black py-2.5 rounded-xl text-xs"
              >
                تثبيت الحجز اليدوي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة التأكيد الإجبارية لتفريغ الساعة */}
      {slotToConfirmCancel && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-950 border border-rose-800 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h5 className="font-black text-white text-base">هل أنت متأكد من تفريغ الساعة؟</h5>
            <p className="text-xs text-slate-300">
              سيتم تفريغ موعد <strong>{slotToConfirmCancel.time}</strong> المحجوز باسم ({slotToConfirmCancel.bookedBy}).
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={executeClearSlot} className="bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs">
                تأكيد التفريغ
              </button>
              <button onClick={() => setSlotToConfirmCancel(null)} className="bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs">
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إظهار المعلومات الكاملة لصاحب الملعب */}
      {viewDetailsSlot && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-black text-base text-white">تفاصيل حجز الساعة ({viewDetailsSlot.time})</h4>
              <button onClick={() => setViewDetailsSlot(null)} className="text-slate-400 text-xs">إغلاق</button>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">الحاجز:</span>
                <span className="text-white font-bold">{viewDetailsSlot.bookedBy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">رقم الهاتف:</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">{viewDetailsSlot.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المبلغ:</span>
                <span className="text-white font-bold">{viewDetailsSlot.price.toLocaleString()} د.ع</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${viewDetailsSlot.phone}`}
                className="bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" /> اتصال هاتفي
              </a>
              <a
                href={`https://wa.me/964${viewDetailsSlot.phone?.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" /> محادثة واتساب
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
