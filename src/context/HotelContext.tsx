import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import { db, doc, setDoc, getDoc, onSnapshot } from '../lib/firebase';
import {
  HotelDataState,
  Room,
  RoomType,
  Guest,
  Booking,
  PaymentRecord,
  FoodItem,
  RestaurantOrder,
  ExtraService,
  Staff,
  HousekeepingTask,
  Expense,
  HotelSettings,
  AppUser,
  NotificationItem,
  RoomStatus,
  CleaningStatus,
  PaymentMethod,
  IdProofType,
  UserRole
} from '../types/hotel';
import { DEFAULT_HOTEL_STATE } from '../data/initialData';

const MASTER_STORAGE_KEY = 'alkareem_hotel_management_system_master_v1';
const LEGACY_STORAGE_KEYS = [
  'alkareem_hotel_system_v4_logo',
  'alkareem_hotel_system_v3',
  'alkareem_hotel_system_v1',
  'grand_heritage_india_hms_v3_clean_data',
  'grand_vista_hms_data_v2',
  'hotel_management_system_data_v1'
];

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface HotelContextType {
  data: HotelDataState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  selectedInvoiceBookingId: string | null;
  setSelectedInvoiceBookingId: (id: string | null) => void;
  selectedReceiptId: string | null;
  setSelectedReceiptId: (id: string | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  firebaseSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: Date | null;
  forceSyncToFirebase: () => Promise<void>;

  // Room operations
  addRoom: (roomData: Omit<Room, 'id'>) => boolean;
  updateRoom: (id: string, roomData: Partial<Room>) => boolean;
  deleteRoom: (id: string) => boolean;
  setRoomStatus: (roomId: string, status: RoomStatus) => void;

  // Room Type operations
  addRoomType: (roomTypeData: Omit<RoomType, 'id'>) => boolean;
  updateRoomType: (id: string, roomTypeData: Partial<RoomType>) => boolean;
  deleteRoomType: (id: string) => boolean;

  // Guest operations
  addGuest: (guestData: Omit<Guest, 'id' | 'guestId' | 'createdAt'>) => Guest;
  updateGuest: (id: string, guestData: Partial<Guest>) => boolean;
  deleteGuest: (id: string) => boolean;

  // Booking operations
  checkRoomAvailability: (roomId: string, checkInDate: string, checkOutDate: string, excludeBookingId?: string) => boolean;
  createBooking: (bookingData: {
    guestId?: string;
    newGuest?: Omit<Guest, 'id' | 'guestId' | 'createdAt'>;
    roomId: string;
    checkInDate: string;
    checkInTime?: string;
    checkOutDate: string;
    checkOutTime?: string;
    adults: number;
    children: number;
    roomRate?: number;
    discount?: number;
    advancePayment: number;
    paymentMethod: PaymentMethod;
    specialRequests?: string;
  }) => Booking | null;
  updateBooking: (id: string, bookingData: Partial<Booking>) => boolean;
  cancelBooking: (id: string, reason?: string) => boolean;
  checkInGuest: (bookingId: string, idProofType?: IdProofType, idProofNumber?: string, additionalDeposit?: number, depositMethod?: PaymentMethod) => boolean;
  checkOutGuest: (bookingId: string, collectedPayment: number, paymentMethod: PaymentMethod, notes?: string) => boolean;

  // Payment operations
  addPayment: (paymentData: {
    bookingId: string;
    guestName: string;
    roomNumber: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentType: 'Advance' | 'Check-in' | 'Check-out' | 'Room Service' | 'Extra Service' | 'Settlement';
    transactionRef?: string;
    notes?: string;
  }) => PaymentRecord;

  // Restaurant & POS
  addFoodItem: (item: Omit<FoodItem, 'id'>) => boolean;
  updateFoodItem: (id: string, item: Partial<FoodItem>) => boolean;
  deleteFoodItem: (id: string) => boolean;
  createRestaurantOrder: (orderData: {
    orderType: 'Room Service' | 'Dine-In Table';
    roomNumber?: string;
    tableNumber?: string;
    guestName: string;
    bookingId?: string;
    items: { foodItemId: string; name: string; price: number; quantity: number }[];
    chargeToRoom: boolean;
    paymentMethod?: PaymentMethod;
  }) => RestaurantOrder | null;
  updateRestaurantOrderStatus: (orderId: string, status: RestaurantOrder['status']) => void;

  // Extra services
  addExtraService: (service: Omit<ExtraService, 'id'>) => boolean;
  updateExtraService: (id: string, service: Partial<ExtraService>) => boolean;
  deleteExtraService: (id: string) => boolean;
  chargeServiceToBooking: (bookingId: string, serviceId: string, quantity: number, notes?: string) => boolean;

  // Staff
  addStaff: (staffData: Omit<Staff, 'id' | 'staffId'>) => boolean;
  updateStaff: (id: string, staffData: Partial<Staff>) => boolean;
  deleteStaff: (id: string) => boolean;

  // Housekeeping
  updateHousekeepingTask: (taskId: string, cleaningStatus: CleaningStatus, cleaningNotes?: string) => boolean;
  assignHousekeepingStaff: (taskId: string, staffId: string) => boolean;
  createHousekeepingTask: (roomId: string, priority?: 'Low' | 'Medium' | 'High' | 'Urgent', notes?: string) => boolean;

  // Expenses
  addExpense: (expenseData: Omit<Expense, 'id' | 'expenseId'>) => boolean;
  updateExpense: (id: string, expenseData: Partial<Expense>) => boolean;
  deleteExpense: (id: string) => boolean;

  // Settings
  updateSettings: (newSettings: Partial<HotelSettings>) => void;

  // Users & Roles
  setCurrentUser: (user: AppUser) => void;
  switchRole: (role: UserRole) => void;
  addUser: (userData: Omit<AppUser, 'id'>) => boolean;
  updateUser: (id: string, userData: Partial<AppUser>) => boolean;
  deleteUser: (id: string) => boolean;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  // Backup and Restore
  exportDataAsJSON: () => void;
  importDataFromJSON: (jsonData: string) => boolean;
  resetToDefaultData: () => void;
  clearAllOperationalData: () => void;

  // Summary Metrics computed memo
  metrics: {
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    reservedRooms: number;
    cleaningRooms: number;
    maintenanceRooms: number;
    occupancyRate: number;
    todaysCheckInsCount: number;
    todaysCheckOutsCount: number;
    todaysRevenue: number;
    totalRevenue: number;
    pendingPaymentsTotal: number;
    totalExpenses: number;
    netProfit: number;
  };
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<HotelDataState>(() => {
    try {
      // 1. Check primary master key
      const master = localStorage.getItem(MASTER_STORAGE_KEY);
      if (master) {
        const parsed = JSON.parse(master);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.rooms)) {
          return {
            ...DEFAULT_HOTEL_STATE,
            ...parsed,
            settings: {
              ...DEFAULT_HOTEL_STATE.settings,
              ...(parsed.settings || {}),
              signatureUrl: parsed.settings?.signatureUrl || DEFAULT_HOTEL_STATE.settings.signatureUrl,
              signatoryTitle: parsed.settings?.signatoryTitle || DEFAULT_HOTEL_STATE.settings.signatoryTitle
            }
          };
        }
      }

      // 2. Check legacy storage keys for migration
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const storedLegacy = localStorage.getItem(legacyKey);
        if (storedLegacy) {
          const parsed = JSON.parse(storedLegacy);
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.rooms)) {
            const merged: HotelDataState = {
              ...DEFAULT_HOTEL_STATE,
              ...parsed,
              settings: {
                ...DEFAULT_HOTEL_STATE.settings,
                ...(parsed.settings || {}),
                signatureUrl: parsed.settings?.signatureUrl || DEFAULT_HOTEL_STATE.settings.signatureUrl,
                signatoryTitle: parsed.settings?.signatoryTitle || DEFAULT_HOTEL_STATE.settings.signatoryTitle
              }
            };
            localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(merged));
            return merged;
          }
        }
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
    return DEFAULT_HOTEL_STATE;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [selectedInvoiceBookingId, setSelectedInvoiceBookingId] = useState<string | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('syncing');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const isRemoteUpdateRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronous and reactive persistence to local storage
  const saveToStorage = (stateToSave: HotelDataState) => {
    try {
      localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  };

  // 1. Listen for real-time changes from Google Firebase Firestore
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const docRef = doc(db, 'hotel_data', 'alkareem_master');
      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const cloudData = snapshot.data();
            if (cloudData && Array.isArray(cloudData.rooms)) {
              isRemoteUpdateRef.current = true;
              setData(prev => {
                const merged: HotelDataState = {
                  ...prev,
                  ...cloudData,
                  settings: {
                    ...prev.settings,
                    ...(cloudData.settings || {}),
                    signatureUrl: cloudData.settings?.signatureUrl || prev.settings?.signatureUrl || DEFAULT_HOTEL_STATE.settings.signatureUrl,
                    signatoryTitle: cloudData.settings?.signatoryTitle || prev.settings?.signatoryTitle || DEFAULT_HOTEL_STATE.settings.signatoryTitle
                  }
                };
                saveToStorage(merged);
                return merged;
              });
              setFirebaseSyncStatus('synced');
              setLastSyncedAt(new Date());
              setTimeout(() => {
                isRemoteUpdateRef.current = false;
              }, 500);
            }
          } else {
            // First time setup on Firestore - initialize with local data
            forceSyncToFirebase();
          }
        },
        (error) => {
          console.warn('Firebase Firestore onSnapshot note:', error.message);
          setFirebaseSyncStatus('offline');
        }
      );
    } catch (err) {
      console.error('Error connecting to Firebase Firestore', err);
      setFirebaseSyncStatus('error');
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Push local updates to Firebase Firestore (debounced for rapid actions)
  const pushToFirebase = async (stateToSave: HotelDataState) => {
    try {
      setFirebaseSyncStatus('syncing');
      const docRef = doc(db, 'hotel_data', 'alkareem_master');
      const sanitized = JSON.parse(JSON.stringify(stateToSave));
      await setDoc(docRef, {
        ...sanitized,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setFirebaseSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (error: any) {
      console.warn('Failed to sync to Firebase Firestore:', error?.message || error);
      setFirebaseSyncStatus('offline');
    }
  };

  const forceSyncToFirebase = async () => {
    await pushToFirebase(data);
  };

  useEffect(() => {
    saveToStorage(data);

    // Only push to Firebase if this update did NOT originate from a Firebase remote snapshot
    if (!isRemoteUpdateRef.current) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setFirebaseSyncStatus('syncing');
      saveTimeoutRef.current = setTimeout(() => {
        pushToFirebase(data);
      }, 400);
    }
  }, [data]);

  // Handle pagehide & beforeunload to guarantee immediate persistence
  useEffect(() => {
    const handleUnload = () => {
      saveToStorage(data);
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [data]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Availability Conflict Detection
  const checkRoomAvailability = (roomId: string, checkInDate: string, checkOutDate: string, excludeBookingId?: string): boolean => {
    const checkIn = new Date(checkInDate).getTime();
    const checkOut = new Date(checkOutDate).getTime();

    if (isNaN(checkIn) || isNaN(checkOut) || checkOut <= checkIn) {
      return false;
    }

    const conflictingBookings = data.bookings.filter(b => {
      if (b.roomId !== roomId) return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;
      if (b.status === 'Cancelled' || b.status === 'Checked-out' || b.status === 'No-show') return false;

      const existingIn = new Date(b.checkInDate).getTime();
      const existingOut = new Date(b.checkOutDate).getTime();

      // Check overlap: (StartA < EndB) and (EndA > StartB)
      return checkIn < existingOut && checkOut > existingIn;
    });

    return conflictingBookings.length === 0;
  };

  // ROOM CRUD
  const addRoom = (roomData: Omit<Room, 'id'>): boolean => {
    const exists = data.rooms.some(r => r.roomNumber.toLowerCase() === roomData.roomNumber.toLowerCase());
    if (exists) {
      showToast('Error', `Room number ${roomData.roomNumber} already exists.`, 'error');
      return false;
    }

    const roomType = data.roomTypes.find(rt => rt.id === roomData.roomTypeId);
    const newRoom: Room = {
      ...roomData,
      id: 'room-' + Date.now(),
      roomTypeName: roomType ? roomType.name : roomData.roomTypeName || 'Standard'
    };

    // Also create a housekeeping task
    const newTask: HousekeepingTask = {
      id: 'hk-' + Date.now(),
      roomNumber: newRoom.roomNumber,
      roomId: newRoom.id,
      currentStatus: newRoom.status,
      cleaningStatus: newRoom.cleaningStatus,
      lastCleaned: new Date().toISOString().replace('T', ' ').substring(0, 16),
      priority: 'Low',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setData(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom],
      housekeepingTasks: [...prev.housekeepingTasks, newTask]
    }));

    showToast('Room Added', `Room ${newRoom.roomNumber} added successfully.`, 'success');
    return true;
  };

  const updateRoom = (id: string, roomData: Partial<Room>): boolean => {
    if (roomData.roomNumber) {
      const duplicate = data.rooms.some(r => r.id !== id && r.roomNumber.toLowerCase() === roomData.roomNumber?.toLowerCase());
      if (duplicate) {
        showToast('Error', `Room number ${roomData.roomNumber} already in use.`, 'error');
        return false;
      }
    }

    setData(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => (r.id === id ? { ...r, ...roomData } : r)),
      housekeepingTasks: prev.housekeepingTasks.map(hk => {
        if (hk.roomId === id) {
          return {
            ...hk,
            roomNumber: roomData.roomNumber || hk.roomNumber,
            currentStatus: roomData.status || hk.currentStatus,
            cleaningStatus: roomData.cleaningStatus || hk.cleaningStatus
          };
        }
        return hk;
      })
    }));

    showToast('Room Updated', 'Room details updated successfully.', 'success');
    return true;
  };

  const deleteRoom = (id: string): boolean => {
    const target = data.rooms.find(r => r.id === id);
    if (!target) return false;

    if (target.status === 'Occupied') {
      showToast('Cannot Delete', `Room ${target.roomNumber} is currently occupied! Check out the guest first.`, 'error');
      return false;
    }

    setData(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r.id !== id),
      housekeepingTasks: prev.housekeepingTasks.filter(hk => hk.roomId !== id)
    }));

    showToast('Room Deleted', `Room ${target.roomNumber} was removed.`, 'info');
    return true;
  };

  const setRoomStatus = (roomId: string, status: RoomStatus) => {
    setData(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, status } : r),
      housekeepingTasks: prev.housekeepingTasks.map(hk => hk.roomId === roomId ? { ...hk, currentStatus: status } : hk)
    }));
  };

  // ROOM TYPE CRUD
  const addRoomType = (roomTypeData: Omit<RoomType, 'id'>): boolean => {
    const exists = data.roomTypes.some(rt => rt.name.toLowerCase() === roomTypeData.name.toLowerCase());
    if (exists) {
      showToast('Error', `Room type "${roomTypeData.name}" already exists.`, 'error');
      return false;
    }

    const newType: RoomType = {
      ...roomTypeData,
      id: 'rt-' + Date.now()
    };

    setData(prev => ({
      ...prev,
      roomTypes: [...prev.roomTypes, newType]
    }));

    showToast('Room Type Created', `Room category ${newType.name} created.`, 'success');
    return true;
  };

  const updateRoomType = (id: string, roomTypeData: Partial<RoomType>): boolean => {
    setData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.map(rt => rt.id === id ? { ...rt, ...roomTypeData } : rt)
    }));
    showToast('Room Type Updated', 'Room type configuration updated.', 'success');
    return true;
  };

  const deleteRoomType = (id: string): boolean => {
    const inUse = data.rooms.some(r => r.roomTypeId === id);
    if (inUse) {
      showToast('Cannot Delete', 'This room type has assigned rooms. Reassign them first.', 'error');
      return false;
    }
    setData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.filter(rt => rt.id !== id)
    }));
    showToast('Room Type Deleted', 'Room type removed.', 'info');
    return true;
  };

  // GUEST CRUD
  const addGuest = (guestData: Omit<Guest, 'id' | 'guestId' | 'createdAt'>): Guest => {
    const nextNum = 1000 + data.guests.length + 1;
    const newGuest: Guest = {
      ...guestData,
      id: 'gst-' + Date.now(),
      guestId: `GST-${nextNum}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setData(prev => ({
      ...prev,
      guests: [newGuest, ...prev.guests]
    }));

    return newGuest;
  };

  const updateGuest = (id: string, guestData: Partial<Guest>): boolean => {
    setData(prev => ({
      ...prev,
      guests: prev.guests.map(g => (g.id === id ? { ...g, ...guestData } : g))
    }));
    showToast('Guest Profile Updated', 'Guest information updated successfully.', 'success');
    return true;
  };

  const deleteGuest = (id: string): boolean => {
    const hasActiveStay = data.bookings.some(b => b.guestId === id && (b.status === 'Checked-in' || b.status === 'Confirmed'));
    if (hasActiveStay) {
      showToast('Cannot Delete', 'Guest has an active or confirmed booking.', 'error');
      return false;
    }

    setData(prev => ({
      ...prev,
      guests: prev.guests.filter(g => g.id !== id)
    }));
    showToast('Guest Removed', 'Guest record deleted.', 'info');
    return true;
  };

  // BOOKING / RESERVATION
  const createBooking = (params: {
    guestId?: string;
    newGuest?: Omit<Guest, 'id' | 'guestId' | 'createdAt'>;
    roomId: string;
    checkInDate: string;
    checkInTime?: string;
    checkOutDate: string;
    checkOutTime?: string;
    adults: number;
    children: number;
    roomRate?: number;
    discount?: number;
    advancePayment: number;
    paymentMethod: PaymentMethod;
    specialRequests?: string;
  }): Booking | null => {
    const targetRoom = data.rooms.find(r => r.id === params.roomId);
    if (!targetRoom) {
      showToast('Error', 'Selected room not found.', 'error');
      return null;
    }

    // Check availability
    const isAvailable = checkRoomAvailability(params.roomId, params.checkInDate, params.checkOutDate);
    if (!isAvailable) {
      showToast('Double Booking Conflict', `Room ${targetRoom.roomNumber} is already booked for these dates. Please choose another room or change dates.`, 'error');
      return null;
    }

    // Handle guest
    let activeGuest: Guest;
    if (params.guestId) {
      const g = data.guests.find(item => item.id === params.guestId);
      if (!g) {
        showToast('Error', 'Guest profile not found.', 'error');
        return null;
      }
      activeGuest = g;
    } else if (params.newGuest) {
      activeGuest = addGuest(params.newGuest);
    } else {
      showToast('Error', 'Please select or provide guest details.', 'error');
      return null;
    }

    // Calculate dates & amounts
    const checkInMs = new Date(params.checkInDate).getTime();
    const checkOutMs = new Date(params.checkOutDate).getTime();
    const diffDays = Math.max(1, Math.round((checkOutMs - checkInMs) / (1000 * 60 * 60 * 24)));

    const rate = params.roomRate !== undefined && params.roomRate > 0 ? params.roomRate : targetRoom.price;
    const roomCharges = rate * diffDays;
    const discount = params.discount || 0;
    const extraCharges = 0;
    const taxRate = data.settings.taxPercentage || 12;
    const taxableAmount = Math.max(0, roomCharges + extraCharges - discount);
    const tax = Number(((taxableAmount * taxRate) / 100).toFixed(2));
    const grandTotal = Number((taxableAmount + tax).toFixed(2));
    const advance = Math.min(grandTotal, Math.max(0, params.advancePayment || 0));
    const paidAmount = advance;
    const pendingAmount = Number((grandTotal - paidAmount).toFixed(2));

    const bookingNumber = `BKG-2026-${String(data.bookings.length + 1).padStart(3, '0')}`;
    const bookingId = 'bkg-' + Date.now();

    const newBooking: Booking = {
      id: bookingId,
      bookingId: bookingNumber,
      guestId: activeGuest.id,
      guestName: activeGuest.fullName,
      mobile: activeGuest.mobile,
      email: activeGuest.email,
      roomId: targetRoom.id,
      roomNumber: targetRoom.roomNumber,
      roomTypeName: targetRoom.roomTypeName || 'Room',
      checkInDate: params.checkInDate,
      checkInTime: params.checkInTime || data.settings.checkInTime || '14:00',
      checkOutDate: params.checkOutDate,
      checkOutTime: params.checkOutTime || data.settings.checkOutTime || '11:00',
      adults: params.adults,
      children: params.children,
      nights: diffDays,
      roomRate: rate,
      roomCharges,
      extraCharges,
      discount,
      tax,
      grandTotal,
      advancePayment: advance,
      paidAmount,
      pendingAmount,
      paymentMethod: params.paymentMethod,
      status: 'Confirmed',
      specialRequests: params.specialRequests,
      serviceCharges: [],
      restaurantOrderIds: [],
      idProofType: activeGuest.idProofType,
      idProofNumber: activeGuest.idProofNumber,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    // If advance payment made, generate a payment record
    let newPayment: PaymentRecord | null = null;
    if (advance > 0) {
      newPayment = {
        id: 'pay-' + Date.now(),
        receiptNumber: `${data.settings.receiptPrefix || 'REC-2026-'}${String(data.payments.length + 1).padStart(3, '0')}`,
        bookingId: newBooking.bookingId,
        guestName: activeGuest.fullName,
        roomNumber: targetRoom.roomNumber,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        amount: advance,
        paymentMethod: params.paymentMethod,
        paymentType: 'Advance',
        transactionRef: 'ADV-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        notes: 'Advance booking payment deposit',
        createdByName: data.currentUser.fullName
      };
    }

    // If checkInDate is today, set room status to Reserved if it was Available
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = params.checkInDate === todayStr;

    setData(prev => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
      payments: newPayment ? [newPayment, ...prev.payments] : prev.payments,
      rooms: prev.rooms.map(r => {
        if (r.id === targetRoom.id && (isToday || r.status === 'Available')) {
          return {
            ...r,
            status: isToday ? 'Reserved' : r.status,
            currentBookingId: bookingId,
            currentGuestName: activeGuest.fullName
          };
        }
        return r;
      }),
      notifications: [
        {
          id: 'notif-' + Date.now(),
          title: 'New Reservation Created',
          message: `${bookingNumber} for ${activeGuest.fullName} in Room ${targetRoom.roomNumber} (${diffDays} night${diffDays > 1 ? 's' : ''}).`,
          type: 'success',
          timestamp: 'Just now',
          read: false,
          linkTab: 'reservations'
        },
        ...prev.notifications
      ]
    }));

    showToast('Reservation Confirmed', `Booking ${bookingNumber} created for ${activeGuest.fullName}.`, 'success');
    return newBooking;
  };

  const updateBooking = (id: string, bookingData: Partial<Booking>): boolean => {
    setData(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => {
        if (b.id === id) {
          const updated = { ...b, ...bookingData };
          // Recalculate financial breakdown if roomRate/discount/extraCharges changed
          const roomCharges = (updated.roomRate || b.roomRate) * (updated.nights || b.nights);
          const extraCharges = updated.extraCharges !== undefined ? updated.extraCharges : b.extraCharges;
          const discount = updated.discount !== undefined ? updated.discount : b.discount;
          const taxRate = prev.settings.taxPercentage || 12;
          const taxable = Math.max(0, roomCharges + extraCharges - discount);
          const tax = Number(((taxable * taxRate) / 100).toFixed(2));
          const grandTotal = Number((taxable + tax).toFixed(2));
          const pendingAmount = Number((grandTotal - (updated.paidAmount ?? b.paidAmount)).toFixed(2));

          return {
            ...updated,
            roomCharges,
            tax,
            grandTotal,
            pendingAmount
          };
        }
        return b;
      })
    }));

    showToast('Booking Updated', 'Reservation record updated.', 'success');
    return true;
  };

  const cancelBooking = (id: string, reason?: string): boolean => {
    const target = data.bookings.find(b => b.id === id);
    if (!target) return false;

    setData(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => (b.id === id ? { ...b, status: 'Cancelled', specialRequests: `${b.specialRequests || ''} [Cancelled: ${reason || 'Customer request'}]` } : b)),
      rooms: prev.rooms.map(r => {
        if (r.id === target.roomId && (r.status === 'Reserved' || r.status === 'Occupied')) {
          return {
            ...r,
            status: 'Available',
            currentBookingId: undefined,
            currentGuestName: undefined
          };
        }
        return r;
      }),
      notifications: [
        {
          id: 'notif-' + Date.now(),
          title: 'Booking Cancelled',
          message: `Booking ${target.bookingId} (${target.guestName}) for Room ${target.roomNumber} was cancelled.`,
          type: 'warning',
          timestamp: 'Just now',
          read: false,
          linkTab: 'reservations'
        },
        ...prev.notifications
      ]
    }));

    showToast('Booking Cancelled', `Reservation ${target.bookingId} has been cancelled.`, 'info');
    return true;
  };

  // CHECK-IN
  const checkInGuest = (bookingId: string, idProofType?: IdProofType, idProofNumber?: string, additionalDeposit?: number, depositMethod?: PaymentMethod): boolean => {
    const booking = data.bookings.find(b => b.id === bookingId || b.bookingId === bookingId);
    if (!booking) {
      showToast('Error', 'Booking not found.', 'error');
      return false;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let newPayment: PaymentRecord | null = null;
    let newPaid = booking.paidAmount;

    if (additionalDeposit && additionalDeposit > 0 && depositMethod) {
      newPaid += additionalDeposit;
      newPayment = {
        id: 'pay-' + Date.now(),
        receiptNumber: `${data.settings.receiptPrefix || 'REC-2026-'}${String(data.payments.length + 1).padStart(3, '0')}`,
        bookingId: booking.bookingId,
        guestName: booking.guestName,
        roomNumber: booking.roomNumber,
        date: nowStr,
        amount: additionalDeposit,
        paymentMethod: depositMethod,
        paymentType: 'Check-in',
        transactionRef: 'CHK-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        notes: 'Check-in additional advance/deposit payment',
        createdByName: data.currentUser.fullName
      };
    }

    const newPending = Number((booking.grandTotal - newPaid).toFixed(2));

    setData(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => {
        if (b.id === booking.id) {
          return {
            ...b,
            status: 'Checked-in',
            checkedInAt: nowStr,
            idProofType: idProofType || b.idProofType,
            idProofNumber: idProofNumber || b.idProofNumber,
            paidAmount: newPaid,
            pendingAmount: newPending
          };
        }
        return b;
      }),
      rooms: prev.rooms.map(r => {
        if (r.id === booking.roomId) {
          return {
            ...r,
            status: 'Occupied',
            currentBookingId: booking.id,
            currentGuestName: booking.guestName
          };
        }
        return r;
      }),
      payments: newPayment ? [newPayment, ...prev.payments] : prev.payments,
      housekeepingTasks: prev.housekeepingTasks.map(hk => (hk.roomId === booking.roomId ? { ...hk, currentStatus: 'Occupied' } : hk)),
      notifications: [
        {
          id: 'notif-' + Date.now(),
          title: 'Guest Checked In',
          message: `${booking.guestName} has checked into Room ${booking.roomNumber}. Key handed over.`,
          type: 'success',
          timestamp: 'Just now',
          read: false,
          linkTab: 'checkin'
        },
        ...prev.notifications
      ]
    }));

    showToast('Check-in Complete', `${booking.guestName} checked in to Room ${booking.roomNumber}.`, 'success');
    return true;
  };

  // CHECK-OUT
  const checkOutGuest = (bookingId: string, collectedPayment: number, paymentMethod: PaymentMethod, notes?: string): boolean => {
    const booking = data.bookings.find(b => b.id === bookingId || b.bookingId === bookingId);
    if (!booking) {
      showToast('Error', 'Booking not found for checkout.', 'error');
      return false;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let finalPayment: PaymentRecord | null = null;
    let finalPaid = booking.paidAmount;

    if (collectedPayment > 0) {
      finalPaid += collectedPayment;
      finalPayment = {
        id: 'pay-' + Date.now(),
        receiptNumber: `${data.settings.receiptPrefix || 'REC-2026-'}${String(data.payments.length + 1).padStart(3, '0')}`,
        bookingId: booking.bookingId,
        guestName: booking.guestName,
        roomNumber: booking.roomNumber,
        date: nowStr,
        amount: collectedPayment,
        paymentMethod: paymentMethod,
        paymentType: 'Check-out',
        transactionRef: 'CO-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        notes: notes || 'Final folio settlement upon check-out',
        createdByName: data.currentUser.fullName
      };
    }

    const finalPending = Number((booking.grandTotal - finalPaid).toFixed(2));

    setData(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => {
        if (b.id === booking.id) {
          return {
            ...b,
            status: 'Checked-out',
            checkedOutAt: nowStr,
            paidAmount: finalPaid,
            pendingAmount: Math.max(0, finalPending)
          };
        }
        return b;
      }),
      // Automatically change room status to 'Cleaning'
      rooms: prev.rooms.map(r => {
        if (r.id === booking.roomId) {
          return {
            ...r,
            status: 'Cleaning',
            cleaningStatus: 'Dirty',
            currentBookingId: undefined,
            currentGuestName: undefined
          };
        }
        return r;
      }),
      payments: finalPayment ? [finalPayment, ...prev.payments] : prev.payments,
      // Update housekeeping task to urgent Dirty status
      housekeepingTasks: prev.housekeepingTasks.map(hk => {
        if (hk.roomId === booking.roomId) {
          return {
            ...hk,
            currentStatus: 'Cleaning',
            cleaningStatus: 'Dirty',
            priority: 'Urgent',
            cleaningNotes: `Guest checked out at ${nowStr}. Turnover sanitization required.`,
            updatedAt: nowStr
          };
        }
        return hk;
      }),
      notifications: [
        {
          id: 'notif-' + Date.now(),
          title: 'Guest Checked Out - Room Cleaning Needed',
          message: `${booking.guestName} checked out of Room ${booking.roomNumber}. Room marked as Cleaning.`,
          type: 'warning',
          timestamp: 'Just now',
          read: false,
          linkTab: 'housekeeping'
        },
        ...prev.notifications
      ]
    }));

    showToast('Check-out Successful', `Room ${booking.roomNumber} checked out and routed to Housekeeping.`, 'success');
    return true;
  };

  // PAYMENT LOGGING
  const addPayment = (paymentData: {
    bookingId: string;
    guestName: string;
    roomNumber: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentType: 'Advance' | 'Check-in' | 'Check-out' | 'Room Service' | 'Extra Service' | 'Settlement';
    transactionRef?: string;
    notes?: string;
  }): PaymentRecord => {
    const receiptNum = `${data.settings.receiptPrefix || 'REC-2026-'}${String(data.payments.length + 1).padStart(3, '0')}`;
    const newPayment: PaymentRecord = {
      id: 'pay-' + Date.now(),
      receiptNumber: receiptNum,
      ...paymentData,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdByName: data.currentUser.fullName
    };

    setData(prev => {
      // Update corresponding booking if found
      const updatedBookings = prev.bookings.map(b => {
        if (b.bookingId === paymentData.bookingId || b.id === paymentData.bookingId) {
          const updatedPaid = b.paidAmount + paymentData.amount;
          const updatedPending = Number((b.grandTotal - updatedPaid).toFixed(2));
          return {
            ...b,
            paidAmount: updatedPaid,
            pendingAmount: Math.max(0, updatedPending)
          };
        }
        return b;
      });

      return {
        ...prev,
        payments: [newPayment, ...prev.payments],
        bookings: updatedBookings
      };
    });

    showToast('Payment Recorded', `Receipt ${receiptNum} issued for ${data.settings.currencySymbol || '$'}${paymentData.amount.toFixed(2)}.`, 'success');
    return newPayment;
  };

  // RESTAURANT / POS
  const addFoodItem = (item: Omit<FoodItem, 'id'>): boolean => {
    const newItem: FoodItem = {
      ...item,
      id: 'food-' + Date.now()
    };
    setData(prev => ({
      ...prev,
      foodItems: [...prev.foodItems, newItem]
    }));
    showToast('Menu Item Added', `${item.name} added to restaurant menu.`, 'success');
    return true;
  };

  const updateFoodItem = (id: string, item: Partial<FoodItem>): boolean => {
    setData(prev => ({
      ...prev,
      foodItems: prev.foodItems.map(f => (f.id === id ? { ...f, ...item } : f))
    }));
    showToast('Menu Item Updated', 'Menu item modified successfully.', 'success');
    return true;
  };

  const deleteFoodItem = (id: string): boolean => {
    setData(prev => ({
      ...prev,
      foodItems: prev.foodItems.filter(f => f.id !== id)
    }));
    showToast('Item Deleted', 'Menu item removed.', 'info');
    return true;
  };

  const createRestaurantOrder = (orderData: {
    orderType: 'Room Service' | 'Dine-In Table';
    roomNumber?: string;
    tableNumber?: string;
    guestName: string;
    bookingId?: string;
    items: { foodItemId: string; name: string; price: number; quantity: number }[];
    chargeToRoom: boolean;
    paymentMethod?: PaymentMethod;
  }): RestaurantOrder | null => {
    const subtotal = orderData.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const taxRate = data.settings.taxPercentage || 12;
    const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const orderNumber = `ORD-2026-${String(data.restaurantOrders.length + 1).padStart(3, '0')}`;
    const orderId = 'ord-' + Date.now();

    const newOrder: RestaurantOrder = {
      id: orderId,
      orderNumber,
      orderType: orderData.orderType,
      roomNumber: orderData.roomNumber,
      tableNumber: orderData.tableNumber,
      guestName: orderData.guestName,
      bookingId: orderData.bookingId,
      items: orderData.items,
      subtotal,
      tax,
      total,
      status: 'Pending',
      billedToRoom: orderData.chargeToRoom,
      paymentStatus: orderData.chargeToRoom ? 'Added to Room Bill' : orderData.paymentMethod ? 'Paid' : 'Unpaid',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setData(prev => {
      let updatedBookings = prev.bookings;
      let newPayments = prev.payments;

      // If billed to room, add to the booking extraCharges
      if (orderData.chargeToRoom && orderData.bookingId) {
        const itemNames = orderData.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
        const serviceChargeItem = {
          id: 'sc-' + Date.now(),
          bookingId: orderData.bookingId,
          serviceName: `Room Service: ${itemNames.substring(0, 40)}`,
          category: 'Room Service' as const,
          quantity: 1,
          unitPrice: total,
          totalPrice: total,
          date: new Date().toISOString().split('T')[0],
          notes: `Order #${orderNumber}`
        };

        updatedBookings = prev.bookings.map(b => {
          if (b.id === orderData.bookingId || b.bookingId === orderData.bookingId) {
            const extraCharges = b.extraCharges + total;
            const taxable = Math.max(0, b.roomCharges + extraCharges - b.discount);
            const taxAmount = Number(((taxable * (prev.settings.taxPercentage || 12)) / 100).toFixed(2));
            const grandTotal = Number((taxable + taxAmount).toFixed(2));
            const pendingAmount = Number((grandTotal - b.paidAmount).toFixed(2));

            return {
              ...b,
              extraCharges,
              tax: taxAmount,
              grandTotal,
              pendingAmount,
              serviceCharges: [...b.serviceCharges, serviceChargeItem],
              restaurantOrderIds: [...b.restaurantOrderIds, orderId]
            };
          }
          return b;
        });
      } else if (!orderData.chargeToRoom && orderData.paymentMethod) {
        // Create an instant payment receipt for walk-in / cash restaurant order
        const paymentRecord: PaymentRecord = {
          id: 'pay-' + Date.now(),
          receiptNumber: `${prev.settings.receiptPrefix || 'REC-2026-'}${String(prev.payments.length + 1).padStart(3, '0')}`,
          bookingId: orderNumber,
          guestName: orderData.guestName,
          roomNumber: orderData.roomNumber || orderData.tableNumber || 'Restaurant POS',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          amount: total,
          paymentMethod: orderData.paymentMethod,
          paymentType: 'Room Service',
          transactionRef: 'POS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          notes: `Restaurant POS Order ${orderNumber}`,
          createdByName: prev.currentUser.fullName
        };
        newPayments = [paymentRecord, ...prev.payments];
      }

      return {
        ...prev,
        restaurantOrders: [newOrder, ...prev.restaurantOrders],
        bookings: updatedBookings,
        payments: newPayments
      };
    });

    showToast('Order Placed', `Order ${orderNumber} placed (${orderData.chargeToRoom ? 'Charged to Room Folio' : 'POS'}).`, 'success');
    return newOrder;
  };

  const updateRestaurantOrderStatus = (orderId: string, status: RestaurantOrder['status']) => {
    setData(prev => ({
      ...prev,
      restaurantOrders: prev.restaurantOrders.map(o => (o.id === orderId ? { ...o, status } : o))
    }));
    showToast('Order Status Updated', `Order marked as ${status}.`, 'info');
  };

  // EXTRA SERVICES
  const addExtraService = (service: Omit<ExtraService, 'id'>): boolean => {
    const newService: ExtraService = {
      ...service,
      id: 'srv-' + Date.now()
    };
    setData(prev => ({
      ...prev,
      extraServices: [...prev.extraServices, newService]
    }));
    showToast('Service Created', `${service.name} added to extra services.`, 'success');
    return true;
  };

  const updateExtraService = (id: string, service: Partial<ExtraService>): boolean => {
    setData(prev => ({
      ...prev,
      extraServices: prev.extraServices.map(s => (s.id === id ? { ...s, ...service } : s))
    }));
    showToast('Service Updated', 'Service package updated.', 'success');
    return true;
  };

  const deleteExtraService = (id: string): boolean => {
    setData(prev => ({
      ...prev,
      extraServices: prev.extraServices.filter(s => s.id !== id)
    }));
    showToast('Service Deleted', 'Extra service removed.', 'info');
    return true;
  };

  const chargeServiceToBooking = (bookingId: string, serviceId: string, quantity: number, notes?: string): boolean => {
    const service = data.extraServices.find(s => s.id === serviceId);
    const booking = data.bookings.find(b => b.id === bookingId || b.bookingId === bookingId);
    if (!service || !booking) {
      showToast('Error', 'Service or booking not found.', 'error');
      return false;
    }

    const totalCost = service.price * quantity;
    const serviceChargeItem = {
      id: 'sc-' + Date.now(),
      bookingId: booking.id,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      quantity,
      unitPrice: service.price,
      totalPrice: totalCost,
      date: new Date().toISOString().split('T')[0],
      notes
    };

    setData(prev => {
      const updatedBookings = prev.bookings.map(b => {
        if (b.id === booking.id) {
          const extraCharges = b.extraCharges + totalCost;
          const taxable = Math.max(0, b.roomCharges + extraCharges - b.discount);
          const taxAmount = Number(((taxable * (prev.settings.taxPercentage || 12)) / 100).toFixed(2));
          const grandTotal = Number((taxable + taxAmount).toFixed(2));
          const pendingAmount = Number((grandTotal - b.paidAmount).toFixed(2));

          return {
            ...b,
            extraCharges,
            tax: taxAmount,
            grandTotal,
            pendingAmount,
            serviceCharges: [...b.serviceCharges, serviceChargeItem]
          };
        }
        return b;
      });

      return {
        ...prev,
        bookings: updatedBookings
      };
    });

    showToast('Service Charged', `${quantity}x ${service.name} (${data.settings.currencySymbol || '$'}${totalCost}) charged to Room ${booking.roomNumber}.`, 'success');
    return true;
  };

  // STAFF CRUD
  const addStaff = (staffData: Omit<Staff, 'id' | 'staffId'>): boolean => {
    const nextNum = 100 + data.staff.length + 1;
    const newStaff: Staff = {
      ...staffData,
      id: 'stf-' + Date.now(),
      staffId: `STF-${nextNum}`
    };
    setData(prev => ({
      ...prev,
      staff: [...prev.staff, newStaff]
    }));
    showToast('Staff Added', `${newStaff.name} joined as ${newStaff.position}.`, 'success');
    return true;
  };

  const updateStaff = (id: string, staffData: Partial<Staff>): boolean => {
    setData(prev => ({
      ...prev,
      staff: prev.staff.map(s => (s.id === id ? { ...s, ...staffData } : s))
    }));
    showToast('Staff Profile Updated', 'Staff record modified.', 'success');
    return true;
  };

  const deleteStaff = (id: string): boolean => {
    setData(prev => ({
      ...prev,
      staff: prev.staff.filter(s => s.id !== id)
    }));
    showToast('Staff Deleted', 'Staff profile removed.', 'info');
    return true;
  };

  // HOUSEKEEPING
  const updateHousekeepingTask = (taskId: string, cleaningStatus: CleaningStatus, cleaningNotes?: string): boolean => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setData(prev => {
      const task = prev.housekeepingTasks.find(t => t.id === taskId);
      if (!task) return prev;

      // If room is marked 'Clean', automatically update room status to 'Available' IF it was 'Cleaning'
      const updatedRooms = prev.rooms.map(r => {
        if (r.id === task.roomId) {
          const newStatus = cleaningStatus === 'Clean' && r.status === 'Cleaning' ? 'Available' : r.status;
          return {
            ...r,
            cleaningStatus,
            status: newStatus,
            lastCleaned: cleaningStatus === 'Clean' ? nowStr : r.lastCleaned
          };
        }
        return r;
      });

      return {
        ...prev,
        rooms: updatedRooms,
        housekeepingTasks: prev.housekeepingTasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              cleaningStatus,
              cleaningNotes: cleaningNotes !== undefined ? cleaningNotes : t.cleaningNotes,
              lastCleaned: cleaningStatus === 'Clean' ? nowStr : t.lastCleaned,
              updatedAt: nowStr
            };
          }
          return t;
        })
      };
    });

    showToast('Housekeeping Updated', `Room cleaning status marked as ${cleaningStatus}.`, 'success');
    return true;
  };

  const assignHousekeepingStaff = (taskId: string, staffId: string): boolean => {
    const staffMember = data.staff.find(s => s.id === staffId);
    if (!staffMember) return false;

    setData(prev => ({
      ...prev,
      housekeepingTasks: prev.housekeepingTasks.map(t => (t.id === taskId ? { ...t, assignedStaffId: staffMember.id, assignedStaffName: staffMember.name } : t)),
      rooms: prev.rooms.map(r => {
        const task = prev.housekeepingTasks.find(t => t.id === taskId);
        if (task && r.id === task.roomId) {
          return { ...r, assignedStaffId: staffMember.id, assignedStaffName: staffMember.name };
        }
        return r;
      })
    }));

    showToast('Staff Assigned', `Assigned ${staffMember.name} to task.`, 'info');
    return true;
  };

  const createHousekeepingTask = (roomId: string, priority: 'Low' | 'Medium' | 'High' | 'Urgent' = 'Medium', notes?: string): boolean => {
    const room = data.rooms.find(r => r.id === roomId);
    if (!room) return false;

    const newTask: HousekeepingTask = {
      id: 'hk-' + Date.now(),
      roomId: room.id,
      roomNumber: room.roomNumber,
      currentStatus: room.status,
      cleaningStatus: 'Dirty',
      cleaningNotes: notes || 'Service request logged',
      priority,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setData(prev => ({
      ...prev,
      housekeepingTasks: [newTask, ...prev.housekeepingTasks]
    }));

    showToast('Cleaning Task Logged', `Task created for Room ${room.roomNumber}.`, 'info');
    return true;
  };

  // EXPENSES
  const addExpense = (expenseData: Omit<Expense, 'id' | 'expenseId'>): boolean => {
    const nextNum = String(data.expenses.length + 1).padStart(3, '0');
    const newExpense: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now(),
      expenseId: `EXP-2026-${nextNum}`
    };

    setData(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses]
    }));

    showToast('Expense Recorded', `${newExpense.category} expense of ${data.settings.currencySymbol || '$'}${newExpense.amount.toFixed(2)} logged.`, 'success');
    return true;
  };

  const updateExpense = (id: string, expenseData: Partial<Expense>): boolean => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => (e.id === id ? { ...e, ...expenseData } : e))
    }));
    showToast('Expense Updated', 'Expense record modified.', 'success');
    return true;
  };

  const deleteExpense = (id: string): boolean => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
    showToast('Expense Deleted', 'Expense item deleted.', 'info');
    return true;
  };

  // SETTINGS
  const updateSettings = (newSettings: Partial<HotelSettings>) => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings
      }
    }));
    showToast('Settings Saved', 'Hotel configuration updated successfully.', 'success');
  };

  // USERS & ROLES
  const setCurrentUser = (user: AppUser) => {
    setData(prev => ({
      ...prev,
      currentUser: user
    }));
    showToast('User Switched', `Active user: ${user.fullName} (${user.role})`, 'info');
  };

  const switchRole = (role: UserRole) => {
    const matchingUser = data.users.find(u => u.role === role) || {
      id: 'usr-temp-' + role.toLowerCase().replace(' ', '-'),
      username: role.toLowerCase().replace(' ', '.'),
      fullName: `${role} User`,
      role,
      email: `${role.toLowerCase().replace(' ', '.')}@grandvistahotel.com`,
      active: true,
      permissions: ['all']
    };

    setCurrentUser(matchingUser);
  };

  const addUser = (userData: Omit<AppUser, 'id'>): boolean => {
    const newUser: AppUser = {
      ...userData,
      id: 'usr-' + Date.now()
    };
    setData(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    showToast('User Created', `User account ${newUser.username} created.`, 'success');
    return true;
  };

  const updateUser = (id: string, userData: Partial<AppUser>): boolean => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => (u.id === id ? { ...u, ...userData } : u)),
      currentUser: prev.currentUser.id === id ? { ...prev.currentUser, ...userData } : prev.currentUser
    }));
    showToast('User Updated', 'User credentials and permissions updated.', 'success');
    return true;
  };

  const deleteUser = (id: string): boolean => {
    if (data.currentUser.id === id) {
      showToast('Action Forbidden', 'Cannot delete the currently active user.', 'error');
      return false;
    }
    setData(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id)
    }));
    showToast('User Deleted', 'User account removed.', 'info');
    return true;
  };

  // NOTIFICATIONS
  const markNotificationRead = (id: string) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    }));
  };

  const markAllNotificationsRead = () => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
    showToast('Notifications Cleared', 'All alerts marked as read.', 'info');
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif-' + Date.now(),
      timestamp: 'Just now',
      read: false
    };
    setData(prev => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications]
    }));
  };

  // BACKUP & RESTORE
  const exportDataAsJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AL_KAREEM_Hotel_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup Exported', 'Complete hotel database backup downloaded.', 'success');
  };

  const importDataFromJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.rooms || !parsed.bookings || !parsed.settings) {
        showToast('Invalid File', 'Backup file format is invalid or corrupted.', 'error');
        return false;
      }
      setData(parsed);
      localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(parsed));
      showToast('Database Restored', 'Hotel database successfully restored from backup.', 'success');
      return true;
    } catch (e) {
      showToast('Import Failed', 'Failed to parse JSON file.', 'error');
      return false;
    }
  };

  const resetToDefaultData = () => {
    setData(DEFAULT_HOTEL_STATE);
    localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(DEFAULT_HOTEL_STATE));
    showToast('Data Reset', 'Hotel system reset to pristine initial state.', 'info');
  };

  const clearAllOperationalData = () => {
    const cleanState: HotelDataState = {
      ...data,
      rooms: data.rooms.map(r => ({
        ...r,
        status: 'Available' as RoomStatus,
        cleaningStatus: 'Clean' as CleaningStatus,
        currentBookingId: undefined,
        currentGuestName: undefined,
        assignedStaffId: undefined,
        assignedStaffName: undefined,
        lastCleaned: new Date().toISOString().replace('T', ' ').substring(0, 16)
      })),
      guests: [],
      bookings: [],
      payments: [],
      restaurantOrders: [],
      housekeepingTasks: [],
      expenses: [],
      notifications: []
    };
    setData(cleanState);
    localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(cleanState));
    showToast('Data Cleared', 'All bookings, guests, orders, and expenses removed successfully.', 'success');
  };

  // METRICS COMPUTATION
  const metrics = useMemo(() => {
    const totalRooms = data.rooms.length;
    const availableRooms = data.rooms.filter(r => r.status === 'Available').length;
    const occupiedRooms = data.rooms.filter(r => r.status === 'Occupied').length;
    const reservedRooms = data.rooms.filter(r => r.status === 'Reserved').length;
    const cleaningRooms = data.rooms.filter(r => r.status === 'Cleaning').length;
    const maintenanceRooms = data.rooms.filter(r => r.status === 'Maintenance' || r.status === 'Out of Service').length;

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const todayStr = new Date().toISOString().split('T')[0];

    const todaysCheckInsCount = data.bookings.filter(b => b.checkInDate === todayStr && b.status !== 'Cancelled').length;
    const todaysCheckOutsCount = data.bookings.filter(b => b.checkOutDate === todayStr && b.status === 'Checked-in').length;

    // Today's revenue from payments made today
    const todaysRevenue = data.payments
      .filter(p => p.date.startsWith(todayStr))
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRevenue = data.payments.reduce((sum, p) => sum + p.amount, 0);

    const pendingPaymentsTotal = data.bookings
      .filter(b => b.status === 'Checked-in' || b.status === 'Confirmed')
      .reduce((sum, b) => sum + Math.max(0, b.pendingAmount), 0);

    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      reservedRooms,
      cleaningRooms,
      maintenanceRooms,
      occupancyRate,
      todaysCheckInsCount,
      todaysCheckOutsCount,
      todaysRevenue,
      totalRevenue,
      pendingPaymentsTotal,
      totalExpenses,
      netProfit
    };
  }, [data]);

  return (
    <HotelContext.Provider
      value={{
        data,
        activeTab,
        setActiveTab,
        toasts,
        showToast,
        removeToast,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        selectedInvoiceBookingId,
        setSelectedInvoiceBookingId,
        selectedReceiptId,
        setSelectedReceiptId,
        theme,
        toggleTheme,
        firebaseSyncStatus,
        lastSyncedAt,
        forceSyncToFirebase,
        addRoom,
        updateRoom,
        deleteRoom,
        setRoomStatus,
        addRoomType,
        updateRoomType,
        deleteRoomType,
        addGuest,
        updateGuest,
        deleteGuest,
        checkRoomAvailability,
        createBooking,
        updateBooking,
        cancelBooking,
        checkInGuest,
        checkOutGuest,
        addPayment,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        createRestaurantOrder,
        updateRestaurantOrderStatus,
        addExtraService,
        updateExtraService,
        deleteExtraService,
        chargeServiceToBooking,
        addStaff,
        updateStaff,
        deleteStaff,
        updateHousekeepingTask,
        assignHousekeepingStaff,
        createHousekeepingTask,
        addExpense,
        updateExpense,
        deleteExpense,
        updateSettings,
        setCurrentUser,
        switchRole,
        addUser,
        updateUser,
        deleteUser,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        exportDataAsJSON,
        importDataFromJSON,
        resetToDefaultData,
        clearAllOperationalData,
        metrics
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = (): HotelContextType => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
