export type OrderStatus = 'PENDING' | 'SUBMITTED' | 'COMPLETED' | 'CANCELLED';

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
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  status: OrderStatus;
  paymentScreenshot?: string;
  credentials?: {
    username: string;
    password: string;
    expiryDate: string;
  };
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
  contactEmail: string;
  contactPhone: string;
}
