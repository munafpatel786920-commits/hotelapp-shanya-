export type RoomStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Maintenance' | 'Out of Service';

export type CleaningStatus = 'Clean' | 'Dirty' | 'In Progress' | 'Inspected';

export type BookingStatus = 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled' | 'No-show';

export type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Bank Transfer' | 'Net Banking' | 'Other';

export type PaymentType = 'Advance' | 'Check-in' | 'Check-out' | 'Room Service' | 'Extra Service' | 'Settlement';

export type UserRole = 'Admin' | 'Manager' | 'Receptionist' | 'Accountant' | 'Housekeeping' | 'Restaurant Staff';

export type IdProofType = 'Aadhaar' | 'PAN Card' | 'Passport' | 'Driving License' | 'Voter ID' | 'National ID' | 'Other';

export type BedType = 'Single' | 'Double' | 'Queen' | 'King' | 'Twin' | 'Bunk Bed';

export type ServiceCategory = 'Laundry' | 'Room Service' | 'Transport' | 'Spa' | 'Extra Bed' | 'Breakfast' | 'Other';

export type ExpenseCategory = 'Electricity' | 'Water' | 'Salary' | 'Maintenance' | 'Food' | 'Cleaning' | 'Internet' | 'Supplies' | 'Other';

export type StaffDepartment = 'Reception' | 'Housekeeping' | 'Restaurant' | 'Manager' | 'Security' | 'Accounts' | 'Other';

export type StaffStatus = 'Active' | 'On Leave' | 'Inactive';

export type FoodCategory = 'Breakfast' | 'Appetizer' | 'Main Course' | 'Beverages' | 'Desserts' | 'Snacks';

export type OrderStatus = 'Pending' | 'Preparing' | 'Delivered' | 'Cancelled';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface RoomType {
  id: string;
  name: string;
  code: string;
  basePrice: number;
  capacity: number;
  bedType: BedType;
  amenities: string[];
  description: string;
  imageUrl?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName?: string;
  floor: number;
  bedType: BedType;
  capacity: number;
  price: number;
  status: RoomStatus;
  cleaningStatus: CleaningStatus;
  amenities: string[];
  description: string;
  currentBookingId?: string;
  currentGuestName?: string;
  lastCleaned?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  imageUrl?: string;
}

export interface Guest {
  id: string;
  guestId: string; // e.g., GST-1001
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  gstin?: string;
  companyName?: string;
  panNumber?: string;
  idProofType: IdProofType;
  idProofNumber: string;
  dob?: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  notes?: string;
  createdAt: string;
}

export interface ServiceChargeItem {
  id: string;
  bookingId: string;
  serviceId?: string;
  serviceName: string;
  category: ServiceCategory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
  notes?: string;
}

export interface Booking {
  id: string;
  bookingId: string; // e.g., BKG-2026-001
  guestId: string;
  guestName: string;
  mobile: string;
  email: string;
  roomId: string;
  roomNumber: string;
  roomTypeName: string;
  checkInDate: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm
  checkOutDate: string; // YYYY-MM-DD
  checkOutTime: string; // HH:mm
  adults: number;
  children: number;
  nights: number;
  roomRate: number; // rate per night
  roomCharges: number; // roomRate * nights
  extraCharges: number; // sum of extra services + room service charges
  discount: number;
  tax: number; // calculated based on hotel settings tax %
  grandTotal: number;
  advancePayment: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  specialRequests?: string;
  serviceCharges: ServiceChargeItem[];
  restaurantOrderIds: string[];
  idProofType?: IdProofType;
  idProofNumber?: string;
  createdAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string; // e.g., REC-2026-001
  bookingId: string;
  guestName: string;
  roomNumber: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  transactionRef?: string;
  notes?: string;
  createdByName?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  price: number;
  description: string;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  imageUrl?: string;
}

export interface OrderItem {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface RestaurantOrder {
  id: string;
  orderNumber: string; // e.g., ORD-2026-001
  orderType: 'Room Service' | 'Dine-In Table';
  roomNumber?: string;
  tableNumber?: string;
  guestName: string;
  bookingId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  billedToRoom: boolean;
  paymentStatus: 'Paid' | 'Added to Room Bill' | 'Unpaid';
  createdAt: string;
}

export interface ExtraService {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  unit: string; // per day, per piece, per person, per session
  description: string;
  isAvailable: boolean;
}

export interface Staff {
  id: string;
  staffId: string; // e.g., STF-101
  name: string;
  mobile: string;
  email: string;
  address: string;
  position: string;
  department: StaffDepartment;
  joiningDate: string;
  salary: number;
  status: StaffStatus;
  shift: 'Morning (06:00 - 14:00)' | 'Evening (14:00 - 22:00)' | 'Night (22:00 - 06:00)' | 'General (09:00 - 18:00)';
}

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  roomId: string;
  currentStatus: RoomStatus;
  cleaningStatus: CleaningStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  lastCleaned?: string;
  cleaningNotes?: string;
  priority: TaskPriority;
  updatedAt: string;
}

export interface Expense {
  id: string;
  expenseId: string; // e.g., EXP-2026-001
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  vendor?: string;
  receiptNumber?: string;
  addedBy?: string;
}

export interface HotelSettings {
  hotelName: string;
  tagline: string;
  logoUrl: string;
  signatureUrl?: string;
  signatoryTitle?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  mobile: string;
  email: string;
  website: string;
  gstNumber: string;
  panNumber?: string;
  fssaiNumber?: string;
  taxPercentage: number;
  currency: string;
  currencySymbol: string;
  checkInTime: string;
  checkOutTime: string;
  invoicePrefix: string;
  receiptPrefix: string;
  termsAndConditions: string;
}

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  avatar?: string;
  active: boolean;
  permissions: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface HotelDataState {
  rooms: Room[];
  roomTypes: RoomType[];
  guests: Guest[];
  bookings: Booking[];
  payments: PaymentRecord[];
  foodItems: FoodItem[];
  restaurantOrders: RestaurantOrder[];
  extraServices: ExtraService[];
  staff: Staff[];
  housekeepingTasks: HousekeepingTask[];
  expenses: Expense[];
  settings: HotelSettings;
  users: AppUser[];
  currentUser: AppUser;
  notifications: NotificationItem[];
}
