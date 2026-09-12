'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  EyeOff,
  Trash2, 
  X, 
  CheckSquare, 
  Square, 
  LogOut, 
  KeyRound, 
  Repeat, 
  Bell,
  Check
} from 'lucide-react';

interface UserAccount {
  id: string;
  role: 'player' | 'owner';
  name: string;
  phone: string;
  password: string;
  pitchName?: string;
}

interface Pitch {
  id: string;
  ownerPhone: string;
  ownerName: string;
  name: string;
  area: string;
  city: string;
  type: string;
  defaultPricePerHour: number;
  rating: number;
  imageUrl: string;
  bio: string;
  features: string[];
  subscriptionStatus: 'pending' | 'active' | 'expired' | 'emergency';
  subscriptionExpiresAt: number;
  emergencyUsedInCurrentCycle: boolean;
  createdAt: string;
}

interface RecurringBooking {
  id: string;
  dayName: string;
  hourNumber: number;
  bookedBy: string;
  phone: string;
  isPermanent: boolean;
}

interface Slot {
  id: string;
  hourNumber: number;
  time: string;
  isBooked: boolean;
  isRecurring?: boolean;
  bookedBy?: string;
  phone?: string;
  price: number;
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
  const [isClient, setIsClient] = useState(false);

  // قاعدة بيانات الحسابات
  const [accountsDb, setAccountsDb] = useState<UserAccount[]>([
    { id: 'u-1', role: 'player', name: 'كابتن مرتضى', phone: '07701112233', password: '123' },
    { id: 'u-2', role: 'owner', name: 'أبو فهد', phone: '07801112233', password: '123', pitchName: 'ملعب الأساطير الدولي' },
  ]);

  // قائمة الملاعب
  const [pitchesList, setPitchesList] = useState<Pitch[]>([
    {
      id: 'p-1',
      ownerPhone: '07801112233',
      ownerName: 'أبو فهد',
      name: 'ملعب الأساطير الدولي',
      area: 'المنصور - شارع 14 رمضان',
      city: 'بغداد',
      type: 'خماسي ثيل تركي درجة أولى',
      defaultPricePerHour: 20000,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1529900241456-075e81d77a82?w=800&auto=format&fit=crop&q=60',
      bio: 'أحدث ساحة خماسية في المنصور، ماء بارد مجاني، ثيل هولندي معتمد، كشافات ليد دولية، غرف تبديل وتبريد، كراج سيارات مراقب.',
      features: ['ماء شرب وعصائر', 'إنارة ليد دولية', 'غرف تبديل وتبريد', 'كراج سيارات'],
      subscriptionStatus: 'active',
      subscriptionExpiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
      emergencyUsedInCurrentCycle: false,
      createdAt: '2026-09-10'
    }
  ]);

  // استرجاع البيانات من التخزين المحلي فور تحميل الواجهة
  useEffect(() => {
    setIsClient(true);
    const savedAcc = localStorage.getItem('malaeb_accounts_db_v3');
    if (savedAcc) {
      try { setAccountsDb(JSON.parse(savedAcc)); } catch (e) {}
    }
    const savedPitches = localStorage.getItem('malaeb_pitches_v3');
    if (savedPitches) {
      try { setPitchesList(JSON.parse(savedPitches)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('malaeb_accounts_db_v3', JSON.stringify(accountsDb));
      localStorage.setItem('malaeb_pitches_v3', JSON.stringify(pitchesList));
    }
  }, [accountsDb, pitchesList, isClient]);

  const [currentUser, setCurrentUser] = useState<{
    role: 'guest' | 'player' | 'owner' | 'admin';
    name?: string;
    phone?: string;
  }>({ role: 'guest' });

  const [activePortal, setActivePortal] = useState<'player' | 'owner'>('player');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'verify_reg_otp' | 'forgot'>('login');

  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regName, setRegName] = useState('');
  const [regPitchName, setRegPitchName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regOtpGenerated, setRegOtpGenerated] = useState('');
  const [regOtpInput, setRegOtpInput] = useState('');

  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotOtpGenerated, setForgotOtpGenerated] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [authMsg, setAuthMsg] = useState('');
  const [authError, setAuthError] = useState('');

