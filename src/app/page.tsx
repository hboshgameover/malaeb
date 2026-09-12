'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Phone, 
  User, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  MapPin, 
  Edit3, 
  ArrowRight, 
  ShieldCheck, 
  PhoneCall, 
  Compass, 
  LayoutDashboard, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Trash2, 
  CheckSquare, 
  Square, 
  LogOut, 
  KeyRound,
  MessageSquare
} from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';

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
  ownerEmail?: string;
  ownerPassword?: string;
  defaultPricePerHour: number;
  imageUrl: string;
  bio: string;
  subscriptionStatus: 'active' | 'expired';
  subscriptionDaysLeft: number;
  lastRenewDate: string;
}

const MASTER_24_HOURS = [
  { h: 0, label: '12:00 ص - 01:00 ص' },
  { h: 1, label: '01:00 ص - 02:00 ص' },
  { h: 2, label: '02:00 ص - 03:00 ص' },
  { h: 3, label: '03:00 ص - 04:00 ص' },
  { h: 4, label: '04:00 ص - 05:00 ص' },
  { h: 5, label: '05:00 ص - 06:00 ص' },
  { h: 6, label: '06:00 ص - 07:00 ص' },
  { h: 7, label: '07:00 ص - 08:00 ص' },
  { h: 8, label: '08:00 ص - 09:00 ص' },
  { h: 9, label: '09:00 ص - 10:00 ص' },
  { h: 10, label: '10:00 ص - 11:00 ص' },
  { h: 11, label: '11:00 ص - 12:00 م' },
  { h: 12, label: '12:00 م - 01:00 م' },
  { h: 13, label: '01:00 م - 02:00 م' },
  { h: 14, label: '02:00 م - 03:00 م' },
  { h: 15, label: '03:00 م - 04:00 م' },
  { h: 16, label: '04:00 م - 05:00 م' },
  { h: 17, label: '05:00 م - 06:00 م' },
  { h: 18, label: '06:00 م - 07:00 م' },
  { h: 19, label: '07:00 م - 08:00 م' },
  { h: 20, label: '08:00 م - 09:00 م' },
  { h: 21, label: '09:00 م - 10:00 م' },
  { h: 22, label: '10:00 م - 11:00 م' },
  { h: 23, label: '11:00 م - 12:00 ص' },
];

