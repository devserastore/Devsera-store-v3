import { Product, Order, Account, CommunityPost, Review, Settings } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Canva Pro',
    description: 'Access premium design tools, templates, and features',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    originalPrice: 1299,
    salePrice: 199,
    duration: '1 Month',
    features: [
      'Unlimited premium templates',
      'Brand kit & fonts',
      'Background remover',
      'Magic resize',
      'Team collaboration'
    ],
    category: 'Design'
  },
  {
    id: '2',
    name: 'LinkedIn Premium',
    description: 'Unlock career opportunities with premium features',
    image: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=800&q=80',
    originalPrice: 1999,
    salePrice: 299,
    duration: '1 Month',
    features: [
      'InMail messages',
      'See who viewed your profile',
      'LinkedIn Learning access',
      'Applicant insights',
      'Premium badge'
    ],
    category: 'Professional'
  },
  {
    id: '3',
    name: 'Netflix Premium',
    description: 'Stream unlimited movies and TV shows in 4K',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80',
    originalPrice: 649,
    salePrice: 149,
    duration: '1 Month',
    features: [
      '4K Ultra HD streaming',
      '4 screens at once',
      'Download on 6 devices',
      'No ads',
      'Unlimited content'
    ],
    category: 'Entertainment'
  },
  {
    id: '4',
    name: 'Spotify Premium',
    description: 'Ad-free music streaming with offline downloads',
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80',
    originalPrice: 119,
    salePrice: 79,
    duration: '1 Month',
    features: [
      'Ad-free listening',
      'Offline downloads',
      'High quality audio',
      'Unlimited skips',
      'Play any song'
    ],
    category: 'Entertainment'
  },
  {
    id: '5',
    name: 'ChatGPT Plus',
    description: 'Access GPT-4 and advanced AI features',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    originalPrice: 1600,
    salePrice: 399,
    duration: '1 Month',
    features: [
      'GPT-4 access',
      'Faster response times',
      'Priority access',
      'Advanced data analysis',
      'DALL-E 3 integration'
    ],
    category: 'AI Tools'
  },
  {
    id: '6',
    name: 'YouTube Premium',
    description: 'Ad-free videos, background play, and downloads',
    image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80',
    originalPrice: 129,
    salePrice: 89,
    duration: '1 Month',
    features: [
      'Ad-free videos',
      'Background playback',
      'Offline downloads',
      'YouTube Music Premium',
      'Picture-in-picture'
    ],
    category: 'Entertainment'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: '1',
    productId: '1',
    status: 'COMPLETED',
    credentials: {
      username: 'user@canva.com',
      password: 'SecurePass123',
      expiryDate: '2024-02-15'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:00:00Z'
  },
  {
    id: 'ORD-002',
    userId: '1',
    productId: '2',
    status: 'SUBMITTED',
    paymentScreenshot: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80',
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:25:00Z'
  }
];

export const mockAccounts: Account[] = [
  {
    id: 'ACC-001',
    productId: '1',
    username: 'canva_shared_01@email.com',
    password: 'Pass123!',
    maxSlots: 5,
    usedSlots: 3,
    status: 'active',
    expiryDate: '2024-12-31'
  },
  {
    id: 'ACC-002',
    productId: '2',
    username: 'linkedin_premium_01@email.com',
    password: 'SecurePass456',
    maxSlots: 3,
    usedSlots: 2,
    status: 'active',
    expiryDate: '2024-12-31'
  }
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'POST-001',
    userId: '1',
    userName: 'Rahul Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
    content: 'Just got my Canva Pro access! The premium templates are amazing. Totally worth it! 🎨',
    likes: 24,
    comments: 5,
    createdAt: '2024-01-15T09:30:00Z'
  },
  {
    id: 'POST-002',
    userId: '2',
    userName: 'Priya Patel',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    content: 'LinkedIn Premium helped me land 3 interviews this week! The InMail feature is a game changer. 💼',
    likes: 42,
    comments: 12,
    createdAt: '2024-01-14T16:45:00Z'
  },
  {
    id: 'POST-003',
    userId: '3',
    userName: 'Amit Kumar',
    userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80',
    content: 'Netflix 4K quality is incredible! Watching on my new TV and the picture is crystal clear. 📺',
    likes: 18,
    comments: 3,
    createdAt: '2024-01-13T20:15:00Z'
  }
];

export const mockReviews: Review[] = [
  {
    id: 'REV-001',
    userId: '1',
    userName: 'Sneha Reddy',
    productId: '1',
    rating: 5,
    comment: 'Excellent service! Got my credentials within 2 hours. Canva Pro is working perfectly.',
    verified: true,
    createdAt: '2024-01-10T12:00:00Z'
  },
  {
    id: 'REV-002',
    userId: '2',
    userName: 'Vikram Singh',
    productId: '2',
    rating: 5,
    comment: 'Very reliable. LinkedIn Premium access is genuine and the price is unbeatable!',
    verified: true,
    createdAt: '2024-01-09T15:30:00Z'
  },
  {
    id: 'REV-003',
    userId: '3',
    userName: 'Anjali Mehta',
    productId: '3',
    rating: 4,
    comment: 'Good value for money. Netflix works great, just took a bit longer to get credentials.',
    verified: true,
    createdAt: '2024-01-08T18:20:00Z'
  }
];

export const mockSettings: Settings = {
  upiId: 'devsera@paytm',
  qrCodeUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&q=80',
  telegramLink: 'https://t.me/devserasupport',
  contactEmail: 'support@devsera.store',
  contactPhone: '+91 98765 43210'
};
