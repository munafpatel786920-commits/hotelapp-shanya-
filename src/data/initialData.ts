import { HotelDataState, RoomType, Room, Guest, Booking, PaymentRecord, FoodItem, RestaurantOrder, ExtraService, Staff, HousekeepingTask, Expense, HotelSettings, AppUser, NotificationItem } from '../types/hotel';
import alkareemLogo from '../assets/images/alkareem_logo_1787401865233.jpg';
import samanthaSignature from '../assets/images/authorized_signature_1787403428393.jpg';

export const INITIAL_ROOM_TYPES: RoomType[] = [
  {
    id: 'rt-deluxe',
    name: 'Deluxe Room',
    code: 'DLX',
    basePrice: 2800,
    capacity: 2,
    bedType: 'Queen',
    amenities: ['Free High-Speed Wi-Fi', 'Air Conditioning', 'Flat-screen Smart TV', 'Electric Kettle & Tea Kit', 'Work Desk', 'Ensuite Bathroom with Geyser', 'Mineral Water Bottles'],
    description: 'Elegantly furnished deluxe room with premium cotton linens, city views, and modern comforts.',
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rt-super-deluxe',
    name: 'Super Deluxe Room',
    code: 'SDLX',
    basePrice: 4200,
    capacity: 2,
    bedType: 'King',
    amenities: ['Free High-Speed Wi-Fi', 'Split AC', '43-inch Smart TV', 'Mini Refrigerator', 'Balcony View', 'Luxury Ayurvedic Toiletries', 'Tea/Coffee Maker', 'Digital Safe Locker'],
    description: 'Spacious super deluxe bedroom with private balcony, plush king bed, and ambient decor.',
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rt-suite',
    name: 'Executive Suite',
    code: 'EXEC',
    basePrice: 6800,
    capacity: 3,
    bedType: 'King',
    amenities: ['Separate Living Lounge & Sofa', 'Jacuzzi Bathtub', 'High-Speed Wi-Fi', 'Complimentary Buffet Breakfast', 'Express Check-in', '55-inch 4K TV', 'Espresso Coffee Machine', 'Iron & Ironing Board'],
    description: 'Palatial suite featuring a dedicated guest living lounge, luxury marble bath with tub, and executive privileges.',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rt-presidential',
    name: 'Royal Presidential Suite',
    code: 'PRS',
    basePrice: 12500,
    capacity: 4,
    bedType: 'King',
    amenities: ['Panoramic Sea/City View', 'Private Dining Area', '24/7 Butler Service', 'Jacuzzi & Rain Shower', 'Complimentary High Tea', 'Airport Cab Transfer Included', 'Dual Restrooms', 'Curated Art Collection'],
    description: 'The pinnacle of royal luxury with private dining room, panoramic views, whirlpool spa bath, and personalized concierge.',
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rt-family',
    name: 'Family Grand Suite',
    code: 'FAM',
    basePrice: 5600,
    capacity: 4,
    bedType: 'Double',
    amenities: ['2 Large Double Beds', 'Spacious Seating Area', 'Dual Washrooms', 'Kids TV Channels', 'Mini Bar & Snacks', 'Free Breakfast for Children', 'Electric Kettle & Milk Warmer'],
    description: 'Designed specifically for Indian families traveling with children, offering interconnecting spaces and double washrooms.',
    imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80'
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-101',
    roomNumber: '101',
    roomTypeId: 'rt-deluxe',
    roomTypeName: 'Deluxe Room',
    floor: 1,
    bedType: 'Queen',
    capacity: 2,
    price: 2800,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['Wi-Fi', 'AC', 'TV', 'Tea Kit', 'Geyser'],
    description: 'Ground floor deluxe room with quick access to the reception and dining hall.',
    lastCleaned: '2026-08-22 08:00'
  },
  {
    id: 'room-102',
    roomNumber: '102',
    roomTypeId: 'rt-deluxe',
    roomTypeName: 'Deluxe Room',
    floor: 1,
    bedType: 'Queen',
    capacity: 2,
    price: 2800,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['Wi-Fi', 'AC', 'TV', 'Tea Kit', 'Geyser'],
    description: 'Quiet deluxe room overlooking the internal garden courtyard.',
    lastCleaned: '2026-08-22 08:00'
  },
  {
    id: 'room-103',
    roomNumber: '103',
    roomTypeId: 'rt-super-deluxe',
    roomTypeName: 'Super Deluxe Room',
    floor: 1,
    bedType: 'King',
    capacity: 2,
    price: 4200,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['Wi-Fi', 'AC', 'Smart TV', 'Balcony', 'Mini Fridge'],
    description: 'Super deluxe room with east-facing sun balcony.',
    lastCleaned: '2026-08-22 08:00'
  },
  {
    id: 'room-104',
    roomNumber: '104',
    roomTypeId: 'rt-super-deluxe',
    roomTypeName: 'Super Deluxe Room',
    floor: 1,
    bedType: 'King',
    capacity: 2,
    price: 4200,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['Wi-Fi', 'AC', 'Smart TV', 'Balcony', 'Mini Fridge'],
    description: 'Super deluxe room near garden lawn.',
    lastCleaned: '2026-08-22 08:00'
  },
  {
    id: 'room-201',
    roomNumber: '201',
    roomTypeId: 'rt-super-deluxe',
    roomTypeName: 'Super Deluxe Room',
    floor: 2,
    bedType: 'King',
    capacity: 2,
    price: 4200,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['Wi-Fi', 'AC', 'Balcony', 'Mini Bar', 'Ayurvedic Bath Kit'],
    description: 'Second-floor super deluxe room with private balcony.',
    lastCleaned: '2026-08-22 08:00'
  },
  {
    id: 'room-202',
    roomNumber: '202',
    roomTypeId: 'rt-super-deluxe',
    roomTypeName: 'Super Deluxe Room',
    floor: 2,
    bedType: 'King',
    capacity: 2,
    price: 4200,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['Wi-Fi', 'AC', 'Balcony', 'Mini Bar', 'Bathtub'],
    description: 'Spacious second floor super deluxe room.',
    lastCleaned: '2026-08-22 08:00'
  },
  {
    id: 'room-203',
    roomNumber: '203',
    roomTypeId: 'rt-suite',
    roomTypeName: 'Executive Suite',
    floor: 2,
    bedType: 'King',
    capacity: 3,
    price: 6800,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['Lounge', 'Jacuzzi', 'Free Breakfast', 'Smart 4K TV'],
    description: 'Second floor executive suite with city skyline views.',
    lastCleaned: '2026-08-22 08:00'
  },
  {
    id: 'room-204',
    roomNumber: '204',
    roomTypeId: 'rt-family',
    roomTypeName: 'Family Grand Suite',
    floor: 2,
    bedType: 'Double',
    capacity: 4,
    price: 5600,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['2 Double Beds', 'Dual Bathrooms', 'Lounge', 'Kids Amenities'],
    description: 'Family grand suite with separate kids room & dual washrooms.',
    lastCleaned: '2026-08-22 08:00'
  },
  {
    id: 'room-301',
    roomNumber: '301',
    roomTypeId: 'rt-presidential',
    roomTypeName: 'Royal Presidential Suite',
    floor: 3,
    bedType: 'King',
    capacity: 4,
    price: 12500,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['Sea View', 'Private Lounge', 'Jacuzzi', 'Butler On Call', 'Airport Cab'],
    description: 'Signature presidential suite on top floor with sea view.',
    lastCleaned: '2026-08-22 08:00'
  },
  {
    id: 'room-302',
    roomNumber: '302',
    roomTypeId: 'rt-presidential',
    roomTypeName: 'Royal Presidential Suite',
    floor: 3,
    bedType: 'King',
    capacity: 4,
    price: 12500,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['Sea View', 'Private Lounge', 'Jacuzzi', 'Butler On Call'],
    description: 'Pristine top floor suite ready for high-profile executive check-in.',
    lastCleaned: '2026-08-22 08:00'
  },
  {
    id: 'room-303',
    roomNumber: '303',
    roomTypeId: 'rt-suite',
    roomTypeName: 'Executive Suite',
    floor: 3,
    bedType: 'King',
    capacity: 3,
    price: 6800,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['Lounge', 'Jacuzzi', 'AC', 'Smart TV'],
    description: 'Third floor executive suite with panoramic city views.',
    lastCleaned: '2026-08-22 08:00'
  },
  {
    id: 'room-304',
    roomNumber: '304',
    roomTypeId: 'rt-deluxe',
    roomTypeName: 'Deluxe Room',
    floor: 3,
    bedType: 'Queen',
    capacity: 2,
    price: 2800,
    status: 'Available',
    cleaningStatus: 'Clean',
    amenities: ['Wi-Fi', 'AC', 'TV', 'Tea Kit', 'City View'],
    description: 'Bright deluxe room on the 3rd floor with corner views.',
    lastCleaned: '2026-08-22 08:00'
  }
];

