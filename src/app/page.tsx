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
  LogOut, 
  KeyRound, 
  X, 
  Zap, 
  Upload, 
  Headphones, 
  Users, 
  Building2 
} from 'lucide-react';

// إعداد Firebase الصريح والمباشر داخل الملف لقطع دابر أي خطأ بالمفاتيح
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { collection, doc, setDoc, getDoc, onSnapshot, updateDoc, deleteDoc, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBxF1SxF-NkZBinew5bXWe1eQGRdw7_UWY",
  authDomain: "la3batna-c6480.firebaseapp.com",
  projectId: "la3batna-c6480",
  storageBucket: "la3batna-c6480.firebasestorage.app",
  messagingSenderId: "448877407537",
  appId: "1:448877407537:web:f225728542a48ebc0b9410"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
const db = getFirestore(app);

interface Slot {
  id: string;
  hourNumber: number;
  time: string;
  isBooked: boolean;
  bookedBy?: string;
  phone?: string;
  price: number;
}

interface PlayerAccount {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: number;
}

interface Pitch {
  id: string;
  name: string;
  city: string;
  area: string;
  type: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  defaultPricePerHour: number;
  imageUrl: string;
  bio: string;
  subscriptionStatus: 'active' | 'expired';
  subscriptionDaysLeft: number;
  lastRenewDate: string;
  usedEmergencyExtension?: boolean;
}

const IRAQ_PROVINCES = [
  'بغداد', 'البصرة', 'أربيل', 'النجف الأشرف', 'كربلاء المقدسة', 
  'نينوى (الموصل)', 'كركوك', 'السليمانية', 'دهوك', 'بابل', 
  'الأنبار', 'ديالى', 'واسط', 'صلاح الدين', 'ذي قار', 
  'ميسان', 'المثنى', 'الديوانية'
];

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

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  const OFFICIAL_PAYMENT_PHONE = "07712227779";
  const SUPPORT_WHATSAPP = "9647712227779";

  const [currentUser, setCurrentUser] = useState<{
    role: 'guest' | 'player' | 'owner' | 'admin';
    uid?: string;
    name?: string;
    phone?: string;
    email?: string;
    pitchId?: string;
  }>({ role: 'guest' });

  const [pitchesList, setPitchesList] = useState<Pitch[]>([]);
  const [pitchSlots, setPitchSlots] = useState<Record<string, Record<string, Slot[]>>>({});
  const [playersList, setPlayersList] = useState<PlayerAccount[]>([]);

  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('الكل');
  const [activePortal, setActivePortal] = useState<'player' | 'owner'>('player');

  const [showPlayerProfileSetup, setShowPlayerProfileSetup] = useState(false);
  const [playerTempAuth, setPlayerTempAuth] = useState<{ uid: string; name: string; email: string } | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');

  const [showOwnerPitchSetup, setShowOwnerPitchSetup] = useState(false);
  const [ownerTempAuth, setOwnerTempAuth] = useState<{ uid: string; name: string; email: string } | null>(null);
  const [newPitchName, setNewPitchName] = useState('');
  const [newPitchProvince, setNewPitchProvince] = useState('بغداد');
  const [newPitchArea, setNewPitchArea] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);
  const [tempPlayerName, setTempPlayerName] = useState('');

  const [ownerTab, setOwnerTab] = useState<'bookings' | 'profile'>('bookings');
  const [editName, setEditName] = useState('');
  const [editProvince, setEditProvince] = useState('بغداد');
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [selectedHours24, setSelectedHours24] = useState<number[]>([16, 17, 18, 19, 20, 21, 22, 23, 0]);
  const [schedulePrice, setSchedulePrice] = useState(20000);
  const [revenueFilter, setRevenueFilter] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    setIsClient(true);
    try {
      const savedUser = localStorage.getItem('la3batna_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch {}

    const unsubPitches = onSnapshot(collection(db, 'pitches'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Pitch[] = [];
        snapshot.forEach((doc) => loaded.push(doc.data() as Pitch));
        setPitchesList(loaded);
      } else {
        const defaultP: Pitch = {
          id: 'pitch-legend-1',
          name: 'ملعب الأساطير الدولي',
          city: 'بغداد',
          area: 'المنصور - شارع 14 رمضان',
          type: 'خماسي دولي',
          ownerName: 'كابتن المنصور',
          ownerPhone: OFFICIAL_PAYMENT_PHONE,
          ownerEmail: 'admin@la3batna.iq',
          defaultPricePerHour: 20000,
          imageUrl: 'https://images.unsplash.com/photo-1529900241456-075e81d77a82?w=800&auto=format&fit=crop&q=60',
          bio: 'أحدث ساحة خماسية في المنصور، كشافات نهارية، كافتيريا وبارك مراقب.',
          subscriptionStatus: 'active',
          subscriptionDaysLeft: 30,
          lastRenewDate: '2026-09-12',
          usedEmergencyExtension: false
        };
        setDoc(doc(db, 'pitches', defaultP.id), defaultP);
        setPitchesList([defaultP]);
      }
    });

    const unsubPlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      const pList: PlayerAccount[] = [];
      snapshot.forEach(doc => pList.push(doc.data() as PlayerAccount));
      setPlayersList(pList);
    });

    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const slotsMap: Record<string, Record<string, Slot[]>> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        const pId = data.pitchId;
        const dStr = data.dateStr;
        if (!slotsMap[pId]) slotsMap[pId] = {};
        if (!slotsMap[pId][dStr]) slotsMap[pId][dStr] = [];
        slotsMap[pId][dStr].push({
          id: data.id,
          hourNumber: data.hourNumber,
          time: data.time,
          isBooked: data.isBooked,
          bookedBy: data.bookedBy,
          phone: data.phone,
          price: data.price
        });
      });
      setPitchSlots(slotsMap);
    });

    return () => {
      unsubPitches();
      unsubPlayers();
      unsubBookings();
    };
  }, []);

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
      days.push({
        index: i,
        dayName: arabicDays[d.getDay()],
        dayNum: d.getDate(),
        monthName: arabicMonths[d.getMonth()],
        dateStr: d.toISOString().split('T')[0]
      });
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
      setEditProvince(currentOwnerPitch.city || 'بغداد');
      setEditArea(currentOwnerPitch.area);
      setEditBio(currentOwnerPitch.bio);
      setEditImage(currentOwnerPitch.imageUrl || '');
      setSchedulePrice(currentOwnerPitch.defaultPricePerHour);
    }
  }, [currentOwnerPitch?.id]);

  const activeWorkingPitchId = currentUser.role === 'owner' ? currentOwnerPitch?.id : selectedPitchId;

  const currentDaySlots = useMemo(() => {
    if (!activeWorkingPitchId) return [];
    const pitchDayData = pitchSlots[activeWorkingPitchId]?.[selectedDate.dateStr];
    if (pitchDayData && pitchDayData.length > 0) {
      const defaults = generateSlots(selectedHours24, schedulePrice, selectedDate.dateStr);
      return defaults.map(ds => {
        const booked = pitchDayData.find(b => b.hourNumber === ds.hourNumber && b.isBooked);
        return booked || ds;
      });
    }
    return generateSlots(selectedHours24, schedulePrice, selectedDate.dateStr);
  }, [activeWorkingPitchId, selectedDate.dateStr, pitchSlots, selectedHours24, schedulePrice]);

  const currentDayBookedCount = currentDaySlots.filter(s => s.isBooked).length;
  const currentDayRevenue = currentDaySlots.filter(s => s.isBooked).reduce((sum, s) => sum + s.price, 0);

  const totalMonthlyRevenue = useMemo(() => {
    if (!activeWorkingPitchId || !pitchSlots[activeWorkingPitchId]) return 320000;
    const allPBookings = Object.values(pitchSlots[activeWorkingPitchId]).flat().filter(s => s.isBooked);
    return allPBookings.reduce((sum, s) => sum + s.price, 0) + 320000;
  }, [activeWorkingPitchId, pitchSlots]);

  const whatsappRenewalUrl = `https://wa.me/964${OFFICIAL_PAYMENT_PHONE.replace(/^0/, '')}?text=${encodeURIComponent(
    `مرحباً إدارة لعبتنا ⚽\nأنا صاحب ملعب (${currentOwnerPitch?.name || 'الملعب'}). تم تحويل مبلغ الاشتراك الشهري على رقم زين كاش (${OFFICIAL_PAYMENT_PHONE}).\nمرفق لكم لقطة شاشة التحويل 📸👇`
  )}`;

  const whatsappSupportUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
    `مرحباً الدعم الفني لمنصة لعبتنا ⚽\nأحتاج إلى مساعدة بخصوص المنظومة.`
  )}`;

  const handleSocialAuth = async (providerType: 'google' | 'apple') => {
    setAuthError('');
    setAuthLoading(true);
    try {
      let result;
      try {
        const provider = providerType === 'google' ? googleProvider : appleProvider;
        result = await signInWithPopup(auth, provider);
      } catch (providerErr: any) {
        if (providerType === 'apple' && (providerErr.code === 'auth/operation-not-allowed' || providerErr.code?.includes('unauthorized') || providerErr.code?.includes('configuration'))) {
          setAuthError('تسجيل الدخول عبر Apple قيد الإعداد التقني من المتجر، يرجى المتابعة عبر حساب Google الآن.');
          setAuthLoading(false);
          return;
        }
        throw providerErr;
      }
      const user = result.user;
      const uid = user.uid;
      const userName = user.displayName || (providerType === 'apple' ? 'مستخدم Apple' : 'مستخدم Google');
      const userEmail = user.email || '';

      if (activePortal === 'player') {
        const playerDoc = await getDoc(doc(db, 'players', uid));
        if (playerDoc.exists()) {
          const pData = playerDoc.data() as PlayerAccount;
          setCurrentUser({
            role: 'player',
            uid,
            name: pData.name,
            phone: pData.phone,
            email: userEmail
          });
        } else {
          setPlayerTempAuth({ uid, name: userName, email: userEmail });
          setNewPlayerName(userName);
          setNewPlayerPhone('');
          setShowPlayerProfileSetup(true);
        }
      } else {
        const existingPitch = pitchesList.find(p => p.ownerEmail === userEmail || p.id === `pitch-${uid}`);
        if (existingPitch) {
          setCurrentUser({
            role: 'owner',
            uid,
            name: existingPitch.ownerName,
            phone: existingPitch.ownerPhone,
            email: userEmail,
            pitchId: existingPitch.id
          });
        } else {
          setOwnerTempAuth({ uid, name: userName, email: userEmail });
          setNewPitchName('');
          setNewPitchProvince('بغداد');
          setNewPitchArea('');
          setNewOwnerPhone('');
          setShowOwnerPitchSetup(true);
        }
      }
    } catch (err: any) {
      setAuthError(`تعذر تسجيل الدخول: ${err.message || 'حاول مجدداً'}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSavePlayerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerTempAuth) return;

    if (newPlayerPhone.length !== 11 || !newPlayerPhone.startsWith('07')) {
      setAuthError('يرجى إدخال رقم هاتف عراقي يبدأ بـ 07 ومكون من 11 رقماً');
      return;
    }

    const newPlayer: PlayerAccount = {
      uid: playerTempAuth.uid,
      name: newPlayerName.trim() || 'كابتن الفريق',
      phone: newPlayerPhone.trim(),
      email: playerTempAuth.email,
      createdAt: Date.now()
    };

    try {
      await setDoc(doc(db, 'players', playerTempAuth.uid), newPlayer);
      setCurrentUser({
        role: 'player',
        uid: newPlayer.uid,
        name: newPlayer.name,
        phone: newPlayer.phone,
        email: newPlayer.email
      });
      setShowPlayerProfileSetup(false);
      setPlayerTempAuth(null);
      setAuthError('');
    } catch (err: any) {
      setAuthError('تعذر حفظ الملف الشخصي: ' + err.message);
    }
  };

  const handleSaveOwnerPitchProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerTempAuth) return;

    if (newOwnerPhone.length !== 11 || !newOwnerPhone.startsWith('07')) {
      setAuthError('يرجى كتابة رقم هاتف عراقي صحيح (11 رقماً يبدأ بـ 07)');
      return;
    }
    if (!newPitchName.trim()) {
      setAuthError('يرجى كتابة اسم الملعب');
      return;
    }

    const pitchId = `pitch-${ownerTempAuth.uid}`;
    const newPitch: Pitch = {
      id: pitchId,
      name: newPitchName.trim(),
      city: newPitchProvince,
      area: newPitchArea.trim() || newPitchProvince,
      type: 'خماسي دولي',
      ownerName: ownerTempAuth.name,
      ownerPhone: newOwnerPhone.trim(),
      ownerEmail: ownerTempAuth.email,
      defaultPricePerHour: 20000,
      imageUrl: 'https://images.unsplash.com/photo-1529900241456-075e81d77a82?w=800&auto=format&fit=crop&q=60',
      bio: 'ملعب خماسي مجهز بالكامل.',
      subscriptionStatus: 'expired',
      subscriptionDaysLeft: 0,
      lastRenewDate: '-',
      usedEmergencyExtension: false
    };

    try {
      await setDoc(doc(db, 'pitches', pitchId), newPitch);
      setCurrentUser({
        role: 'owner',
        uid: ownerTempAuth.uid,
        name: newPitch.ownerName,
        phone: newPitch.ownerPhone,
        email: newPitch.ownerEmail,
        pitchId: pitchId
      });
      setShowOwnerPitchSetup(false);
      setOwnerTempAuth(null);
      setAuthError('');
    } catch (err: any) {
      setAuthError('تعذر إنشاء حساب الملعب: ' + err.message);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير، يرجى اختيار صورة أقل من 2 ميغابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setEditImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleActivateEmergencyExtension = async () => {
    if (!currentOwnerPitch) return;
    try {
      await updateDoc(doc(db, 'pitches', currentOwnerPitch.id), {
        subscriptionStatus: 'active',
        subscriptionDaysLeft: 1,
        usedEmergencyExtension: true
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNewPlayerName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPlayerName.trim()) return;
    if (currentUser.uid) {
      await updateDoc(doc(db, 'players', currentUser.uid), { name: tempPlayerName.trim() });
    }
    setCurrentUser(prev => ({ ...prev, name: tempPlayerName.trim() }));
    setShowEditPlayerModal(false);
  };

  const handleConfirmPlayerBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !bookingCaptainName || bookingCaptainPhone.length !== 11 || !selectedPitchId) return;

    const bookingDocId = `${selectedPitchId}_${selectedDate.dateStr}_${selectedSlot.hourNumber}`;
    const bookingData = {
      id: selectedSlot.id,
      pitchId: selectedPitchId,
      dateStr: selectedDate.dateStr,
      hourNumber: selectedSlot.hourNumber,
      time: selectedSlot.time,
      price: selectedSlot.price,
      isBooked: true,
      bookedBy: bookingCaptainName,
      phone: bookingCaptainPhone,
      timestamp: Date.now()
    };

    try {
      await setDoc(doc(db, 'bookings', bookingDocId), bookingData);
      setSelectedSlot(null);
    } catch (err: any) {
      alert('حدث خطأ أثناء الحجز: ' + err.message);
    }
  };

  const handleOwnerManualBookingSubmit = async () => {
    if (!ownerManualSlot || !ownerTeamName || ownerTeamPhone.length !== 11 || !currentOwnerPitch) return;

    const bookingDocId = `${currentOwnerPitch.id}_${selectedDate.dateStr}_${ownerManualSlot.hourNumber}`;
    const bookingData = {
      id: ownerManualSlot.id,
      pitchId: currentOwnerPitch.id,
      dateStr: selectedDate.dateStr,
      hourNumber: ownerManualSlot.hourNumber,
      time: ownerManualSlot.time,
      price: ownerManualSlot.price,
      isBooked: true,
      bookedBy: ownerTeamName,
      phone: ownerTeamPhone,
      timestamp: Date.now()
    };

    try {
      await setDoc(doc(db, 'bookings', bookingDocId), bookingData);
      setOwnerManualSlot(null);
      setOwnerTeamName('');
      setOwnerTeamPhone('');
    } catch (err: any) {
      alert('تعذر تثبيت الحجز: ' + err.message);
    }
  };

  const executeClearSlot = async () => {
    if (!slotToConfirmCancel || !currentOwnerPitch) return;

    const bookingDocId = `${currentOwnerPitch.id}_${selectedDate.dateStr}_${slotToConfirmCancel.hourNumber}`;
    try {
      await deleteDoc(doc(db, 'bookings', bookingDocId));
      setSlotToConfirmCancel(null);
      setViewDetailsSlot(null);
    } catch (err: any) {
      alert('تعذر تفريغ الموعد: ' + err.message);
    }
  };

  const saveFullSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOwnerPitch) return;

    try {
      await updateDoc(doc(db, 'pitches', currentOwnerPitch.id), {
        name: editName,
        city: editProvince,
        area: editArea,
        bio: editBio,
        imageUrl: editImage,
        defaultPricePerHour: schedulePrice
      });
      setProfileSavedToast(true);
      setTimeout(() => setProfileSavedToast(false), 3000);
    } catch (err: any) {
      alert('تعذر حفظ التعديلات: ' + err.message);
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (adminUsername === 'hbosh' && adminPassword === 'Zz@101620') {
      setCurrentUser({ role: 'admin', name: 'المسؤول العام' });
      setShowAdminModal(false);
      setAdminUsername('');
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('بيانات دخول الإدارة غير صحيحة');
    }
  };

  if (!isClient) return null;

  const displayedPitches = pitchesList.filter(p => {
    const isActive = p.subscriptionStatus === 'active';
    const matchesProvince = selectedProvinceFilter === 'الكل' || p.city === selectedProvinceFilter;
    return isActive && matchesProvince;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 md:p-8 flex flex-col justify-between relative">
      
      <a
        href={whatsappSupportUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 left-5 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3 md:px-4 md:py-3 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 border border-emerald-400/40"
      >
        <Headphones className="w-5 h-5 text-white animate-pulse" />
        <span className="hidden md:inline text-xs font-black">الدعم الفني المباشر</span>
      </a>

      <div>
        <header className="max-w-5xl mx-auto flex justify-between items-center pb-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-900/40">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">لعبتنا</h1>
              <p className="text-[10px] text-slate-400">المنظومة الرسمية لحجز الملاعب الرياضية في العراق</p>
            </div>
          </div>

          {currentUser.role !== 'guest' && (
            <div className="flex items-center gap-3">
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                  {currentUser.role === 'player' && (
                    <button
                      onClick={() => {
                        setTempPlayerName(currentUser.name || '');
                        setShowEditPlayerModal(true);
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-0.5 rounded-lg border border-slate-700"
                    >
                      تعديل الاسم ✏️
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 block font-mono">
                  {currentUser.role === 'player' ? `حساب كابتن (${currentUser.phone || ''})` : currentUser.role === 'owner' ? `لوحة الملعب (${currentUser.phone})` : 'الإدارة العامة'}
                </span>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 bg-slate-900 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </header>

        <main className="max-w-5xl mx-auto mt-6">

          {currentUser.role === 'guest' && (
            <div className="py-10 md:py-16 max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">مرحباً بك في منصة لعبتنا</h2>
                <p className="text-xs text-slate-400">اختر هويتك وسجل دخولك بضغطة زر واحدة</p>
              </div>

              <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal('player');
                    setAuthError('');
                  }}
                  className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activePortal === 'player' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4" /> أنا كابتن / لاعب
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal('owner');
                    setAuthError('');
                  }}
                  className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activePortal === 'owner' ? 'bg-amber-600 text-slate-950 shadow-lg font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> أنا صاحب ملعب
                </button>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl">
                <div className="text-center pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white">
                    {activePortal === 'player' ? 'تسجيل دخول اللاعبين والفرق' : 'تسجيل دخول أصحاب الملاعب'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">سريع، آمن، ومباشر دون الحاجة لرسائل SMS</p>
                </div>

                {authError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 font-medium bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/60">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {authError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handleSocialAuth('google')}
                  disabled={authLoading}
                  className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-3 text-xs transition-all shadow-md active:scale-98"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  {authLoading ? 'جارٍ تسجيل الدخول...' : 'متابعة عبر حساب Google'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAuth('apple')}
                  disabled={authLoading}
                  className="w-full py-3.5 bg-black hover:bg-slate-900 border border-slate-700 text-white font-bold rounded-2xl flex items-center justify-center gap-3 text-xs transition-all shadow-md active:scale-98"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.85-12.03-14.34-6.42-9.68-11.51-20.91-15.26-33.68-3.75-12.77-5.63-25.1-5.63-36.99 0-14.65 3.63-26.79 10.89-36.43 7.26-9.64 16.59-14.58 27.99-14.83 5.48 0 11.2 1.44 17.16 4.33 5.96 2.89 10.15 4.39 12.57 4.5 2.02-.11 6.38-1.67 13.09-4.67 6.71-3.01 12.51-4.41 17.41-4.22 13.32.75 23.86 5.41 31.62 13.98-11.66 7.07-17.39 16.89-17.18 29.47.23 9.87 4.09 18.23 11.58 25.07 7.49 6.84 16.48 10.74 26.97 11.69-2.22 6.94-4.88 14.17-7.98 21.68zM119.22 33.09c0-7.39 2.65-14.42 7.95-21.09 5.3-6.67 11.83-10.75 19.59-12.24.43 1.39.64 2.78.64 4.17 0 7.39-2.76 14.5-8.28 21.33-5.52 6.83-12.18 10.8-19.9 11.91z"/>
                  </svg>
                  {authLoading ? 'جارٍ تسجيل الدخول...' : 'متابعة عبر حساب Apple'}
                </button>
              </div>
            </div>
          )}

          {showPlayerProfileSetup && playerTempAuth && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-emerald-500/60 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-right">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-3">
                  <User className="w-5 h-5" />
                  <h3 className="font-black text-sm text-white">إكمال الملف الشخصي للكابتن</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  أهلاً بك كابتن! يرجى إدخال اسمك ورقم هاتفك العراقي لتثبيت حجوزاتك وإشعار صاحب الملعب بها:
                </p>

                <form onSubmit={handleSavePlayerProfile} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">اسم الكابتن أو الفريق</label>
                    <input
                      type="text"
                      required
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="مثال: كابتن ليث / فريق النسور"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">رقم الهاتف العراقي</label>
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      value={newPlayerPhone}
                      onChange={(e) => setNewPlayerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="07XXXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {authError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs transition-all shadow-lg"
                  >
                    حفظ الملف ومتابعة الحجز
                  </button>
                </form>
              </div>
            </div>
          )}

          {showOwnerPitchSetup && ownerTempAuth && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-amber-500/60 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-right">
                <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-3">
                  <LayoutDashboard className="w-5 h-5" />
                  <h3 className="font-black text-sm text-white">إكمال بيانات ملعبك الرياضي</h3>
                </div>

                <form onSubmit={handleSaveOwnerPitchProfile} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">اسم الملعب</label>
                    <input
                      type="text"
                      required
                      value={newPitchName}
                      onChange={(e) => setNewPitchName(e.target.value)}
                      placeholder="مثال: ساحة النجوم الدولية"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">المحافظة</label>
                      <select
                        value={newPitchProvince}
                        onChange={(e) => setNewPitchProvince(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
                      >
                        {IRAQ_PROVINCES.map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">المنطقة / الحي</label>
                      <input
                        type="text"
                        required
                        value={newPitchArea}
                        onChange={(e) => setNewPitchArea(e.target.value)}
                        placeholder="مثال: حي الجامعة"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">رقم الهاتف العراقي</label>
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      value={newOwnerPhone}
                      onChange={(e) => setNewOwnerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="07XXXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none"
                    />
                  </div>

                  {authError && <p className="text-xs text-rose-400">{authError}</p>}

                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-lg"
                  >
                    إنشاء حساب الملعب فوراً
                  </button>
                </form>
              </div>
            </div>
          )}

          {showEditPlayerModal && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-4 text-right">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white text-sm">تعديل اسم اللاعب / الفريق</h4>
                  <button onClick={() => setShowEditPlayerModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSaveNewPlayerName} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">الاسم الجديد:</label>
                    <input
                      type="text"
                      required
                      value={tempPlayerName}
                      onChange={(e) => setTempPlayerName(e.target.value)}
                      placeholder="اكتب اسمك الجديد"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs"
                    >
                      حفظ التغيير
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditPlayerModal(false)}
                      className="bg-slate-800 text-slate-300 font-bold py-2 rounded-xl text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {currentUser.role === 'owner' && currentOwnerPitch && (
            <div>
              {currentOwnerPitch.subscriptionStatus === 'expired' ? (
                <div className="bg-slate-900 border border-rose-900/80 rounded-3xl p-6 md:p-10 max-w-2xl mx-auto my-8 text-center shadow-2xl space-y-6">
                  <div className="w-16 h-16 bg-rose-950/80 border border-rose-800 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {currentOwnerPitch.lastRenewDate === '-' ? 'تفعيل اشتراك الملعب لأول مرة' : `انتهى اشتراك ملعب (${currentOwnerPitch.name})`}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                      {currentOwnerPitch.lastRenewDate === '-' 
                        ? 'يرجى تحويل مبلغ الاشتراك الأول عبر محفظة زين كاش لاعتماد الملعب ونشره في المنظومة.' 
                        : 'انتهت صلاحية اشتراك هذا الملعب. يرجى تجديد الاشتراك الشهري عبر محفظة زين كاش للمتابعة.'}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-3 text-right">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <span className="text-slate-400">قيمة الاشتراك:</span>
                      <span className="text-emerald-400 font-bold text-sm">75,000 د.ع / 30 يوماً</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <span className="text-slate-400">رقم تحويل زين كاش المعتمد:</span>
                      <span className="text-amber-400 font-mono font-black text-base select-all bg-slate-900 px-3 py-1 rounded-lg border border-slate-750">
                        {OFFICIAL_PAYMENT_PHONE}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <a
                      href={whatsappRenewalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
                    >
                      إرسال سكرين شوت التحويل عبر واتساب ({OFFICIAL_PAYMENT_PHONE})
                    </a>

                    {currentOwnerPitch.lastRenewDate !== '-' && !currentOwnerPitch.usedEmergencyExtension && (
                      <button
                        type="button"
                        onClick={handleActivateEmergencyExtension}
                        className="w-full bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/60 text-amber-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <Zap className="w-4 h-4 text-amber-400" />
                        طلب تمديد طارئ (مهلة 24 ساعة لاستمرار الحجوزات)
                      </button>
                    )}
                  </div>
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
                      <Edit3 className="w-4 h-4" /> تعديل بيانات وصورة الملعب والمحافظة
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
                            href={whatsappRenewalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-bold py-2 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                          >
                            تمديد الاشتراك مسبقاً (واتساب)
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
                          <CheckCircle2 className="w-4 h-4" /> تم حفظ التعديلات وصورة الملعب في السحابة بنجاح!
                        </div>
                      )}

                      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5">
                        <h4 className="font-bold text-white text-base">بيانات الملعب وصورته</h4>

                        <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                          <label className="text-xs text-slate-300 block font-bold">صورة واجهة الملعب:</label>
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <img 
                              src={editImage || 'https://images.unsplash.com/photo-1529900241456-075e81d77a82?w=800&auto=format&fit=crop&q=60'} 
                              alt="معاينة الملعب" 
                              className="w-32 h-24 object-cover rounded-xl border border-slate-850 shadow-md flex-shrink-0"
                            />
                            <div className="space-y-2 w-full">
                              <label className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer inline-flex items-center gap-2 border border-slate-700 transition-all">
                                <Upload className="w-4 h-4" /> اختيار صورة من الجهاز
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleImageFileChange} 
                                  className="hidden" 
                                />
                              </label>
                              <input
                                type="url"
                                value={editImage}
                                onChange={(e) => setEditImage(e.target.value)}
                                placeholder="أو رابط الصورة..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                            <label className="text-xs text-slate-300 block mb-1">المحافظة:</label>
                            <select
                              value={editProvince}
                              onChange={(e) => setEditProvince(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                            >
                              {IRAQ_PROVINCES.map(prov => (
                                <option key={prov} value={prov}>{prov}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-slate-300 block mb-1">المنطقة والحي:</label>
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
                        className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-lg"
                      >
                        حفظ التعديلات في السحابة
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {currentUser.role === 'player' && (
            <div>
              {!selectedPitchId ? (
                <div className="space-y-6">
                  <div className="text-center py-4 max-w-xl mx-auto space-y-2">
                    <h2 className="text-2xl font-black text-white">الملاعب الرياضية المتاحة</h2>
                    <p className="text-xs text-slate-400">اختر محافظتك وتصفح الملاعب المجهزة بالكامل</p>

                    <div className="flex items-center justify-center gap-1.5 flex-wrap pt-3">
                      <button
                        onClick={() => setSelectedProvinceFilter('الكل')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedProvinceFilter === 'الكل' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        كل العراق
                      </button>
                      {IRAQ_PROVINCES.slice(0, 7).map(prov => (
                        <button
                          key={prov}
                          onClick={() => setSelectedProvinceFilter(prov)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedProvinceFilter === prov ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {prov}
                        </button>
                      ))}
                      <select
                        value={selectedProvinceFilter}
                        onChange={(e) => setSelectedProvinceFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 outline-none font-bold"
                      >
                        <option value="الكل">باقي المحافظات...</option>
                        {IRAQ_PROVINCES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {displayedPitches.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl text-center space-y-3 max-w-md mx-auto">
                      <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                      <h4 className="font-bold text-white text-base">لا توجد ملاعب في {selectedProvinceFilter}</h4>
                      <p className="text-xs text-slate-400">جرب اختيار محافظة أخرى أو تصفح كل العراق.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {displayedPitches.map(p => (
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
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {p.city} - {p.area}
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
                      <div>
                        <h2 className="text-2xl font-black text-white">{activePitchForPlayer.name}</h2>
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5" /> {activePitchForPlayer.city} - {activePitchForPlayer.area}
                        </span>
                      </div>
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

          {currentUser.role === 'admin' && (
            <div className="bg-slate-900 border border-blue-900/60 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-lg font-black text-white">لوحة الإدارة السحابية المركزية</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">إجمالي اللاعبين المسجلين</span>
                    <span className="text-2xl font-black text-white">{playersList.length} لاعب</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-amber-950 border border-amber-800 text-amber-400 rounded-xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">إجمالي الملاعب المسجلة</span>
                    <span className="text-2xl font-black text-white">{pitchesList.length} ملعب</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-blue-950 border border-blue-800 text-blue-400 rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">الملاعب النشطة حالياً</span>
                    <span className="text-2xl font-black text-emerald-400">
                      {pitchesList.filter(p => p.subscriptionStatus === 'active').length} نشط
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-sm text-slate-300">إدارة اشتراكات الملاعب:</h4>
                {pitchesList.map(p => (
                  <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-900">
                      <div>
                        <h4 className="font-bold text-white text-base">{p.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{p.city} - {p.area}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        p.subscriptionStatus === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {p.subscriptionStatus === 'active' ? `نشط (${p.subscriptionDaysLeft} يوم)` : 'معطل / منتهي'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 block">صاحب الملعب:</span>
                        <span className="text-white font-bold text-sm block">{p.ownerName}</span>
                      </div>
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 block">رقم الهاتف:</span>
                        <span className="text-emerald-400 font-mono font-bold text-sm block">{p.ownerPhone}</span>
                      </div>
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 block">آخر تاريخ تجديد:</span>
                        <span className="text-amber-400 font-mono font-bold text-sm block">{p.lastRenewDate}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        onClick={async () => {
                          const today = new Date().toISOString().split('T')[0];
                          await updateDoc(doc(db, 'pitches', p.id), {
                            subscriptionStatus: 'active',
                            subscriptionDaysLeft: (p.subscriptionDaysLeft || 0) + 30,
                            lastRenewDate: today,
                            usedEmergencyExtension: false
                          });
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                      >
                        + تمديد 30 يوماً
                      </button>
                      <button
                        onClick={async () => {
                          await updateDoc(doc(db, 'pitches', p.id), {
                            subscriptionStatus: 'expired',
                            subscriptionDaysLeft: 0
                          });
                        }}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                      >
                        تعطيل الحساب
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('هل أنت متأكد من حذف الملعب نهائياً؟')) {
                            await deleteDoc(doc(db, 'pitches', p.id));
                          }
                        }}
                        className="bg-slate-800 hover:bg-rose-900 text-rose-400 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-slate-700"
                      >
                        حذف نهائياً
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      <footer className="mt-12 pt-4 border-t border-slate-900 text-center text-xs text-slate-600">
        <button
          onClick={() => {
            setAdminUsername('');
            setAdminPassword('');
            setAdminError('');
            setShowAdminModal(true);
          }}
          className="hover:text-slate-400 transition-colors flex items-center justify-center gap-1 mx-auto"
        >
          <Lock className="w-3 h-3" /> بوابة الإدارة (Master Access)
        </button>
      </footer>

      {selectedSlot && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white text-base">تأكيد حجز الموعد السحابي</h4>
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg">
                تأكيد تثبيت الحجز في السحابة
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
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md"
              >
                تثبيت الحجز في السحابة
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
                className="bg-slate-800 hover:bg-slate-750 text-white py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
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
                  placeholder="اسم المستخدم"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-blue-500 outline-none"
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
                    placeholder="كلمة المرور"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-3 pl-9 py-2 text-sm text-white font-mono focus:border-blue-500 outline-none"
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
              {adminError && <p className="text-[11px] text-rose-400 text-center bg-rose-950/40 p-2 rounded-lg border border-rose-900/60">{adminError}</p>}
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs shadow-lg">
                تسجيل الدخول
              </button>
            </form>
          </div>
        </div>
      )}

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

    </div>
  );
}
