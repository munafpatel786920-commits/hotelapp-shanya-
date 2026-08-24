export interface IndianState {
  code: string;
  name: string;
  isUT?: boolean;
}

export const INDIAN_STATES: IndianState[] = [
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi', isUT: true },
  { code: '29', name: 'Karnataka' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '24', name: 'Gujarat' },
  { code: '08', name: 'Rajasthan' },
  { code: '30', name: 'Goa' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '19', name: 'West Bengal' },
  { code: '32', name: 'Kerala' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '06', name: 'Haryana' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '21', name: 'Odisha' },
  { code: '18', name: 'Assam' },
  { code: '01', name: 'Jammu and Kashmir', isUT: true },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '20', name: 'Jharkhand' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '04', name: 'Chandigarh', isUT: true },
  { code: '34', name: 'Puducherry', isUT: true },
  { code: '38', name: 'Ladakh', isUT: true },
  { code: '35', name: 'Andaman & Nicobar Islands', isUT: true },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu', isUT: true },
  { code: '11', name: 'Sikkim' },
  { code: '17', name: 'Meghalaya' },
  { code: '14', name: 'Manipur' },
  { code: '16', name: 'Tripura' },
  { code: '13', name: 'Nagaland' },
  { code: '15', name: 'Mizoram' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '31', name: 'Lakshadweep', isUT: true }
];

export const SAC_CODES = {
  ROOM_ACCOMMODATION: { code: '996311', desc: 'Room Accommodation Services' },
  FOOD_RESTAURANT: { code: '996331', desc: 'Restaurant, Food & Beverage Services' },
  LAUNDRY_SERVICE: { code: '996337', desc: 'Laundry & Dry Cleaning Services' },
  SPA_WELLNESS: { code: '999721', desc: 'Spa & Wellness Services' },
  TRANSPORT_CAB: { code: '996412', desc: 'Passenger Transport & Cab Services' },
  OTHER_SERVICES: { code: '996339', desc: 'Other Hotel Support Services' }
};

export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}

export function formatINRCompact(amount: number): string {
  if (isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount.toFixed(0)}`;
}

export function calculateGST(
  subtotal: number,
  gstRate: number = 12,
  isInterState: boolean = false
) {
  const totalTax = (subtotal * gstRate) / 100;
  if (isInterState) {
    return {
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: gstRate,
      igstAmount: totalTax,
      totalTax,
      grandTotal: subtotal + totalTax
    };
  } else {
    const halfRate = gstRate / 2;
    const halfTax = totalTax / 2;
    return {
      cgstRate: halfRate,
      cgstAmount: halfTax,
      sgstRate: halfRate,
      sgstAmount: halfTax,
      igstRate: 0,
      igstAmount: 0,
      totalTax,
      grandTotal: subtotal + totalTax
    };
  }
}

export function formatAadhaar(aadhaar: string): string {
  const cleaned = aadhaar.replace(/\D/g, '').slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }
  return parts.join('-');
}

export function validateGSTIN(gstin: string): boolean {
  if (!gstin) return false;
  // Standard Indian GSTIN Regex: 15 alphanumeric characters
  // 2 digits state code + 5 chars PAN + 4 digits PAN + 1 char PAN + 1 digit entity + Z + 1 check digit
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.trim().toUpperCase());
}

export function validatePAN(pan: string): boolean {
  if (!pan) return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.trim().toUpperCase());
}
