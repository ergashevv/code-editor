// Utility function to format phone numbers in +998-XX-XXX-XX-XX format

export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters except +
  let cleaned = value.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +998
  if (!cleaned.startsWith('+998')) {
    if (cleaned.startsWith('998')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('+')) {
      cleaned = '+998' + cleaned.substring(1).replace(/[^\d]/g, '');
    } else {
      cleaned = '+998' + cleaned.replace(/[^\d]/g, '');
    }
  }
  
  // Remove everything after +998 and keep only digits
  const digits = cleaned.substring(4).replace(/[^\d]/g, '');
  
  // Limit to 9 digits (Uzbek phone format: +998-XX-XXX-XX-XX)
  const limitedDigits = digits.substring(0, 9);
  
  // Format: +998-XX-XXX-XX-XX
  if (limitedDigits.length === 0) {
    return '+998';
  } else if (limitedDigits.length <= 2) {
    return `+998-${limitedDigits}`;
  } else if (limitedDigits.length <= 5) {
    return `+998-${limitedDigits.substring(0, 2)}-${limitedDigits.substring(2)}`;
  } else if (limitedDigits.length <= 7) {
    return `+998-${limitedDigits.substring(0, 2)}-${limitedDigits.substring(2, 5)}-${limitedDigits.substring(5)}`;
  } else {
    return `+998-${limitedDigits.substring(0, 2)}-${limitedDigits.substring(2, 5)}-${limitedDigits.substring(5, 7)}-${limitedDigits.substring(7)}`;
  }
}