const DEFAULT_PITCHES: Pitch[] = [
  {
    id: 'pitch-legend-1',
    name: 'ملعب الأساطير الدولي',
    area: 'المنصور - شارع 14 رمضان',
    city: 'بغداد',
    type: 'خماسي ثيل تركي درجة أولى',
    ownerName: 'كابتن المنصور',
    ownerPhone: '07712227779',
    ownerEmail: 'admin@la3batna.iq',
    ownerPassword: '123',
    defaultPricePerHour: 20000,
    imageUrl: 'https://images.unsplash.com/photo-1529900241456-075e81d77a82?w=800&auto=format&fit=crop&q=60',
    bio: 'أحدث ساحة خماسية، كشافات إضاءة نهارية، كافتيريا وغرف تبديل، بارك سيارات مراقب.',
    subscriptionStatus: 'active',
    subscriptionDaysLeft: 30,
    lastRenewDate: '2026-09-12'
  }
];

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  const [currentUser, setCurrentUser] = useState<{
    role: 'guest' | 'player' | 'owner' | 'admin';
    name?: string;
    phone?: string;
    email?: string;
    pitchId?: string;
  }>({ role: 'guest' });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);

  const [activePortal, setActivePortal] = useState<'player' | 'owner'>('player');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regPitchName, setRegPitchName] = useState('');
  const [regPitchArea, setRegPitchArea] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [regEnteredOtp, setRegEnteredOtp] = useState('');

  // نافذة إكمال البروفايل لمن يسجل بـ Google كصاحب ملعب
  const [showGoogleOwnerSetup, setShowGoogleOwnerSetup] = useState(false);
  const [googleUserTemp, setGoogleUserTemp] = useState<{ name: string; email: string; photoURL?: string } | null>(null);
  const [gPitchName, setGPitchName] = useState('');
  const [gPitchArea, setGPitchArea] = useState('');
  const [gOwnerPhone, setGOwnerPhone] = useState('');
  const [gOtpStep, setGOtpStep] = useState<1 | 2>(1);
  const [gEnteredOtp, setGEnteredOtp] = useState('');

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [pitchesList, setPitchesList] = useState<Pitch[]>(DEFAULT_PITCHES);
  const [pitchSlots, setPitchSlots] = useState<Record<string, Record<string, Slot[]>>>({});

  const [ownerTab, setOwnerTab] = useState<'bookings' | 'profile'>('bookings');
  const [editName, setEditName] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editImage, setEditImage] = useState('');
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

  const [targetActionPitchId, setTargetActionPitchId] = useState<string | null>(null);
  const [adminConfirmAction, setAdminConfirmAction] = useState<'renew' | 'expire' | 'delete' | null>(null);

  const [selectedHours24, setSelectedHours24] = useState<number[]>([16, 17, 18, 19, 20, 21, 22, 23, 0]);
  const [schedulePrice, setSchedulePrice] = useState(20000);
  const [revenueFilter, setRevenueFilter] = useState<'daily' | 'monthly'>('daily');

  // رقم زين كاش ورقم الواتساب الرسمي المعتمد
  const officialAdminPhone = "07712227779";
  const adminWhatsAppNumber = "9647712227779";

  useEffect(() => {
    setIsClient(true);
    try {
      const savedPitches = localStorage.getItem('la3batna_pitches');
      if (savedPitches) setPitchesList(JSON.parse(savedPitches));

      const savedSlots = localStorage.getItem('la3batna_slots');
      if (savedSlots) setPitchSlots(JSON.parse(savedSlots));

      const savedUser = localStorage.getItem('la3batna_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch {}
  }, []);

  useEffect(() => {
    if (isClient) localStorage.setItem('la3batna_pitches', JSON.stringify(pitchesList));
  }, [pitchesList, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem('la3batna_slots', JSON.stringify(pitchSlots));
  }, [pitchSlots, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem('la3batna_user', JSON.stringify(currentUser));
  }, [currentUser, isClient]);

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

  const generateSlots = (hours: number[], price: number, dateStr: string): Slot[] => {
    return [...hours].sort((a, b) => a - b).map(h => {
      const found = MASTER_24_HOURS.find(m => m.h === h)!;
      return {
        id: `${dateStr}-${h}`,
        hourNumber: h,
        time: found.label,
        isBooked: false,
        price
      };
    });
  };

  const currentOwnerPitch = pitchesList.find(p => p.id === currentUser.pitchId) || pitchesList[0];
  const activePitchForPlayer = pitchesList.find(p => p.id === selectedPitchId);

  useEffect(() => {
    if (currentOwnerPitch) {
      setEditName(currentOwnerPitch.name);
      setEditArea(currentOwnerPitch.area);
      setEditBio(currentOwnerPitch.bio);
      setEditImage(currentOwnerPitch.imageUrl);
      setSchedulePrice(currentOwnerPitch.defaultPricePerHour);
    }
  }, [currentOwnerPitch?.id]);

  const activeWorkingPitchId = currentUser.role === 'owner' ? currentOwnerPitch?.id : selectedPitchId;
  const currentDaySlots = useMemo(() => {
    if (!activeWorkingPitchId) return [];
    const pitchDayData = pitchSlots[activeWorkingPitchId]?.[selectedDate.dateStr];
    if (pitchDayData) return pitchDayData;
    return generateSlots(selectedHours24, schedulePrice, selectedDate.dateStr);
  }, [activeWorkingPitchId, selectedDate.dateStr, pitchSlots, selectedHours24, schedulePrice]);

  const currentDayBookedCount = currentDaySlots.filter(s => s.isBooked).length;
  const currentDayRevenue = currentDaySlots.filter(s => s.isBooked).reduce((sum, s) => sum + s.price, 0);

  const totalMonthlyRevenue = useMemo(() => {
    if (!activeWorkingPitchId || !pitchSlots[activeWorkingPitchId]) return 320000;
    const allPBookings = Object.values(pitchSlots[activeWorkingPitchId]).flat().filter(s => s.isBooked);
    return allPBookings.reduce((sum, s) => sum + s.price, 0) + 320000;
  }, [activeWorkingPitchId, pitchSlots]);

  const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(
    `مرحباً إدارة لعبتنا ⚽\nأنا صاحب ملعب (${currentOwnerPitch?.name || 'الملعب'}). حولت مبلغ الاشتراك على رقم زين كاش المعتمد (${officialAdminPhone}).\nمرفق لكم سكرين شوت التحويل 📸👇`
  )}`;

  // الدخول بـ Google
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userName = user.displayName || 'مستخدم Google';
      const userEmail = user.email || '';

      if (activePortal === 'owner') {
        const existingPitch = pitchesList.find(p => p.ownerEmail === userEmail || (p.ownerPhone && p.ownerPhone === userEmail));
        if (existingPitch && existingPitch.ownerPhone.startsWith('07')) {
          setCurrentUser({
            role: 'owner',
            name: existingPitch.ownerName,
            phone: existingPitch.ownerPhone,
            email: userEmail,
            pitchId: existingPitch.id
          });
        } else {
          // يتطلب إكمال البروفايل وتوثيق رقم الهاتف بالـ SMS
          setGoogleUserTemp({ name: userName, email: userEmail, photoURL: user.photoURL || undefined });
          setGPitchName('');
          setGPitchArea('');
          setGOwnerPhone('');
          setGOtpStep(1);
          setShowGoogleOwnerSetup(true);
        }
      } else {
        setCurrentUser({ role: 'player', name: userName, email: userEmail });
      }
    } catch (err: any) {
      setAuthError('تعذر تسجيل الدخول عبر Google: ' + (err.message || 'حاول مجدداً'));
    } finally {
      setAuthLoading(false);
    }
  };

  // إرسال كود التحقق SMS في نافذة إكمال بروفايل Google
  const handleSendGoogleOwnerOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gOwnerPhone.length !== 11 || !gOwnerPhone.startsWith('07')) {
      setAuthError('يرجى إدخال رقم هاتف عراقي صحيح (11 رقماً يبدأ بـ 07)');
      return;
    }
    setAuthError('');
    setAuthLoading(true);

    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      }

      const formattedPhone = '+964' + gOwnerPhone.replace(/^0/, '');
      const appVerifier = (window as any).recaptchaVerifier;
      const conf = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(conf);
      setGOtpStep(2);
    } catch (err: any) {
      setAuthError('فشل إرسال كود التحقق: تأكد من تفعيل العراق في SMS region policy');
    } finally {
      setAuthLoading(false);
    }
  };

  // تأكيد كود التحقق وإنشاء بروفايل الملعب بالكامل
  const handleVerifyGoogleOwnerOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !gEnteredOtp) return;

    setAuthError('');
    setAuthLoading(true);

    try {
      await confirmationResult.confirm(gEnteredOtp);
      const newId = 'pitch-' + Date.now();
      const newPitch: Pitch = {
        id: newId,
        name: gPitchName || 'ملعب ' + (googleUserTemp?.name || ''),
        area: gPitchArea || 'بغداد',
        city: 'بغداد',
        type: 'خماسي دولي',
        ownerName: googleUserTemp?.name || 'صاحب الملعب',
        ownerPhone: gOwnerPhone,
        ownerEmail: googleUserTemp?.email,
        defaultPricePerHour: 20000,
        imageUrl: googleUserTemp?.photoURL || 'https://images.unsplash.com/photo-1529900241456-075e81d77a82?w=800&auto=format&fit=crop&q=60',
        bio: 'ملعب خماسي مجهز بالكامل.',
        subscriptionStatus: 'expired',
        subscriptionDaysLeft: 0,
        lastRenewDate: '-'
      };

      setPitchesList(prev => [...prev, newPitch]);
      setCurrentUser({
        role: 'owner',
        name: googleUserTemp?.name || 'صاحب الملعب',
        phone: gOwnerPhone,
        email: googleUserTemp?.email,
        pitchId: newId
      });
      setShowGoogleOwnerSetup(false);
    } catch (err: any) {
      setAuthError('رمز التحقق غير صحيح أو منتهي الصلاحية');
    } finally {
      setAuthLoading(false);
    }
  };

  // تسجيل الدخول العادي بالهاتف
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPhone.length !== 11 || !loginPhone.startsWith('07')) {
      setAuthError('يرجى كتابة رقم هاتف عراقي صحيح (11 رقماً يبدأ بـ 07)');
      return;
    }
    if (!loginPassword) {
      setAuthError('يرجى إدخال كلمة المرور');
      return;
    }

    if (activePortal === 'owner') {
      const foundPitch = pitchesList.find(p => p.ownerPhone === loginPhone);
      if (!foundPitch) {
        setAuthError('هذا الرقم غير مسجل كصاحب ملعب. أنشئ حسابك أولاً!');
        return;
      }
      if (foundPitch.ownerPassword && foundPitch.ownerPassword !== loginPassword) {
        setAuthError('كلمة المرور غير صحيحة');
        return;
      }
      setCurrentUser({ role: 'owner', name: foundPitch.ownerName, phone: loginPhone, pitchId: foundPitch.id });
    } else {
      setCurrentUser({ role: 'player', name: 'كابتن الفريق', phone: loginPhone });
    }
    setAuthError('');
  };

  // إرسال كود التحقق SMS في التسجيل اليدوي
  const handleSendSmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPhone.length !== 11 || !regPhone.startsWith('07')) {
      setAuthError('يرجى إدخال رقم هاتف عراقي يبدأ بـ 07 ومكون من 11 رقماً');
      return;
    }
    if (!regPassword || regPassword.length < 3) {
      setAuthError('كلمة المرور يجب ألا تقل عن 3 خانات');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      }

      const formattedPhone = '+964' + regPhone.replace(/^0/, '');
      const appVerifier = (window as any).recaptchaVerifier;
      const conf = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(conf);
      setRegStep(2);
    } catch (err: any) {
      setAuthError('فشل إرسال كود التحقق: تأكد من تفعيل العراق في SMS region policy');
    } finally {
      setAuthLoading(false);
    }
  };

  // تأكيد الرمز اليدوي
  const handleVerifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !regEnteredOtp) return;

    setAuthError('');
    setAuthLoading(true);

    try {
      await confirmationResult.confirm(regEnteredOtp);
      if (activePortal === 'owner') {
        const newId = 'pitch-' + Date.now();
        const newPitch: Pitch = {
          id: newId,
          name: regPitchName || 'ملعب جديد',
          area: regPitchArea || 'بغداد',
          city: 'بغداد',
          type: 'خماسي دولي',
          ownerName: regName || 'صاحب الملعب',
          ownerPhone: regPhone,
          ownerPassword: regPassword,
          defaultPricePerHour: 20000,
          imageUrl: 'https://images.unsplash.com/photo-1529900241456-075e81d77a82?w=800&auto=format&fit=crop&q=60',
          bio: 'ملعب خماسي مجهز بالكامل.',
          subscriptionStatus: 'expired',
          subscriptionDaysLeft: 0,
          lastRenewDate: '-'
        };
        setPitchesList(prev => [...prev, newPitch]);
        setCurrentUser({ role: 'owner', name: regName, phone: regPhone, pitchId: newId });
      } else {
        setCurrentUser({ role: 'player', name: regName || 'كابتن الفريق', phone: regPhone });
      }
    } catch (err: any) {
      setAuthError('رمز التحقق غير صحيح أو منتهي الصلاحية');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'hbosh' && adminPassword === 'Zz@101620') {
      setCurrentUser({ role: 'admin', name: 'المسؤول العام' });
      setShowAdminModal(false);
      setAdminUsername('');
      setAdminPassword('');
      setAuthError('');
    } else {
      setAuthError('بيانات دخول الإدارة غير صحيحة');
    }
  };

  const handleConfirmPlayerBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !bookingCaptainName || bookingCaptainPhone.length !== 11 || !selectedPitchId) return;

    setPitchSlots(prev => {
      const pitchData = prev[selectedPitchId] || {};
      const daySlots = pitchData[selectedDate.dateStr] || generateSlots(selectedHours24, schedulePrice, selectedDate.dateStr);

      return {
        ...prev,
        [selectedPitchId]: {
          ...pitchData,
          [selectedDate.dateStr]: daySlots.map(s => 
            s.id === selectedSlot.id 
              ? { ...s, isBooked: true, bookedBy: bookingCaptainName, phone: bookingCaptainPhone }
              : s
          )
        }
      };
    });

    setSelectedSlot(null);
  };

  const handleOwnerManualBookingSubmit = () => {
    if (!ownerManualSlot || !ownerTeamName || ownerTeamPhone.length !== 11 || !currentOwnerPitch) return;

    setPitchSlots(prev => {
      const pitchData = prev[currentOwnerPitch.id] || {};
      const daySlots = pitchData[selectedDate.dateStr] || generateSlots(selectedHours24, schedulePrice, selectedDate.dateStr);

      return {
        ...prev,
        [currentOwnerPitch.id]: {
          ...pitchData,
          [selectedDate.dateStr]: daySlots.map(s => 
            s.id === ownerManualSlot.id 
              ? { ...s, isBooked: true, bookedBy: ownerTeamName, phone: ownerTeamPhone }
              : s
          )
        }
      };
    });

    setOwnerManualSlot(null);
    setOwnerTeamName('');
    setOwnerTeamPhone('');
  };

  const executeClearSlot = () => {
    if (!slotToConfirmCancel || !currentOwnerPitch) return;

    setPitchSlots(prev => {
      const pitchData = prev[currentOwnerPitch.id] || {};
      const daySlots = pitchData[selectedDate.dateStr] || [];

      return {
        ...prev,
        [currentOwnerPitch.id]: {
          ...pitchData,
          [selectedDate.dateStr]: daySlots.map(s => 
            s.id === slotToConfirmCancel.id 
              ? { ...s, isBooked: false, bookedBy: undefined, phone: undefined }
              : s
          )
        }
      };
    });

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
    if (!currentOwnerPitch) return;

    setPitchesList(prev => prev.map(p => p.id === currentOwnerPitch.id ? {
      ...p,
      name: editName,
      area: editArea,
      bio: editBio,
      imageUrl: editImage,
      defaultPricePerHour: schedulePrice
    } : p));

    setPitchSlots(prev => {
      const pitchData = prev[currentOwnerPitch.id] || {};
      const updatedDates = { ...pitchData };

      dateOptions.forEach(d => {
        const existingBooked = (pitchData[d.dateStr] || []).filter(s => s.isBooked);
        const newSlots = generateSlots(selectedHours24, schedulePrice, d.dateStr);

        updatedDates[d.dateStr] = newSlots.map(ns => {
          const match = existingBooked.find(eb => eb.hourNumber === ns.hourNumber);
          return match ? { ...ns, isBooked: true, bookedBy: match.bookedBy, phone: match.phone } : ns;
        });
      });

      return { ...prev, [currentOwnerPitch.id]: updatedDates };
    });

    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  if (!isClient) return null;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 md:p-8 flex flex-col justify-between">
      <div id="recaptcha-container"></div>
      <div>
        <header className="max-w-5xl mx-auto flex justify-between items-center pb-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-900/40">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">لعبتنا</h1>
              <p className="text-[10px] text-slate-400">المنظومة الرسمية لحجز الملاعب الرياضية</p>
            </div>
          </div>

          {currentUser.role !== 'guest' && (
            <div className="flex items-center gap-3">
              <div className="text-left">
                <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                <span className="text-[10px] text-emerald-400 block font-mono">
                  {currentUser.role === 'player' ? 'حساب كابتن' : currentUser.role === 'owner' ? `لوحة الملعب (${currentUser.phone})` : 'الإدارة العامة'}
                </span>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
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
                <h2 className="text-3xl font-black text-white">مرحباً بك في منصة لعبتنا</h2>
                <p className="text-xs text-slate-400">سجل الدخول لحجز ملعبك أو إدارة حجوزاتك</p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-3 text-xs transition-all shadow-lg shadow-white/10"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                {authLoading ? 'جارٍ الاتصال بـ Google...' : 'الدخول السريع بحساب Google'}
              </button>

              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span>أو الدخول عبر رقم الهاتف</span>
                <div className="flex-1 h-px bg-slate-800"></div>
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
                  <Compass className="w-4 h-4" /> أنا كابتن / لاعب
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

              {authMode === 'login' && (
                <form onSubmit={handleLogin} className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <h3 className="font-bold text-sm text-white">
                      تسجيل دخول {activePortal === 'player' ? 'اللاعبين' : 'أصحاب الملاعب'}
                    </h3>
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
                    <label className="text-xs text-slate-300 block mb-1">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                      <input
                        type={showLoginPass ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="absolute left-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
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
                      activePortal === 'player' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
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
                        setRegStep(1);
                        setAuthError('');
                      }}
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      إنشاء حساب جديد وتوثيق الرقم
                    </button>
                  </div>
                </form>
              )}

              {/* إنشاء الحساب مع توثيق الـ SMS */}
              {authMode === 'register' && (
                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <h3 className="font-bold text-sm text-white">
                      {regStep === 1 ? `إنشاء حساب جديد (${activePortal === 'player' ? 'لاعب' : 'صاحب ملعب'})` : 'تأكيد رمز التحقق'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setRegStep(1);
                      }}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> العودة للدخول
                    </button>
                  </div>

                  {regStep === 1 ? (
                    <form onSubmit={handleSendSmsOtp} className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">
                          {activePortal === 'player' ? 'اسم الكابتن أو الفريق' : 'اسم صاحب الملعب'}
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="مثال: علي كريم"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {activePortal === 'owner' && (
                        <>
                          <div>
                            <label className="text-xs text-slate-300 block mb-1">اسم الملعب</label>
                            <input
                              type="text"
                              required
                              value={regPitchName}
                              onChange={(e) => setRegPitchName(e.target.value)}
                              placeholder="مثال: ملعب النخيل الخماسي"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-300 block mb-1">المنطقة / الموقع</label>
                            <input
                              type="text"
                              required
                              value={regPitchArea}
                              onChange={(e) => setRegPitchArea(e.target.value)}
                              placeholder="مثال: بغداد - حي الجامعة"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="text-xs text-slate-300 block mb-1">رقم الهاتف العراقي (لتأكيد الهوية عبر SMS)</label>
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
                        <label className="text-xs text-slate-300 block mb-1">كلمة المرور</label>
                        <div className="relative">
                          <input
                            type={showRegPass ? "text" : "password"}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="اختر كلمة مرور"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-4 pl-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPass(!showRegPass)}
                            className="absolute left-3 top-2.5 text-slate-500 hover:text-slate-300"
                          >
                            {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {authError && (
                        <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {authError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-3 rounded-xl text-xs font-black transition-all shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" /> {authLoading ? 'جارٍ الإرسال...' : 'إرسال كود التحقق الرسمي SMS'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifySmsOtp} className="space-y-4">
                      <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-xs text-emerald-300">
                        تم إرسال كود التفعيل إلى هاتفك ({regPhone}). اكتب الكود أدناه:
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 block mb-1">أدخل رمز التحقق (6 أرقام)</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={regEnteredOtp}
                          onChange={(e) => setRegEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="123456"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl text-center py-2.5 text-lg font-mono text-white tracking-widest focus:border-emerald-500"
                        />
                      </div>

                      {authError && <p className="text-xs text-rose-400">{authError}</p>}

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-3 rounded-xl text-xs font-black transition-all shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        {authLoading ? 'جارٍ التأكيد...' : 'تأكيد الرمز وإتمام التسجيل'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* نافذة إجبارية لأصحاب الملاعب القادمين من Google لتسجيل البروفايل وتوثيق رقم الهاتف بالـ SMS */}
          {showGoogleOwnerSetup && googleUserTemp && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-amber-500/60 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-right">
                <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-3">
                  <LayoutDashboard className="w-5 h-5" />
                  <h3 className="font-black text-sm text-white">إكمال بروفايل الملعب وتوثيق رقم الهاتف</h3>
                </div>
                <p className="text-xs text-slate-400">
                  مرحباً بك ({googleUserTemp.name}). لحفظ ملعبك واعتماده في النظام ولتسهيل التواصل معك، يرجى كتابة بيانات الملعب وتوثيق هاتفك برمز الـ SMS:
                </p>

                {gOtpStep === 1 ? (
                  <form onSubmit={handleSendGoogleOwnerOtp} className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">اسم الملعب</label>
                      <input
                        type="text"
                        required
                        value={gPitchName}
                        onChange={(e) => setGPitchName(e.target.value)}
                        placeholder="مثال: ملعب الرشيد الرياضي"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">موقع الملعب والمنطقة</label>
                      <input
                        type="text"
                        required
                        value={gPitchArea}
                        onChange={(e) => setGPitchArea(e.target.value)}
                        placeholder="مثال: بغداد - الدورة"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">رقم هاتفك العراقي (لتصلك رسالة التحقق)</label>
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        value={gOwnerPhone}
                        onChange={(e) => setGOwnerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="07XXXXXXXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    {authError && <p className="text-xs text-rose-400">{authError}</p>}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {authLoading ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق SMS'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyGoogleOwnerOtp} className="space-y-3">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400">
                      تم إرسال كود SMS إلى رقمك ({gOwnerPhone}).
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">اكتب الرمز المكون من 6 أرقام:</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={gEnteredOtp}
                        onChange={(e) => setGEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="123456"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl text-center py-2 text-lg font-mono text-white tracking-widest"
                      />
                    </div>

                    {authError && <p className="text-xs text-rose-400">{authError}</p>}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs transition-all"
                    >
                      {authLoading ? 'جارٍ التحقق...' : 'تأكيد وحفظ بروفايل الملعب'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* 1. واجهة صاحب الملعب */}
          {currentUser.role === 'owner' && currentOwnerPitch && (
            <div>
              {currentOwnerPitch.subscriptionStatus === 'expired' ? (
                <div className="bg-slate-900 border border-rose-900/80 rounded-3xl p-6 md:p-10 max-w-2xl mx-auto my-8 text-center shadow-2xl space-y-6">
                  <div className="w-16 h-16 bg-rose-950/80 border border-rose-800 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">تفعيل اشتراك ملعب ({currentOwnerPitch.name})</h3>
                    <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                      اشتراك هذا الملعب غير مفعّل. يرجى تحويل مبلغ الاشتراك الشهري عبر محفظة زين كاش لتثبيت الحساب في المنظومة.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-3 text-right">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <span className="text-slate-400">قيمة الاشتراك:</span>
                      <span className="text-emerald-400 font-bold text-sm">75,000 د.ع / 30 يوماً</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <span className="text-slate-400">رقم تحويل زين كاش الأساسي:</span>
                      <span className="text-amber-400 font-mono font-black text-base select-all bg-slate-900 px-3 py-1 rounded-lg border border-slate-750">
                        {officialAdminPhone}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      بعد التحويل إلى رقم المحفظة الموضح بالأعلى، اضغط على الزر التالي لإرسال لقطة شاشة الإشعار وسيقوم الأدمن بتفعيل الملعب خلال دقائق:
                    </p>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-950"
                  >
                    إرسال سكرين شوت التحويل عبر واتساب
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
                      <CalendarIcon className="w-4 h-4" /> إدارة جدول الحجوزات ({currentOwnerPitch.name})
                    </button>
                    <button
                      onClick={() => setOwnerTab('profile')}
                      className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                        ownerTab === 'profile' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" /> تعديل بيانات وساعات الملعب
                    </button>
                  </div>

                  {ownerTab === 'bookings' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">إحصائيات الإيرادات</span>
                            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex gap-1">
                              <button
                                onClick={() => setRevenueFilter('daily')}
                                className={`text-[10px] px-2 py-0.5 rounded font-bold ${revenueFilter === 'daily' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                              >
                                اليوم
                              </button>
                              <button
                                onClick={() => setRevenueFilter('monthly')}
                                className={`text-[10px] px-2 py-0.5 rounded font-bold ${revenueFilter === 'monthly' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                              >
                                الشهر
                              </button>
                            </div>
                          </div>
                          <p className="text-2xl font-black text-white mt-3">
                            {revenueFilter === 'daily' ? `${currentDayRevenue.toLocaleString()} د.ع` : `${totalMonthlyRevenue.toLocaleString()} د.ع`}
                          </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                          <span className="text-xs text-slate-400">حجوزات موعد اليوم ({selectedDate.dayName})</span>
                          <p className="text-2xl font-black text-white mt-3">
                            {currentDayBookedCount} / {currentDaySlots.length}
                          </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-xs text-slate-400">صلاحية الاشتراك</span>
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold mr-2">
                              نشط ({currentOwnerPitch.subscriptionDaysLeft} يوم)
                            </span>
                          </div>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-bold py-2 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                          >
                            تمديد الاشتراك مسبقاً
                          </a>
                        </div>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {dateOptions.map(date => (
                          <button
                            key={date.index}
                            onClick={() => setSelectedDateIndex(date.index)}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-center text-xs transition-all ${
                              selectedDateIndex === date.index ? 'bg-emerald-600 text-white font-bold shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="block font-bold">{date.dayName} {date.dayNum}</span>
                            <span className="text-[10px] opacity-80 block mt-0.5">{date.monthName}</span>
                          </button>
                        ))}
                      </div>

                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                        <h4 className="font-bold text-sm text-white mb-4">جدول المواعيد: {selectedDate.dayName} ({selectedDate.dayNum} {selectedDate.monthName})</h4>
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
                                  {slot.isBooked ? 'محجوزة' : 'متاحة'}
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
                                      <Eye className="w-3.5 h-3.5" /> التفاصيل
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
                                  <UserPlus className="w-3.5 h-3.5" /> تسجيل حجز هاتفي
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
                          <CheckCircle2 className="w-4 h-4" /> تم حفظ التعديلات في النظام بنجاح!
                        </div>
                      )}
                      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
                        <h4 className="font-bold text-white text-base">بيانات الملعب الأساسية</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-slate-300 block mb-1">اسم الملعب:</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-300 block mb-1">الموقع والمنطقة:</label>
                            <input
                              type="text"
                              value={editArea}
                              onChange={(e) => setEditArea(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-slate-300 block mb-1">وصف الملعب ومميزاته:</label>
                          <textarea
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white h-20"
                          />
                        </div>

                        <h4 className="font-bold text-white text-base pt-3 border-t border-slate-800">ساعات العمل المتاحة للحجز</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
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

                        <div className="pt-3 border-t border-slate-800">
                          <label className="text-xs text-slate-300 block mb-1">سعر الساعة (د.ع):</label>
                          <input
                            type="number"
                            value={schedulePrice}
                            onChange={(e) => setSchedulePrice(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs transition-all"
                      >
                        حفظ وتحديث النظام
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
                    <h2 className="text-2xl font-black text-white">الملاعب الرياضية المتاحة</h2>
                    <p className="text-xs text-slate-400 mt-1">اختر ملعبك المفضل وتصفح الأوقات الشاغرة فوراً</p>
                  </div>

                  {pitchesList.filter(p => p.subscriptionStatus === 'active').length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl text-center space-y-3 max-w-md mx-auto">
                      <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                      <h4 className="font-bold text-white text-base">لا توجد ملاعب متاحة حالياً</h4>
                      <p className="text-xs text-slate-400">جميع اشتراكات الملاعب معطلة أو منتهية حالياً.</p>
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
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {p.area}
                            </p>
                            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-emerald-400 font-bold">
                              <span>حجز موعد الآن</span>
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
                    <ArrowRight className="w-4 h-4" /> العودة لكافة الملاعب
                  </button>

                  {activePitchForPlayer && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
                      <h2 className="text-2xl font-black text-white">{activePitchForPlayer.name}</h2>
                      <p className="text-xs text-slate-300">{activePitchForPlayer.bio}</p>

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
                            onClick={() => {
                              setSelectedSlot(slot);
                              setBookingCaptainName(currentUser.name || '');
                              setBookingCaptainPhone(currentUser.phone || '');
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

          {/* 3. لوحة الإدارة العامة المركزية */}
          {currentUser.role === 'admin' && (
            <div className="bg-slate-900 border border-blue-900/60 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-lg font-black text-white">لوحة الإدارة المركزية (تحكم الملاعب والاشتراكات)</h3>
              </div>

              {pitchesList.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                  لا توجد ملاعب في النظام حالياً.
                </div>
              ) : (
                <div className="space-y-4">
                  {pitchesList.map(p => (
                    <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-900">
                        <div>
                          <h4 className="font-bold text-white text-base">{p.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">المنطقة: {p.area}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                          p.subscriptionStatus === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {p.subscriptionStatus === 'active' ? `نشط (${p.subscriptionDaysLeft} يوم متبقي)` : 'معطل / منتهي'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 block">صاحب الملعب:</span>
                          <span className="text-white font-bold text-sm block">{p.ownerName}</span>
                        </div>
                        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 block">رقم الهاتف الفعلي:</span>
                          <span className="text-emerald-400 font-mono font-bold text-sm block">{p.ownerPhone}</span>
                          {p.ownerEmail && <span className="text-[10px] text-slate-500 block truncate">{p.ownerEmail}</span>}
                        </div>
                        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-slate-400 block">آخر تاريخ تجديد:</span>
                          <span className="text-amber-400 font-mono font-bold text-sm block">{p.lastRenewDate}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            setTargetActionPitchId(p.id);
                            setAdminConfirmAction('renew');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                        >
                          + تمديد 30 يوماً
                        </button>
                        <button
                          onClick={() => {
                            setTargetActionPitchId(p.id);
                            setAdminConfirmAction('expire');
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                        >
                          تعطيل الحساب
                        </button>
                        <button
                          onClick={() => {
                            setTargetActionPitchId(p.id);
                            setAdminConfirmAction('delete');
                          }}
                          className="bg-slate-800 hover:bg-rose-900 text-rose-400 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-slate-700"
                        >
                          حذف نهائياً
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-950 border border-rose-800 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h5 className="font-black text-white text-base">هل أنت متأكد من تسجيل الخروج؟</h5>
            <p className="text-xs text-slate-400">ستحتاج لإعادة تسجيل الدخول للوصول لحسابك مجدداً.</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setCurrentUser({ role: 'guest' });
                  setSelectedPitchId(null);
                  setShowLogoutConfirm(false);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                تأكيد الخروج
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {adminConfirmAction && targetActionPitchId && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-950 border border-amber-800 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h5 className="font-black text-white text-base">
              {adminConfirmAction === 'renew' && 'هل أنت متأكد من تمديد هذا الملعب 30 يوماً؟'}
              {adminConfirmAction === 'expire' && 'هل أنت متأكد من تعطيل هذا الملعب؟'}
              {adminConfirmAction === 'delete' && 'تحذير: هل أنت متأكد من حذف الملعب نهائياً؟'}
            </h5>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  if (adminConfirmAction === 'renew') {
                    setPitchesList(prev => prev.map(p => p.id === targetActionPitchId ? {
                      ...p,
                      subscriptionStatus: 'active',
                      subscriptionDaysLeft: p.subscriptionDaysLeft + 30,
                      lastRenewDate: today
                    } : p));
                  } else if (adminConfirmAction === 'expire') {
                    setPitchesList(prev => prev.map(p => p.id === targetActionPitchId ? {
                      ...p,
                      subscriptionStatus: 'expired',
                      subscriptionDaysLeft: 0
                    } : p));
                  } else if (adminConfirmAction === 'delete') {
                    setPitchesList(prev => prev.filter(p => p.id !== targetActionPitchId));
                    setSelectedPitchId(null);
                  }
                  setAdminConfirmAction(null);
                  setTargetActionPitchId(null);
                }}
                className={`text-white font-bold py-2.5 rounded-xl text-xs ${
                  adminConfirmAction === 'delete' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                تأكيد التنفيذ
              </button>
              <button
                onClick={() => {
                  setAdminConfirmAction(null);
                  setTargetActionPitchId(null);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdminModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-blue-900/80 w-full max-w-xs rounded-3xl p-6 space-y-4 text-center">
            <div className="w-10 h-10 bg-blue-950 border border-blue-800 text-blue-400 rounded-full flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white text-sm">دخول الإدارة المركزية</h4>
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showAdminPass ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-3 pl-9 py-2 text-sm text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute left-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {authError && <p className="text-[11px] text-rose-400 text-center">{authError}</p>}
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs">
                تسجيل الدخول
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white text-base">تأكيد حجز الموعد</h4>
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

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs">
                تأكيد تثبيت الحجز
              </button>
            </form>
          </div>
        </div>
      )}

      {ownerManualSlot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-amber-800/80 w-full max-w-md rounded-2xl p-6 space-y-4">
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
                تثبيت الحجز
              </button>
            </div>
          </div>
        </div>
      )}

      {slotToConfirmCancel && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-950 border border-rose-800 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h5 className="font-black text-white text-base">هل أنت متأكد من تفريغ الساعة؟</h5>
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

      {viewDetailsSlot && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-black text-base text-white">تفاصيل الحجز ({viewDetailsSlot.time})</h4>
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
                <PhoneCall className="w-3.5 h-3.5" /> اتصال
              </a>
              <a
                href={`https://wa.me/964${viewDetailsSlot.phone?.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
              >
                واتساب
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