export const INITIAL_GUESTS: Guest[] = [];

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_PAYMENTS: PaymentRecord[] = [];

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Masala Dosa with Sambar & Chutneys',
    category: 'Breakfast',
    price: 180,
    description: 'Crispy fermented rice-lentil crepe filled with spiced potato masala, served with piping hot sambar & fresh coconut chutneys.',
    isAvailable: true,
    preparationTimeMinutes: 15,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'food-2',
    name: 'Steamed Idli & Medu Vada Platter',
    category: 'Breakfast',
    price: 160,
    description: 'Tender steamed rice cakes and crisp lentil donuts served with home-style drumstick sambar and tomato-onion chutney.',
    isAvailable: true,
    preparationTimeMinutes: 12
  },
  {
    id: 'food-3',
    name: 'Amritsari Aloo & Paneer Paratha',
    category: 'Breakfast',
    price: 190,
    description: 'Two stuffed whole wheat flatbreads served with fresh churned white butter, mango pickle, and chilled spiced curd.',
    isAvailable: true,
    preparationTimeMinutes: 15
  },
  {
    id: 'food-4',
    name: 'Paneer Butter Masala Handi',
    category: 'Main Course',
    price: 340,
    description: 'Soft cottage cheese cubes simmered in a velvety rich tomato, cashew nut, and butter gravy flavored with dried fenugreek.',
    isAvailable: true,
    preparationTimeMinutes: 20
  },
  {
    id: 'food-5',
    name: 'Royal Butter Chicken (Murgh Makhani)',
    category: 'Main Course',
    price: 440,
    description: 'Tender tandoor-roasted chicken pieces cooked in a luscious butter-tomato-cream gravy seasoned with traditional spices.',
    isAvailable: true,
    preparationTimeMinutes: 20
  },
  {
    id: 'food-6',
    name: 'Dal Makhani Bukhara Style',
    category: 'Main Course',
    price: 290,
    description: 'Slow-cooked black lentils and kidney beans simmered overnight on slow charcoal with rich dairy butter and cream.',
    isAvailable: true,
    preparationTimeMinutes: 15
  },
  {
    id: 'food-7',
    name: 'Hyderabadi Dum Biryani (Veg / Chicken)',
    category: 'Main Course',
    price: 390,
    description: 'Fragrant long-grain basmati rice layered with marinated delicacies, saffron, fried onions, and served with cucumber burani raita.',
    isAvailable: true,
    preparationTimeMinutes: 25
  },
  {
    id: 'food-8',
    name: 'Tandoori Roti & Garlic Butter Naan Basket',
    category: 'Main Course',
    price: 140,
    description: 'Assorted basket of 2 whole wheat tandoori rotis and 2 clay-oven baked garlic butter naans.',
    isAvailable: true,
    preparationTimeMinutes: 10
  },
  {
    id: 'food-9',
    name: 'Classic Club Sandwich & Crispy Fries',
    category: 'Snacks',
    price: 240,
    description: 'Triple-decker toasted sandwich with cheese, tomatoes, crisp lettuce, cucumber, served with seasoned fries and dip.',
    isAvailable: true,
    preparationTimeMinutes: 15
  },
  {
    id: 'food-10',
    name: 'Paneer Tikka / Chicken Malai Tikka',
    category: 'Appetizer',
    price: 360,
    description: 'Charcoal-grilled skewers marinated in spiced yogurt, cream, cardamom, served with mint chutney and onion salad.',
    isAvailable: true,
    preparationTimeMinutes: 20
  },
  {
    id: 'food-11',
    name: 'Kolkata Style Gulab Jamun with Rabdi',
    category: 'Desserts',
    price: 160,
    description: 'Warm golden milk dumplings soaked in cardamom sugar syrup, topped with rich saffron rabdi and sliced pistachios.',
    isAvailable: true,
    preparationTimeMinutes: 5
  },
  {
    id: 'food-12',
    name: 'Kesar Pista Kulfi Falooda',
    category: 'Desserts',
    price: 180,
    description: 'Traditional slow-churned saffron and pistachio ice cream garnished with rose syrup, basil seeds, and chilled vermicelli.',
    isAvailable: true,
    preparationTimeMinutes: 5
  },
  {
    id: 'food-13',
    name: 'Masala Chai Kettle (Serves 2)',
    category: 'Beverages',
    price: 120,
    description: 'Freshly brewed Assam tea with crushed ginger, green cardamom, cloves, and whole dairy milk.',
    isAvailable: true,
    preparationTimeMinutes: 10
  },
  {
    id: 'food-14',
    name: 'Alphonso Mango Lassi / Sweet Lassi',
    category: 'Beverages',
    price: 140,
    description: 'Thick, creamy yogurt shake churned with Ratnagiri Alphonso mango pulp and cardamom.',
    isAvailable: true,
    preparationTimeMinutes: 5
  }
];

