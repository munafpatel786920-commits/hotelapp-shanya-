import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { FoodItem, RestaurantOrder, FoodCategory, OrderStatus, PaymentMethod } from '../../types/hotel';
import { StatusBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  UtensilsCrossed,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  CheckCircle,
  Clock,
  Printer,
  X,
  Coffee,
  Pizza,
  Wine,
  IceCream,
  BedDouble,
  DollarSign,
  ChefHat
} from 'lucide-react';
import { formatINR } from '../../utils/indiaUtils';

export const RestaurantPOS: React.FC = () => {
  const {
    data,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    createRestaurantOrder,
    updateRestaurantOrderStatus,
    addPayment
  } = useHotel();

  const currency = data.settings.currencySymbol || '$';

  // Sub-tabs: 'pos' | 'orders' | 'menu'
  const [activeTab, setActiveTab] = useState<'pos' | 'orders' | 'menu'>('pos');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchMenuQuery, setSearchMenuQuery] = useState('');

  // POS Cart State
  const [cart, setCart] = useState<{ item: FoodItem; quantity: number }[]>([]);
  const [orderType, setOrderType] = useState<'Room Service' | 'Dine-In Table'>('Room Service');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('Table 4');
  const [paymentOption, setPaymentOption] = useState<'Charge to Room' | 'Pay Now'>('Charge to Room');

  // Menu item modal
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingFoodItem, setEditingFoodItem] = useState<FoodItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FoodItem | null>(null);
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    category: 'Main Course' as FoodCategory,
    price: 15,
    isAvailable: true,
    description: '',
    preparationTimeMinutes: 20
  });

  const categories: FoodCategory[] = ['Breakfast', 'Appetizer', 'Main Course', 'Beverages', 'Desserts', 'Snacks'];

  // In-house guests for room delivery select
  const checkedInBookings = data.bookings.filter(b => b.status === 'Checked-in');

  const filteredMenuItems = useMemo(() => {
    return data.foodItems.filter(item => {
      const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchSearch =
        item.name.toLowerCase().includes(searchMenuQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchMenuQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [data.foodItems, categoryFilter, searchMenuQuery]);

  // Cart operations
  const addToCart = (item: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.item.id !== itemId));
    } else {
      setCart(prev => prev.map(c => (c.item.id === itemId ? { ...c, quantity: qty } : c)));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const cartTax = (cartSubtotal * 5) / 100; // 5% F&B tax
  const cartTotal = cartSubtotal + cartTax;

  const handleBookingSelect = (bId: string) => {
    setSelectedBookingId(bId);
    const b = data.bookings.find(item => item.id === bId);
    if (b) {
      setRoomNumber(b.roomNumber);
      setGuestName(b.guestName);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const items = cart.map(c => ({
      foodItemId: c.item.id,
      name: c.item.name,
      price: c.item.price,
      quantity: c.quantity
    }));

    const isChargeToRoom = orderType === 'Room Service' && paymentOption === 'Charge to Room' && Boolean(selectedBookingId);

    const newOrder = createRestaurantOrder({
      orderType,
      roomNumber: orderType === 'Room Service' ? roomNumber : undefined,
      tableNumber: orderType === 'Dine-In Table' ? tableNumber : undefined,
      guestName: guestName || (orderType === 'Dine-In Table' ? `Dine-in (${tableNumber})` : 'Walk-In Customer'),
      bookingId: isChargeToRoom ? selectedBookingId : undefined,
      items,
      chargeToRoom: isChargeToRoom,
      paymentMethod: isChargeToRoom ? undefined : 'Card'
    });

    clearCart();
    setActiveTab('orders');
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuFormData.name.trim()) return;

    if (editingFoodItem) {
      updateFoodItem(editingFoodItem.id, menuFormData);
    } else {
      addFoodItem(menuFormData);
    }

    setIsMenuModalOpen(false);
  };

  const openAddMenuModal = () => {
    setEditingFoodItem(null);
    setMenuFormData({
      name: '',
      category: 'Main Course',
      price: 15,
      isAvailable: true,
      description: '',
      preparationTimeMinutes: 20
    });
    setIsMenuModalOpen(true);
  };

  const openEditMenuModal = (item: FoodItem) => {
    setEditingFoodItem(item);
    setMenuFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      isAvailable: item.isAvailable,
      description: item.description || '',
      preparationTimeMinutes: item.preparationTimeMinutes || 20
    });
    setIsMenuModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
              F&B Operations
            </span>
            <span className="text-xs text-slate-500">Kitchen & Room Service</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Restaurant & Room Service POS</h1>
          <p className="text-xs text-slate-500">Order taking, kitchen tickets (KOT), room charge integrations and menu management.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'pos'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Point of Sale
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Kitchen Orders ({data.restaurantOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'menu'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Menu Catalog
          </button>
        </div>
      </div>

      {/* VIEW 1: POS Screen */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Menu Catalog Grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                  categoryFilter === 'ALL'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Items
              </button>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                    categoryFilter === c
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Menu Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchMenuQuery}
                onChange={e => setSearchMenuQuery(e.target.value)}
                placeholder="Search dishes, cocktails, desserts..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {filteredMenuItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => item.isAvailable && addToCart(item)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    item.isAvailable
                      ? 'bg-white border-slate-200 hover:border-indigo-300 cursor-pointer hover:shadow-md shadow-sm'
                      : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                        {item.category}
                      </span>
                      {!item.isAvailable && (
                        <span className="text-[10px] text-rose-500 font-bold">Sold Out</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{item.name}</h4>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      {formatINR(item.price)}
                    </span>
                    <button
                      type="button"
                      disabled={!item.isAvailable}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Order Cart & Billing Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Current Order Ticket</h3>
                </div>
                {cart.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-rose-600 hover:text-rose-700 font-semibold">
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Order Options */}
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Order Destination</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    {(['Room Service', 'Dine-In Table'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setOrderType(type)}
                        className={`py-1.5 text-center text-[11px] font-semibold rounded-lg transition-colors ${
                          orderType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {orderType === 'Room Service' ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Select In-House Room</label>
                      <select
                        value={selectedBookingId}
                        onChange={e => handleBookingSelect(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Choose In-House Guest --</option>
                        {checkedInBookings.map(b => (
                          <option key={b.id} value={b.id}>
                            Room #{b.roomNumber} - {b.guestName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="posPayment"
                          checked={paymentOption === 'Charge to Room'}
                          onChange={() => setPaymentOption('Charge to Room')}
                          className="accent-indigo-600"
                        />
                        <span>Charge to Room Folio</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer ml-3">
                        <input
                          type="radio"
                          name="posPayment"
                          checked={paymentOption === 'Pay Now'}
                          onChange={() => setPaymentOption('Pay Now')}
                          className="accent-indigo-600"
                        />
                        <span>Direct UPI/Cash/Card</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Table Number</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={e => setTableNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 max-h-56 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    Cart is empty. Click any menu item to add.
                  </p>
                ) : (
                  cart.map(({ item, quantity }) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{formatINR(item.price)} each</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, quantity - 1)}
                            className="px-2 py-0.5 text-slate-500 hover:text-slate-900"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-slate-900">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, quantity + 1)}
                            className="px-2 py-0.5 text-slate-500 hover:text-slate-900"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-slate-900 w-16 text-right">
                          {formatINR(item.price * quantity)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Footer */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="text-slate-900 font-medium">{formatINR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (2.5%):</span>
                  <span className="text-slate-900 font-medium">{formatINR(cartTax / 2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (2.5%):</span>
                  <span className="text-slate-900 font-medium">{formatINR(cartTax / 2)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex justify-between text-sm font-bold">
                  <span className="text-slate-900">Total Bill (GST Incl.):</span>
                  <span className="text-indigo-600">{formatINR(cartTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handlePlaceOrder}
                className="w-full py-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <ChefHat className="w-4 h-4" />
                <span>Generate KOT & Place Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Kitchen Orders Ticket Log */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500 border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="p-3.5 font-semibold">Order Ref</th>
                    <th className="p-3.5 font-semibold">Destination</th>
                    <th className="p-3.5 font-semibold">Ordered Items</th>
                    <th className="p-3.5 font-semibold">Time</th>
                    <th className="p-3.5 font-semibold">Total</th>
                    <th className="p-3.5 font-semibold">Billing Mode</th>
                    <th className="p-3.5 font-semibold">Status</th>
                    <th className="p-3.5 font-semibold text-right">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.restaurantOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No restaurant orders found.
                      </td>
                    </tr>
                  ) : (
                    data.restaurantOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-indigo-600">{order.orderNumber}</td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{order.guestName}</p>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {order.orderType} {order.roomNumber ? `(Room ${order.roomNumber})` : ''}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <p className="text-slate-700">
                            {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                          </p>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">{order.createdAt}</td>
                        <td className="p-3.5 font-bold text-slate-900">{formatINR(order.total)}</td>
                        <td className="p-3.5">
                          <span className="text-[11px] text-emerald-600 font-semibold">{order.paymentStatus}</span>
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={order.status} size="sm" />
                        </td>
                        <td className="p-3.5 text-right">
                          <select
                            value={order.status}
                            onChange={e => updateRestaurantOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Menu Item Management */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Restaurant Menu Master Catalog</h3>
            <button
              onClick={openAddMenuModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dish / Item</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500 border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="p-3.5 font-semibold">Dish / Item Name</th>
                    <th className="p-3.5 font-semibold">Category</th>
                    <th className="p-3.5 font-semibold">Price</th>
                    <th className="p-3.5 font-semibold">Prep Time</th>
                    <th className="p-3.5 font-semibold">Availability</th>
                    <th className="p-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.foodItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3.5 text-indigo-600 font-medium">{item.category}</td>
                      <td className="p-3.5 font-bold text-slate-900">{formatINR(item.price)}</td>
                      <td className="p-3.5 text-slate-500">{item.preparationTimeMinutes || 15} mins</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditMenuModal(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingFoodItem ? 'Edit Menu Item' : 'Add Dish to Menu'}
              </h3>
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item / Dish Name *</label>
                <input
                  type="text"
                  required
                  value={menuFormData.name}
                  onChange={e => setMenuFormData({ ...menuFormData, name: e.target.value })}
                  placeholder="e.g. Grilled Norwegian Salmon"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={menuFormData.category}
                    onChange={e => setMenuFormData({ ...menuFormData, category: e.target.value as FoodCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ({currency}) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={menuFormData.price}
                    onChange={e => setMenuFormData({ ...menuFormData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preparation Time (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={menuFormData.preparationTimeMinutes}
                  onChange={e => setMenuFormData({ ...menuFormData, preparationTimeMinutes: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Ingredients</label>
                <textarea
                  rows={2}
                  value={menuFormData.description}
                  onChange={e => setMenuFormData({ ...menuFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="menuAvailable"
                  checked={menuFormData.isAvailable}
                  onChange={e => setMenuFormData({ ...menuFormData, isAvailable: e.target.checked })}
                  className="accent-indigo-600 w-4 h-4"
                />
                <label htmlFor="menuAvailable" className="text-slate-700 font-semibold cursor-pointer">
                  Currently Available in Kitchen
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title={`Delete Menu Item ${itemToDelete?.name}?`}
        message="Are you sure you want to permanently remove this menu item?"
        confirmLabel="Delete Item"
        isDestructive={true}
        onConfirm={() => {
          if (itemToDelete) {
            deleteFoodItem(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
