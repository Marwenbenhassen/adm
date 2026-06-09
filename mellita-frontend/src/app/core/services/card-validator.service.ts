import { Injectable } from '@angular/core';

export interface CardValidationResult {
  isValid: boolean;
  cardType: string | null;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CardValidatorService {
  
  detectCardType(cardNumber: string): string | null {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    const patterns: { [key: string]: RegExp } = {
      'Visa': /^4[0-9]{12}(?:[0-9]{3})?$/,
      'MasterCard': /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/,
      'American Express': /^3[47][0-9]{13}$/,
      'Discover': /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleaned)) {
        return type;
      }
    }
    return null;
  }

  validateLuhn(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cleaned)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  validateCard(cardNumber: string, expiryDate: string, cvv: string): CardValidationResult {
    const result: CardValidationResult = {
      isValid: false,
      cardType: null,
      errors: []
    };
    
    const cleanedNumber = cardNumber.replace(/\s/g, '');
    
    if (!cleanedNumber || cleanedNumber.length === 0) {
      result.errors.push('Le numéro de carte est requis');
      return result;
    }
    
    if (!/^\d+$/.test(cleanedNumber)) {
      result.errors.push('Le numéro de carte doit contenir uniquement des chiffres');
      return result;
    }
    
    if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
      result.errors.push('Le numéro de carte doit contenir entre 13 et 19 chiffres');
      return result;
    }
    
    result.cardType = this.detectCardType(cardNumber);
    if (!result.cardType) {
      result.errors.push('Type de carte non reconnu (Visa, MasterCard, Amex, Discover)');
      return result;
    }
    
    if (!this.validateLuhn(cardNumber)) {
      result.errors.push('Numéro de carte invalide');
      return result;
    }
    
    if (expiryDate) {
      const expiryValidation = this.validateExpiryDate(expiryDate);
      if (!expiryValidation.isValid) {
        result.errors.push(...expiryValidation.errors);
        return result;
      }
    }
    
    if (cvv) {
      const cvvValidation = this.validateCVV(cvv, result.cardType);
      if (!cvvValidation.isValid) {
        result.errors.push(...cvvValidation.errors);
        return result;
      }
    }
    
    result.isValid = true;
    return result;
  }
  
  validateExpiryDate(expiryDate: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const match = expiryDate.match(/^(\d{2})\/(\d{2})$/);
    
    if (!match) {
      errors.push('Format de date invalide. Utilisez MM/AA');
      return { isValid: false, errors };
    }
    
    const month = parseInt(match[1], 10);
    let year = parseInt(match[2], 10);
    year += 2000;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (month < 1 || month > 12) {
      errors.push('Mois invalide (doit être entre 01 et 12)');
      return { isValid: false, errors };
    }
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.push('La carte a expiré');
      return { isValid: false, errors };
    }
    
    if (year > currentYear + 10) {
      errors.push('Date d\'expiration trop lointaine');
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }
  
  validateCVV(cvv: string, cardType: string | null): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!cvv || cvv.length === 0) {
      errors.push('Le CVV est requis');
      return { isValid: false, errors };
    }
    
    if (!/^\d+$/.test(cvv)) {
      errors.push('Le CVV doit contenir uniquement des chiffres');
      return { isValid: false, errors };
    }
    
    const expectedLength = cardType === 'American Express' ? 4 : 3;
    
    if (cvv.length !== expectedLength) {
      errors.push(`Le CVV doit contenir ${expectedLength} chiffres`);
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }
  
  formatCardNumber(value: string): string {
    const cleaned = value.replace(/\s/g, '');
    const groups = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      groups.push(cleaned.substring(i, i + 4));
    }
    return groups.join(' ');
  }
  
  formatExpiryDate(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  }
}