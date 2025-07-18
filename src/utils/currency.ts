// ✅ Fixed: Currency utility for consistent Rupee formatting

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toFixed(0)}`;
};

export const parseCurrency = (value: string): number => {
  // Remove currency symbol and commas, then parse
  const cleanValue = value.replace(/[₹$,]/g, '');
  return parseFloat(cleanValue) || 0;
};

export const CURRENCY_SYMBOL = '₹'; 