export const INITIAL_RESTAURANT_ORDERS: RestaurantOrder[] = [];

export const INITIAL_EXTRA_SERVICES: ExtraService[] = [
  {
    id: 'srv-1',
    name: 'Airport Transfer (AC Sedan Cab)',
    category: 'Transport',
    price: 1500,
    unit: 'per trip',
    description: 'Chauffeured air-conditioned sedan pick-up or drop to Airport/Railway station with luggage assistance.',
    isAvailable: true
  },
  {
    id: 'srv-2',
    name: 'Express Laundry & Steam Pressing',
    category: 'Laundry',
    price: 350,
    unit: 'per set (3 pcs)',
    description: 'Same-day rapid turnaround laundry, dry cleaning, and professional steam press delivered to suite.',
    isAvailable: true
  },
  {
    id: 'srv-3',
    name: 'Ayurvedic Spa & Body Rejuvenation',
    category: 'Spa',
    price: 2500,
    unit: 'per 60-min session',
    description: 'Therapeutic herbal oil Abhyanga massage by certified Ayurvedic practitioners.',
    isAvailable: true
  },
  {
    id: 'srv-4',
    name: 'Extra Luxury Mattress, Pillow & Quilt',
    category: 'Extra Bed',
    price: 800,
    unit: 'per night',
    description: 'High-density orthopedic rollaway mattress with fresh linens, pillows, and warm duvet for extra occupant.',
    isAvailable: true
  },
  {
    id: 'srv-5',
    name: 'City Sightseeing Tour (Full Day AC Cab)',
    category: 'Transport',
    price: 3500,
    unit: 'per day (8 hours)',
    description: 'Private AC chauffeur service covering major heritage sights and popular tourist landmarks.',
    isAvailable: true
  },
  {
    id: 'srv-6',
    name: 'Multi-Cuisine Buffet Breakfast Spread',
    category: 'Breakfast',
    price: 450,
    unit: 'per person / day',
    description: 'Unlimited breakfast spread featuring Indian and continental delicacies with fresh juices.',
    isAvailable: true
  }
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'stf-01',
    staffId: 'STF-101',
    name: 'S PATEL',
    mobile: '+91 98201 11223',
    email: 's.patel@alkareem.in',
    address: 'Flat 12, Nariman Point, Mumbai',
    position: 'General Manager',
    department: 'Manager',
    joiningDate: '2024-01-10',
    salary: 85000,
    status: 'Active',
    shift: 'General (09:00 - 18:00)'
  },
  {
    id: 'stf-02',
    staffId: 'STF-102',
    name: 'Sunita Deshmukh',
    mobile: '+91 98702 33445',
    email: 'sunita.d@alkareem.in',
    address: 'B-201, Andheri East, Mumbai',
    position: 'Front Desk Executive',
    department: 'Reception',
    joiningDate: '2024-04-15',
    salary: 38000,
    status: 'Active',
    shift: 'Morning (06:00 - 14:00)'
  },
  {
    id: 'stf-03',
    staffId: 'STF-103',
    name: 'Chef Manoj Verma',
    mobile: '+91 98190 44556',
    email: 'chef.manoj@alkareem.in',
    address: '402, Bandra West, Mumbai',
    position: 'Head Chef',
    department: 'Restaurant',
    joiningDate: '2024-08-01',
    salary: 62000,
    status: 'Active',
    shift: 'Evening (14:00 - 22:00)'
  },
  {
    id: 'stf-04',
    staffId: 'STF-104',
    name: 'Ramesh Kumar',
    mobile: '+91 99201 55667',
    email: 'ramesh.k@alkareem.in',
    address: 'Kurla West, Mumbai',
    position: 'Housekeeping Supervisor',
    department: 'Housekeeping',
    joiningDate: '2024-02-01',
    salary: 28000,
    status: 'Active',
    shift: 'Morning (06:00 - 14:00)'
  },
  {
    id: 'stf-05',
    staffId: 'STF-105',
    name: 'Vikas Yadav',
    mobile: '+91 98690 66778',
    email: 'vikas.y@alkareem.in',
    address: 'Dadar Central, Mumbai',
    position: 'Security Officer',
    department: 'Security',
    joiningDate: '2024-06-10',
    salary: 26000,
    status: 'Active',
    shift: 'Night (22:00 - 06:00)'
  },
  {
    id: 'stf-06',
    staffId: 'STF-106',
    name: 'Pooja Patel',
    mobile: '+91 98330 77889',
    email: 'pooja.patel@alkareem.in',
    address: 'C-501, Borivali, Mumbai',
    position: 'Accounts Officer',
    department: 'Accounts',
    joiningDate: '2024-09-01',
    salary: 42000,
    status: 'Active',
    shift: 'General (09:00 - 18:00)'
  }
];