  // إعدادات أمان الإدارة المشددة
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminFailedAttempts, setAdminFailedAttempts] = useState(0);
  const [adminLockoutTime, setAdminLockoutTime] = useState<number | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  const ADMIN_USER = "admin";
  const ADMIN_SECRET_CODE = "Admin@964#2026"; // كلمة المرور المشفرة والمعقدة

  // مؤقت التنازل لقفل الإدارة
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (adminLockoutTime && adminLockoutTime > Date.now()) {
      setLockoutCountdown(Math.ceil((adminLockoutTime - Date.now()) / 1000));
      timer = setInterval(() => {
        const remaining = Math.ceil((adminLockoutTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setAdminLockoutTime(null);
          setAdminFailedAttempts(0);
          setLockoutCountdown(0);
          setAuthError('');
          clearInterval(timer);
        } else {
          setLockoutCountdown(remaining);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [adminLockoutTime]);

  const [ownerTab, setOwnerTab] = useState<'bookings' | 'profile'>('bookings');

  const currentOwnerPitch = pitchesList.find(p => p.ownerPhone === currentUser.phone) || pitchesList[0];
  const isCurrentPitchExpired = currentOwnerPitch ? currentOwnerPitch.subscriptionExpiresAt <= Date.now() : false;
  const calculatedDaysLeft = currentOwnerPitch ? Math.max(0, Math.ceil((currentOwnerPitch.subscriptionExpiresAt - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  const [editName, setEditName] = useState(currentOwnerPitch?.name || '');
  const [editArea, setEditArea] = useState(currentOwnerPitch?.area || '');
  const [editBio, setEditBio] = useState(currentOwnerPitch?.bio || '');
  const [editImage, setEditImage] = useState(currentOwnerPitch?.imageUrl || '');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const [recurringBookings, setRecurringBookings] = useState<RecurringBooking[]>([
    { id: 'rec-1', dayName: 'الجمعة', hourNumber: 21, bookedBy: 'فريق الملكي (شفت ثابت)', phone: '07709988776', isPermanent: true }
  ]);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingCaptainName, setBookingCaptainName] = useState('');
  const [bookingCaptainPhone, setBookingCaptainPhone] = useState('');
  const [isPermanentBooking, setIsPermanentBooking] = useState(false);

  const [ownerManualSlot, setOwnerManualSlot] = useState<Slot | null>(null);
  const [ownerTeamName, setOwnerTeamName] = useState('');
  const [ownerTeamPhone, setOwnerTeamPhone] = useState('');
  const [ownerIsPermanentBooking, setOwnerIsPermanentBooking] = useState(false);

  const [viewDetailsSlot, setViewDetailsSlot] = useState<Slot | null>(null);
  const [slotToConfirmCancel, setSlotToConfirmCancel] = useState<Slot | null>(null);

  const [selectedHours24, setSelectedHours24] = useState<number[]>([16, 17, 18, 19, 20, 21, 22, 23, 0]);
  const [scheduleTargetDateStr, setScheduleTargetDateStr] = useState('');
  const [schedulePrice, setSchedulePrice] = useState(20000);
  const [applyToAllDays, setApplyToAllDays] = useState(true);

  const [revenueFilter, setRevenueFilter] = useState<'daily' | 'monthly'>('daily');

  const adminWhatsAppNumber = "9647800000000";
  const zainCashWalletNumber = "0780XXXXXXX";

  const dateOptions = useMemo(() => {
    const days = [];
    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const arabicMonths = ['كانون 2', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين 1', 'تشرين 2', 'كانون 1'];

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

  const generateSlots = (hoursList: number[], price: number, dateStr: string, dayName: string): Slot[] => {
    const sorted = [...hoursList].sort((a, b) => a - b);
    return sorted.map((h) => {
      const masterObj = MASTER_24_HOURS.find(m => m.h === h)!;
      const recurringMatch = recurringBookings.find(rb => rb.dayName === dayName && rb.hourNumber === h);

      return {
        id: `${dateStr}-${h}`,
        hourNumber: h,
        time: masterObj.label,
        isBooked: !!recurringMatch,
        isRecurring: !!recurringMatch,
        bookedBy: recurringMatch ? recurringMatch.bookedBy : undefined,
        phone: recurringMatch ? recurringMatch.phone : undefined,
        price: price
      };
    });
  };

  const [allSlots, setAllSlots] = useState<Record<string, Slot[]>>(() => {
    const initial: Record<string, Slot[]> = {};
    const defaultHours = [16, 17, 18, 19, 20, 21, 22, 23, 0];
    dateOptions.forEach((d) => {
      initial[d.dateStr] = generateSlots(defaultHours, 20000, d.dateStr, d.dayName);
    });
    return initial;
  });

  const currentDaySlots = allSlots[selectedDate.dateStr] || [];
  const currentDayBookedCount = currentDaySlots.filter(s => s.isBooked).length;
  const currentDayRevenue = currentDaySlots.filter(s => s.isBooked).reduce((sum, s) => sum + s.price, 0);

  const totalMonthlyCompletedBookings = 26 + Object.values(allSlots).flat().filter(s => s.isBooked).length;
  const totalMonthlyRevenue = Object.values(allSlots).flat().filter(s => s.isBooked).reduce((sum, s) => sum + s.price, 0) + (26 * 20000);

  const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(
    `مرحباً إدارة لعبتنا ⚽\nأنا كابتن (${currentOwnerPitch?.name}). حولت مبلغ الاشتراك 75,000 د.ع عبر زين كاش.\nمرفق لكم سكرين شوت التحويل 📸👇`
  )}`;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPhone.length !== 11 || !loginPhone.startsWith('07')) {
      setAuthError('يرجى إدخال رقم هاتف عراقي صحيح (11 رقماً يبدأ بـ 07)');
      return;
    }

    const foundUser = accountsDb.find(u => u.phone === loginPhone && u.role === activePortal);

    if (!foundUser) {
      setAuthError('هذا الرقم غير مسجل! اضغط "إنشاء حساب" للتسجيل.');
      return;
    }

    if (foundUser.password !== loginPassword) {
      setAuthError('كلمة المرور غير صحيحة!');
      return;
    }

    setAuthError('');
    setCurrentUser({
      role: foundUser.role,
      name: foundUser.name,
      phone: foundUser.phone
    });
  };

  const handleStartRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPhone.length !== 11 || !regPhone.startsWith('07')) {
      setAuthError('يرجى إدخال رقم هاتف عراقي مكون من 11 رقماً يبدأ بـ 07');
      return;
    }

    const alreadyExists = accountsDb.some(u => u.phone === regPhone && u.role === activePortal);
    if (alreadyExists) {
      setAuthError('هذا الرقم مسجل مسبقاً! يرجى تسجيل الدخول مباشرة.');
      return;
    }

    if (!regPassword || regPassword.length < 3) {
      setAuthError('كلمة المرور يجب أن تكون 3 خانات على الأقل');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRegOtpGenerated(code);
    setAuthError('');
    setAuthMode('verify_reg_otp');

    const waLink = `https://wa.me/964${regPhone.replace(/^0/, '')}?text=${encodeURIComponent(
      `كود تأكيد تسجيلك في منصة لعبتنا هو: ${code}`
    )}`;
    window.open(waLink, '_blank');
  };

  const handleConfirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (regOtpInput !== regOtpGenerated) {
      setAuthError('رمز التأكيد غير صحيح! تأكد من الـ 6 أرقام');
      return;
    }

    const newAccount: UserAccount = {
      id: `u-${Date.now()}`,
      role: activePortal,
      name: regName,
      phone: regPhone,
      password: regPassword,
      pitchName: activePortal === 'owner' ? regPitchName : undefined
    };

    setAccountsDb(prev => [...prev, newAccount]);

    if (activePortal === 'owner') {
      const newPitch: Pitch = {
        id: `p-${Date.now()}`,
        ownerPhone: regPhone,
        ownerName: regName,
        name: regPitchName || 'ملعب خماسي جديد',
        area: 'بغداد',
        city: 'العراق',
        type: 'خماسي ثيل صناعي',
        defaultPricePerHour: 20000,
        rating: 5.0,
        imageUrl: 'https://images.unsplash.com/photo-1529900241456-075e81d77a82?w=800&auto=format&fit=crop&q=60',
        bio: 'ملعب خماسي مجهز بالكامل بانتظار تدقيق الخدمات وتفعيل الحجز.',
        features: ['ماء شرب', 'إنارة ليد', 'غرف تبديل'],
        subscriptionStatus: 'pending',
        subscriptionExpiresAt: 0,
        emergencyUsedInCurrentCycle: false,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setPitchesList(prev => [newPitch, ...prev]);
    }

    setAuthError('');
    setCurrentUser({
      role: newAccount.role,
      name: newAccount.name,
      phone: newAccount.phone
    });
  };

  // نظام حماية الإدارة المشدد
  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (adminLockoutTime && Date.now() < adminLockoutTime) {
      setAuthError(`الدخول مجمد أمنياً بسبب محاولات خاطئة متكررة. يرجى الانتظار لحين انتهاء العداد.`);
      return;
    }

    if (adminUsernameInput === ADMIN_USER && adminPinInput === ADMIN_SECRET_CODE) {
      setCurrentUser({ role: 'admin', name: 'المسؤول العام' });
      setShowAdminModal(false);
      setAdminUsernameInput('');
      setAdminPinInput('');
      setAdminFailedAttempts(0);
      setAdminLockoutTime(null);
      setAuthError('');
    } else {
      const newAttempts = adminFailedAttempts + 1;
      setAdminFailedAttempts(newAttempts);
      if (newAttempts >= 3) {
        setAdminLockoutTime(Date.now() + 60000); // قفل أمني لمدة 60 ثانية
        setAuthError('تم تجميد الدخول لمدة دقيقة كاملة بعد 3 محاولات خاطئة!');
      } else {
        setAuthError(`اسم المستخدم أو الكود المشفر غير صحيح! متبقي (${3 - newAttempts}) محاولات قبل القفل.`);
      }
    }
  };

  const handleApprovePitch = (pitchId: string) => {
    setPitchesList(prev => prev.map(p => {
      if (p.id === pitchId) {
        return {
          ...p,
          subscriptionStatus: 'active',
          subscriptionExpiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
          emergencyUsedInCurrentCycle: false
        };
      }
      return p;
    }));
  };

  const handleRejectPitch = (pitchId: string) => {
    setPitchesList(prev => prev.filter(p => p.id !== pitchId));
  };

  const adminAddDays = (pitchId: string, days: number) => {
    setPitchesList(prev => prev.map(p => {
      if (p.id === pitchId) {
        const baseTime = p.subscriptionExpiresAt > Date.now() ? p.subscriptionExpiresAt : Date.now();
        return {
          ...p,
          subscriptionStatus: 'active',
          subscriptionExpiresAt: baseTime + (days * 24 * 60 * 60 * 1000),
          emergencyUsedInCurrentCycle: false
        };
      }
      return p;
    }));
  };

  const adminDisablePitch = (pitchId: string) => {
    setPitchesList(prev => prev.map(p => {
      if (p.id === pitchId) {
        return {
          ...p,
          subscriptionStatus: 'expired',
          subscriptionExpiresAt: Date.now() - 1000
        };
      }
      return p;
    }));
  };

  const handleConfirmPlayerBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !bookingCaptainName || bookingCaptainPhone.length !== 11) return;

    if (isPermanentBooking) {
      const newRecurring: RecurringBooking = {
        id: `rec-${Date.now()}`,
        dayName: selectedDate.dayName,
        hourNumber: selectedSlot.hourNumber,
        bookedBy: `${bookingCaptainName} (شفت ثابت 🔁)`,
        phone: bookingCaptainPhone,
        isPermanent: true
      };
      setRecurringBookings(prev => [...prev, newRecurring]);
    } else {
      setAllSlots(prev => ({
        ...prev,
        [selectedDate.dateStr]: prev[selectedDate.dateStr].map(slot => 
          slot.id === selectedSlot.id 
            ? { ...slot, isBooked: true, bookedBy: bookingCaptainName, phone: bookingCaptainPhone }
            : slot
        )
      }));
    }

    setSelectedSlot(null);
    setIsPermanentBooking(false);
  };

  const handleOwnerManualBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerManualSlot || !ownerTeamName || ownerTeamPhone.length !== 11) return;

    if (ownerIsPermanentBooking) {
      const newRecurring: RecurringBooking = {
        id: `rec-${Date.now()}`,
        dayName: selectedDate.dayName,
        hourNumber: ownerManualSlot.hourNumber,
        bookedBy: `${ownerTeamName} (شفت ثابت 🔁)`,
        phone: ownerTeamPhone,
        isPermanent: true
      };
      setRecurringBookings(prev => [...prev, newRecurring]);
    } else {
      setAllSlots(prev => ({
        ...prev,
        [selectedDate.dateStr]: prev[selectedDate.dateStr].map(slot => 
          slot.id === ownerManualSlot.id 
            ? { ...slot, isBooked: true, bookedBy: ownerTeamName, phone: ownerTeamPhone }
            : slot
        )
      }));
    }

    setOwnerManualSlot(null);
    setOwnerIsPermanentBooking(false);
  };

  const executeClearSlot = () => {
    if (!slotToConfirmCancel) return;

    if (slotToConfirmCancel.isRecurring) {
      setRecurringBookings(prev => prev.filter(rb => !(rb.dayName === selectedDate.dayName && rb.hourNumber === slotToConfirmCancel.hourNumber)));
    }

    setAllSlots(prev => ({
      ...prev,
      [selectedDate.dateStr]: prev[selectedDate.dateStr].map(slot => 
        slot.id === slotToConfirmCancel.id
          ? { ...slot, isBooked: false, isRecurring: false, bookedBy: undefined, phone: undefined }
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
    setPitchesList(prev => prev.map(p => {
      if (p.id === currentOwnerPitch.id) {
        return {
          ...p,
          name: editName,
          area: editArea,
          bio: editBio,
          imageUrl: editImage,
          defaultPricePerHour: schedulePrice
        };
      }
      return p;
    }));

    setAllSlots(prev => {
      const updated = { ...prev };
      const targetDateStrings = applyToAllDays ? dateOptions.map(d => d.dateStr) : [scheduleTargetDateStr || selectedDate.dateStr];

      targetDateStrings.forEach(dStr => {
        const matchedDay = dateOptions.find(d => d.dateStr === dStr);
        updated[dStr] = generateSlots(selectedHours24, schedulePrice, dStr, matchedDay?.dayName || '');
      });

      return updated;
    });

    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3500);
  };

  const pendingPitches = pitchesList.filter(p => p.subscriptionStatus === 'pending');
  const activePitches = pitchesList.filter(p => p.subscriptionStatus !== 'pending');

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 md:p-8 flex flex-col justify-between">
      <div>
        <header className="max-w-5xl mx-auto flex justify-between items-center pb-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-900/40">
              <Sparkles className="w-5 h-5 text-white" />
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

          {/* 0. شاشة تسجيل الدخول وإنشاء الحساب النظيفة */}
          {currentUser.role === 'guest' && (
            <div className="py-8 md:py-14 max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">مرحباً بك في لعبتنا</h2>
                <p className="text-xs text-slate-400">سجّل دخولك للوصول إلى الجداول والحجوزات</p>
              </div>

              <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal('player');
                    setAuthMode('login');
                    setAuthError('');
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
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activePortal === 'owner' ? 'bg-amber-600 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> أنا صاحب ملعب
                </button>
              </div>

              {/* 1) تسجيل الدخول */}
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
                        }}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        نسيت كلمة السر؟
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute left-3 top-3 text-slate-400 hover:text-slate-200"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 font-medium bg-rose-950/30 p-2.5 rounded-xl border border-rose-900/40">
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
                    {activePortal === 'player' ? (
                      <>ليس لديك حساب؟ <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); }} className="text-emerald-400 font-bold hover:underline">أنشئ حسابك مجاناً</button></>
                    ) : (
                      <>تريد إضافة ملعبك؟ <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); }} className="text-amber-400 font-bold hover:underline">تسجيل ملعب جديد (اشتراك شهري)</button></>
                    )}
                  </div>
                </form>
              )}

              {/* 2) إنشاء الحساب الجديد */}
              {authMode === 'register' && (
                <form onSubmit={handleStartRegister} className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        {activePortal === 'player' ? 'إنشاء حساب لاعب جديد' : 'تسجيل ملعب جديد (اشتراك شهري)'}
                      </h3>
                      {activePortal === 'owner' && (
                        <span className="text-[10px] text-amber-400 block mt-0.5">
                          قيمة الاشتراك: 75,000 د.ع شهرياً (تدفع عبر زين كاش)
                        </span>
                      )}
                    </div>
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
                      {activePortal === 'player' ? 'اسم الكابتن أو الفريق' : 'اسم صاحب الملعب (الكابتن)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="مثال: كابتن أحمد"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {activePortal === 'owner' && (
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">اسم الملعب الخماسي</label>
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
                    <label className="text-xs text-slate-300 block mb-1">رقم الهاتف العراقي (11 رقماً)</label>
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
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="اختر كلمة مرور"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-4 pl-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute left-3 top-3 text-slate-400 hover:text-slate-200"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 font-medium bg-rose-950/30 p-2.5 rounded-xl border border-rose-900/40">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" /> المتابعة وتأكيد الرقم برمز واتساب (6 أرقام)
                  </button>
                </form>
              )}

              {/* 3) إدخال رمز التأكيد 6 أرقام */}
              {authMode === 'verify_reg_otp' && (
                <form onSubmit={handleConfirmRegistration} className="bg-slate-900/90 border border-emerald-800/60 p-6 rounded-3xl space-y-4 shadow-2xl text-center">
                  <div className="w-12 h-12 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">تأكيد رقم الهاتف عبر واتساب</h3>
                    <p className="text-xs text-slate-300 mt-1">أدخل الرمز المكوّن من 6 أرقام المرسل للرقم ({regPhone})</p>
                    <span className="text-[10px] text-amber-400 font-mono block mt-1">رمز التجربة: {regOtpGenerated}</span>
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={regOtpInput}
                    onChange={(e) => setRegOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl text-center py-2.5 text-xl font-mono text-white tracking-widest focus:border-emerald-500 focus:outline-none"
                  />

                  {authError && <p className="text-xs text-rose-400 font-medium">{authError}</p>}

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg"
                  >
                    تأكيد الرمز وإتمام التسجيل
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 1. واجهة صاحب الملعب */}
          {currentUser.role === 'owner' && currentOwnerPitch && (
            <div>
              {currentOwnerPitch.subscriptionStatus === 'pending' ? (
                <div className="bg-slate-900 border border-amber-800/70 rounded-3xl p-6 md:p-10 max-w-2xl mx-auto my-8 text-center shadow-2xl space-y-6">
                  <div className="w-16 h-16 bg-amber-950/80 border border-amber-700 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">طلب انضمام ملعبك قيد المراجعة ⏳</h3>
                    <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                      أهلاً بك كابتن <strong>{currentOwnerPitch.ownerName}</strong>! تم استلام طلب تسجيل <strong>({currentOwnerPitch.name})</strong>. تقوم الإدارة الآن بمراجعة طلبك والتواصل معك عبر الواتساب لتأكيد الخدمات (الماء، الكهرباء، الإنارة) وتفعيل الحساب فور تدقيق التحويل.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-right">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <span className="text-slate-400">اشتراك المنصة:</span>
                      <span className="text-emerald-400 font-bold text-sm">75,000 د.ع (30 يوماً)</span>
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
                    <MessageCircle className="w-5 h-5" /> إرسال سكرين شوت التحويل والتواصل مع الإدارة
                  </a>
                </div>
              ) : isCurrentPitchExpired ? (
                <div className="bg-slate-900 border border-rose-900/80 rounded-3xl p-6 md:p-10 max-w-2xl mx-auto my-8 text-center shadow-2xl space-y-6">
                  <div className="w-16 h-16 bg-rose-950/80 border border-rose-800 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">انتهت فترة اشتراك الملعب</h3>
                    <p className="text-xs text-slate-400 mt-2">يرجى تحويل مبلغ التجديد الشهري لتفعيل الحساب فوراً.</p>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle className="w-5 h-5" /> إرسال وصل التجديد للإدارة
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
                      <CalendarIcon className="w-4 h-4" /> إدارة الحجوزات والشفتات الثابتة
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
                          <span className="text-xs text-slate-400 font-medium">الأرباح التقديرية</span>
                          <p className="text-2xl font-black text-white mt-3">
                            {revenueFilter === 'daily' ? `${currentDayRevenue.toLocaleString()} د.ع` : `${totalMonthlyRevenue.toLocaleString()} د.ع`}
                          </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                          <span className="text-xs text-slate-400 font-medium">ساعات اليوم المحدد ({selectedDate.dayName})</span>
                          <p className="text-2xl font-black text-white mt-3">
                            {currentDayBookedCount} / {currentDaySlots.length}
                          </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-xs text-slate-400 font-medium">الاشتراك الفعلي</span>
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold mr-2">
                              متبقي {calculatedDaysLeft} يوماً
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
                                <div className="flex gap-1">
                                  {slot.isRecurring && (
                                    <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                      <Repeat className="w-3 h-3" /> شفت ثابت
                                    </span>
                                  )}
                                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                    slot.isBooked ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-400'
                                  }`}>
                                    {slot.isBooked ? 'محجوزة' : 'فارغة'}
                                  </span>
                                </div>
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
                                      <Trash2 className="w-3.5 h-3.5" /> تفريغ الساعة
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
                                    setOwnerIsPermanentBooking(false);
                                  }}
                                  className="w-full py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center justify-center gap-1.5"
                                >
                                  <UserPlus className="w-3.5 h-3.5" /> تسجيل حجز يدوي (أو شفت ثابت)
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
                          <CheckCircle2 className="w-4 h-4" /> تم حفظ التعديلات بنجاح!
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

          {/* 2. واجهة اللاعب */}
          {currentUser.role === 'player' && (
            <div>
              {!selectedPitchId ? (
                <div className="space-y-6">
                  <div className="text-center py-4 max-w-xl mx-auto">
                    <h2 className="text-2xl font-black text-white">الملاعب المتاحة للحجز</h2>
                    <p className="text-xs text-slate-400 mt-1">اختر ملعبك المفضل وتصفح أوقات الفراغ فوراً</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {activePitches.map(pitchItem => (
                      <div
                        key={pitchItem.id}
                        onClick={() => setSelectedPitchId(pitchItem.id)}
                        className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-all group"
                      >
                        <img src={pitchItem.imageUrl} alt={pitchItem.name} className="w-full h-44 object-cover" />
                        <div className="p-5 space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-white text-base">{pitchItem.name}</h3>
                            <span className="text-emerald-400 font-bold text-sm">{pitchItem.defaultPricePerHour.toLocaleString()} د.ع</span>
                          </div>
                          <p className="text-xs text-slate-400">{pitchItem.area}</p>
                          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-emerald-400 font-bold">
                            <span>عرض الساعات والحجز</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={() => setSelectedPitchId(null)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-4 h-4" /> العودة لقائمة الملاعب
                  </button>

                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
                    <h2 className="text-2xl font-black text-white">{currentOwnerPitch.name}</h2>
                    <p className="text-xs text-slate-300">{currentOwnerPitch.bio}</p>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {dateOptions.map(date => (
                        <button
                          key={date.index}
                          onClick={() => setSelectedDateIndex(date.index)}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-center text-xs ${
                            selectedDateIndex === date.index ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {date.dayName} ({date.dayNum})
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
                      {currentDaySlots.map(slot => (
                        <button
                          key={slot.id}
                          disabled={slot.isBooked}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setBookingCaptainName(currentUser.name || '');
                            setBookingCaptainPhone(currentUser.phone || '');
                            setIsPermanentBooking(false);
                          }}
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
                            {slot.isBooked ? (slot.isRecurring ? 'شفت ثابت 🔁' : 'مقفول') : 'احجز الآن'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. غرفة الإدارة المركزية */}
          {currentUser.role === 'admin' && (
            <div className="bg-slate-900 border border-blue-900/80 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5 text-blue-400">
                  <ShieldCheck className="w-7 h-7" />
                  <div>
                    <h3 className="text-xl font-black text-white">غرفة تحكم الإدارة المركزية</h3>
                    <p className="text-xs text-slate-400">مراجعة طلبات الانضمام الجديدة، الاستفسار عن الخدمات وتدقيق التحويلات</p>
                  </div>
                </div>
                <span className="text-xs bg-amber-950 border border-amber-800 text-amber-300 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  {pendingPitches.length} طلبات جديدة
                </span>
              </div>

              {/* قسم إشعارات طلبات الملاعب الجديدة */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" /> طلبات انضمام الملاعب بانتظار الموافقة:
                </h4>

                {pendingPitches.length === 0 ? (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
                    لا توجد طلبات جديدة معلقة حالياً. كل الملاعب مدققة ومفعلة.
                  </div>
                ) : (
                  pendingPitches.map(p => (
                    <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-amber-800/60 space-y-4 shadow-xl">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-900">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-950 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-800">
                              طلب جديد
                            </span>
                            <h5 className="font-black text-white text-base">{p.name}</h5>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            المالك: <strong className="text-slate-200">{p.ownerName}</strong> | هاتف: <strong className="text-emerald-400 font-mono">{p.ownerPhone}</strong> | التاريخ: {p.createdAt}
                          </p>
                        </div>
                        <span className="text-xs bg-slate-900 text-slate-300 px-3 py-1 rounded-xl border border-slate-800">
                          الاشتراك المطلوب: 75,000 د.ع
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                        <a
                          href={`https://wa.me/964${p.ownerPhone.replace(/^0/, '')}?text=${encodeURIComponent(
                            `مرحباً كابتن ${p.ownerName} ⚽\nمعك إدارة منصة لعبتنا بخصوص طلب انضمام ملعبك (${p.name}).\nنود الاستفسار والتأكيد على توفر الخدمات (الماء الصالح للشرب، الإنارة، غرف التبديل، والتبريد) وتدقيق سكرين شوت وصل زين كاش لتفعيل الحساب فوراً.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400" /> مراسلة الكابتن عبر واتساب (الماء والخدمات والوصل)
                        </a>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprovePitch(p.id)}
                            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4" /> قبول وتفعيل الملعب (+ 30 يوماً)
                          </button>

                          <button
                            onClick={() => handleRejectPitch(p.id)}
                            className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs px-4 py-2.5 rounded-xl"
                          >
                            رفض الطلب
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* قسم إدارة الملاعب النشطة الحالية */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="font-bold text-sm text-white">الملاعب المفعلة والنشطة:</h4>
                {activePitches.map(pitchItem => {
                  const daysLeft = Math.max(0, Math.ceil((pitchItem.subscriptionExpiresAt - Date.now()) / (1000 * 60 * 60 * 24)));
                  const isExpired = pitchItem.subscriptionExpiresAt <= Date.now();

                  return (
                    <div key={pitchItem.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h5 className="font-bold text-white text-base">{pitchItem.name}</h5>
                        <p className="text-xs text-slate-400 mt-1">
                          الكابتن: {pitchItem.ownerName} ({pitchItem.ownerPhone}) | الحالة:{' '}
                          <span className={`font-bold ${!isExpired ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {!isExpired ? `نشط (متبقي ${daysLeft} يوماً)` : 'معطل / منتهي'}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => adminAddDays(pitchItem.id, 30)}
                          className="bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl"
                        >
                          + 30 يوماً
                        </button>
                        <button
                          onClick={() => adminAddDays(pitchItem.id, 90)}
                          className="bg-blue-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl"
                        >
                          + 90 يوماً (3 أشهر)
                        </button>
                        <button
                          onClick={() => adminDisablePitch(pitchItem.id)}
                          className="bg-rose-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl"
                        >
                          تعطيل الحساب
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* بوابة الإدارة المشددة أسفل الصفحة */}
      <footer className="mt-12 pt-4 border-t border-slate-900 text-center text-xs text-slate-600">
        <button
          onClick={() => { setShowAdminModal(true); setAuthError(''); }}
          className="hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5 mx-auto"
        >
          <Lock className="w-3.5 h-3.5" /> بوابة الإدارة المشددة
        </button>
      </footer>

      {/* نافذة دخول الإدارة المشددة مع كشف الرمز ومؤقت الحظر الحي */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-blue-900 w-full max-w-sm rounded-3xl p-6 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-blue-950 border border-blue-800 text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-white text-base">دخول الإدارة المشفر</h4>
              <p className="text-[11px] text-slate-400">حماية من التخمين (3 محاولات كحد أقصى)</p>
            </div>

            {lockoutCountdown > 0 ? (
              <div className="bg-rose-950/60 border border-rose-800 p-4 rounded-2xl space-y-2">
                <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
                <h5 className="font-bold text-white text-xs">الدخول مجمد أمنياً</h5>
                <p className="text-xs text-rose-300">
                  يرجى الانتظار حتى انتهاء الوقت: <span className="font-bold font-mono text-white text-sm">{lockoutCountdown}</span> ثانية
                </p>
              </div>
            ) : (
              <form onSubmit={handleAdminAuthSubmit} className="space-y-3 text-right">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">اسم المستخدم</label>
                  <input
                    type="text"
                    required
                    value={adminUsernameInput}
                    onChange={(e) => setAdminUsernameInput(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">الكود السري المشفر</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      required
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      placeholder="Admin@964#2026"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-3.5 pl-10 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <p className="text-xs text-rose-400 font-medium text-center bg-rose-950/40 p-2 rounded-lg border border-rose-900/50">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-blue-950"
                >
                  تأكيد الدخول للإدارة
                </button>
              </form>
            )}

            <button type="button" onClick={() => setShowAdminModal(false)} className="w-full text-xs text-slate-500 pt-1">إغلاق</button>
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
                <label className="text-xs text-slate-300 block mb-1">رقم الهاتف:</label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={bookingCaptainPhone}
                  onChange={(e) => setBookingCaptainPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-2xl">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isPermanentBooking}
                    onChange={(e) => setIsPermanentBooking(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-800 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <Repeat className="w-3.5 h-3.5" /> تثبيت كـ "شفت ثابت دائم" لفريقي 🔁
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      حجز الساعة أوتوماتيكياً في <strong>كل يوم {selectedDate.dayName}</strong> أسبوعياً باستمرار.
                    </p>
                  </div>
                </label>
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs">
                {isPermanentBooking ? 'تأكيد تثبيت الشفت الدائم 🔁' : 'تأكيد الحجز لهذا اليوم فقط'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة حجز صاحب الملعب اليدوي */}
      {ownerManualSlot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-amber-800/80 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-base text-white">تسجيل حجز يدوي</h4>
              <button onClick={() => setOwnerManualSlot(null)} className="text-slate-400 text-xs">إلغاء</button>
            </div>
            <form onSubmit={handleOwnerManualBookingSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={ownerTeamName}
                onChange={(e) => setOwnerTeamName(e.target.value)}
                placeholder="اسم الفريق / الكابتن المتصل"
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

              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={ownerIsPermanentBooking}
                    onChange={(e) => setOwnerIsPermanentBooking(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span className="text-amber-300 font-bold">تسجيل كـ شفت ثابت أسبوعياً 🔁</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black py-2.5 rounded-xl text-xs"
              >
                تثبيت الحجز في الجدول
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة التأكيد الإجبارية لمنع تفريغ الساعة بالخطأ */}
      {slotToConfirmCancel && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-800 w-full max-w-md rounded-3xl p-6 space-y-4 text-center">
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

      {/* نافذة إظهار المعلومات */}
      {viewDetailsSlot && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-black text-base text-white flex items-center gap-1.5">
                تفاصيل الحجز ({viewDetailsSlot.time})
                {viewDetailsSlot.isRecurring && <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">شفت ثابت 🔁</span>}
              </h4>
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
                <span className="text-slate-400">سعر الساعة:</span>
                <span className="text-white font-bold">{viewDetailsSlot.price.toLocaleString()} د.ع</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${viewDetailsSlot.phone}`}
                className="bg-slate-800 text-white py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" /> اتصال هاتفي
              </a>
              <a
                href={`https://wa.me/964${viewDetailsSlot.phone?.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
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
