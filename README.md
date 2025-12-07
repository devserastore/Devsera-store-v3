# Devsera Store - E-commerce Subscription Marketplace

A full-stack subscription marketplace where users purchase shared access to premium services (Canva Pro, LinkedIn Premium, Netflix, etc.) via UPI payment.

## Features

### User Features
- **Product Browsing**: Browse premium subscription services with detailed information
- **Secure Authentication**: Register and login to access full features
- **Order Management**: Track orders from payment to credential delivery
- **Payment Flow**: UPI-based payment with QR code and screenshot upload
- **Community**: Share experiences and connect with other users
- **Order Status Tracking**: Real-time order status updates (PENDING → SUBMITTED → COMPLETED/CANCELLED)

### Admin Features
- **Dashboard Metrics**: View revenue, order counts, and platform statistics
- **Order Verification**: Review payment screenshots and approve/reject orders
- **Account Pool Management**: Manage shared accounts with slot utilization tracking
- **Settings Configuration**: Update UPI details, QR codes, and contact information

## Design System

### Swiss International with Brutalist Accents
- **Typography**: Space Grotesk (headings), Manrope (body), JetBrains Mono (data)
- **Colors**: Warm off-white background (#FAFAF8), deep teal primary (#0A7A7A), semantic status colors
- **Components**: 2px black borders, brutalist shadows, bento-grid layouts
- **Motion**: Smooth transitions with tactile feedback

## Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State**: React Context API
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Demo Credentials

**User Account:**
- Email: user@test.com
- Password: any password

**Admin Account:**
- Email: admin@test.com
- Password: any password

## Project Structure

```
src/
├── components/
│   ├── admin/              # Admin-specific components
│   ├── products/           # Product display components
│   ├── shared/             # Shared components (Header, StatusBadge)
│   └── ui/                 # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── data/
│   └── mockData.ts         # Mock data for demo
├── pages/
│   ├── admin/              # Admin pages
│   ├── HomePage.tsx
│   ├── ProductDetailPage.tsx
│   ├── CheckoutPage.tsx
│   ├── OrdersPage.tsx
│   ├── CommunityPage.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── types/
│   └── index.ts            # TypeScript type definitions
└── App.tsx                 # Main app with routing
```

## Key Features Implementation

### Order Lifecycle
1. **PENDING**: User creates order, awaits payment upload
2. **SUBMITTED**: Payment screenshot uploaded, awaiting admin verification
3. **COMPLETED**: Admin approves, credentials delivered to user
4. **CANCELLED**: Admin rejects with reason

### Payment Flow
1. User selects product and proceeds to checkout
2. System displays UPI QR code and UPI ID
3. User makes payment and uploads screenshot
4. Admin verifies payment and assigns credentials
5. User receives credentials in order details

### Admin Workflow
1. Monitor dashboard metrics and pending orders
2. Review payment screenshots in verification panel
3. Approve orders by assigning account credentials
4. Reject orders with detailed reasons
5. Manage account pool with slot utilization tracking

## Design Highlights

- **Brutalist Cards**: 2px black borders with shadow effects
- **Status Badges**: Pill-shaped with semantic colors
- **Bento Grid**: Asymmetric product layouts
- **Typography Scale**: Dramatic 2-3× size jumps for hierarchy
- **Responsive**: Mobile-first with touch-optimized interactions

## Future Enhancements

- Backend integration with Supabase/Convex
- Real-time order notifications
- Payment gateway integration
- Review and rating system
- Community engagement features (likes, comments)
- Email notifications
- Refund management

## License

MIT

---

Built with ❤️ for Tempo Platform