export const INITIAL_HOUSEKEEPING: HousekeepingTask[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_SETTINGS: HotelSettings = {
  hotelName: 'AL-KAREEM',
  tagline: 'Luxury Indian Hospitality & Comfort',
  logoUrl: alkareemLogo,
  signatureUrl: samanthaSignature,
  signatoryTitle: 'S PATEL (General Manager)',
  address: 'Plot No. 45, Marine Lines, Nariman Point',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  zipCode: '400021',
  mobile: '+91 (022) 6789-4000 / +91 98201 12345',
  email: 'stay@alkareemhotel.in',
  website: 'https://alkareemhotel.in',
  gstNumber: '27AABCG1234F1ZN',
  panNumber: 'AABCG1234F',
  fssaiNumber: '11521019000452',
  taxPercentage: 12.0,
  currency: 'INR',
  currencySymbol: '₹',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  invoicePrefix: 'INV-2026-',
  receiptPrefix: 'REC-2026-',
  termsAndConditions: '1. As per Govt of India & Police regulations, all adult guests must present original photo ID (Aadhaar / Passport / Driving License / Voter ID) at check-in. PAN Card is not valid proof of residence. 2. Standard Check-in is 14:00 IST and Check-out is 11:00 IST. 3. GST Tax Invoice issued under SAC Code 996311 (Accommodation) and SAC 996331 (Restaurant).'
};

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-1',
    username: 'admin',
    fullName: 'S PATEL (General Manager)',
    role: 'Admin',
    email: 's.patel@alkareem.in',
    active: true,
    permissions: ['all']
  },
  {
    id: 'usr-2',
    username: 'sunita.reception',
    fullName: 'Sunita Deshmukh',
    role: 'Receptionist',
    email: 'sunita.d@alkareem.in',
    active: true,
    permissions: ['rooms:view', 'rooms:edit', 'bookings:all', 'checkin:all', 'checkout:all', 'guests:all', 'billing:all']
  },
  {
    id: 'usr-3',
    username: 'pooja.accounts',
    fullName: 'Pooja Patel',
    role: 'Accountant',
    email: 'pooja.patel@alkareem.in',
    active: true,
    permissions: ['billing:all', 'expenses:all', 'reports:all', 'dashboard:view']
  },
  {
    id: 'usr-4',
    username: 'ramesh.hk',
    fullName: 'Ramesh Kumar',
    role: 'Housekeeping',
    email: 'ramesh.k@alkareem.in',
    active: true,
    permissions: ['housekeeping:all', 'rooms:view', 'rooms:status']
  },
  {
    id: 'usr-5',
    username: 'chef.manoj',
    fullName: 'Chef Manoj Verma',
    role: 'Restaurant Staff',
    email: 'chef.manoj@alkareem.in',
    active: true,
    permissions: ['restaurant:all', 'rooms:view']
  },
  {
    id: 'usr-6',
    username: 'vikas.security',
    fullName: 'Vikas Yadav',
    role: 'Manager',
    email: 'vikas.y@alkareem.in',
    active: true,
    permissions: ['dashboard:view', 'rooms:all', 'bookings:all', 'staff:all', 'reports:all', 'expenses:all']
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const DEFAULT_HOTEL_STATE: HotelDataState = {
  rooms: INITIAL_ROOMS,
  roomTypes: INITIAL_ROOM_TYPES,
  guests: INITIAL_GUESTS,
  bookings: INITIAL_BOOKINGS,
  payments: INITIAL_PAYMENTS,
  foodItems: INITIAL_FOOD_ITEMS,
  restaurantOrders: INITIAL_RESTAURANT_ORDERS,
  extraServices: INITIAL_EXTRA_SERVICES,
  staff: INITIAL_STAFF,
  housekeepingTasks: INITIAL_HOUSEKEEPING,
  expenses: INITIAL_EXPENSES,
  settings: INITIAL_SETTINGS,
  users: INITIAL_USERS,
  currentUser: INITIAL_USERS[0],
  notifications: INITIAL_NOTIFICATIONS
};
