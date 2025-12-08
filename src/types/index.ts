export type OrderStatus = 'PENDING' | 'SUBMITTED' | 'COMPLETED' | 'CANCELLED';

// Delivery types for products
export type DeliveryType = 
  | 'CREDENTIALS'      // Admin provides username/password
  | 'COUPON_CODE'      // Admin provides coupon/license key
  | 'MANUAL_ACTIVATION' // User provides their ID/email, admin activates on their account
  | 'INSTANT_KEY';     // Pre-loaded keys that auto-deliver

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  duration: string;
  features: string[];
  category: string;
  deliveryType: DeliveryType;
  deliveryInstructions?: string; // Instructions shown to user based on delivery type
  requiresUserInput?: boolean;   // If true, user must provide their account details
  userInputLabel?: string;       // Label for user input field (e.g., "Your Netflix Email")
  isActive?: boolean;
}

export interface OrderCredentials {
  // For CREDENTIALS type
  username?: string;
  password?: string;
  // For COUPON_CODE / INSTANT_KEY type
  couponCode?: string;
  licenseKey?: string;
  activationLink?: string; // Clickable link for coupon/license activation
  // For MANUAL_ACTIVATION type
  activationStatus?: string;
  activationNotes?: string;
  // Common
  expiryDate?: string;
  additionalInfo?: string;
}

export interface UserProvidedCredentials {
  email?: string;
  password?: string;
}

export interface OrderProfile {
  id: string;
  email: string;
  full_name?: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  profile?: OrderProfile;
  status: OrderStatus;
  paymentScreenshot?: string;
  // User-provided input for MANUAL_ACTIVATION (legacy - single string)
  userProvidedInput?: string;
  // User-provided credentials for MANUAL_ACTIVATION (email + password)
  userProvidedCredentials?: UserProvidedCredentials;
  // Flexible credentials based on delivery type
  credentials?: OrderCredentials;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Account {
  id: string;
  productId: string;
  username: string;
  password: string;
  maxSlots: number;
  usedSlots: number;
  status: 'active' | 'blocked' | 'expired';
  expiryDate: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
}

export interface Settings {
  upiId: string;
  qrCodeUrl: string;
  telegramLink: string;
  telegramUsername: string;
  contactEmail: string;
  contactPhone: string;
}
