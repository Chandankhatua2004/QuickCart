# QuickCart - Modern E-commerce Platform

A full-featured e-commerce platform built with Next.js, MongoDB, and Clerk authentication.

## 🚀 Features

- **User Authentication** - Secure login/signup with Clerk
- **Shopping Cart** - Add, remove, and manage cart items
- **Order Management** - Complete order lifecycle
- **Payment Integration** - Multiple payment gateways (Razorpay, Stripe, PayPal, COD)
- **Admin Dashboard** - Manage orders and products
- **Address Management** - Save and manage delivery addresses
- **Email Notifications** - Order confirmations and updates
- **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **Payments**: Razorpay, Stripe, PayPal
- **Deployment**: Vercel, Netlify, Railway

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chandankhatua2004/QuickCart.git
   cd QuickCart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Fill in your environment variables in `.env.local`

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB Database
MONGODB_URI=your_mongodb_connection_string

# Payment Gateway Keys (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# Email Service (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

## 🚀 Production Deployment

### Netlify (Recommended)

1. **Connect your GitHub repository to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Choose GitHub and select your QuickCart repository

2. **Configure build settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 18

3. **Add environment variables**
   - In the Netlify dashboard, go to Site settings > Environment variables
   - Add all variables from your `.env.local` file

4. **Deploy automatically**
   - Netlify will deploy on every push to the main branch

### Vercel (Alternative)

1. **Connect your GitHub repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy automatically** on every push

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
QuickCart/
├── app/                    # Next.js App Router
│   ├── admin-dashboard/   # Admin panel
│   ├── api/              # API routes
│   ├── cart/             # Shopping cart
│   ├── my-orders/        # Order history
│   └── payment/          # Payment processing
├── components/            # Reusable components
├── context/              # React context
├── lib/                  # Utility functions
├── models/               # MongoDB models
└── assets/               # Static assets
```

## 🔐 Security Features

- **Authentication**: Secure user management with Clerk
- **API Protection**: Server-side authentication checks
- **Input Validation**: Form validation and sanitization
- **CORS Protection**: Configured for production
- **Security Headers**: XSS and clickjacking protection

## 📊 Database Schema

### Orders
```javascript
{
  userId: String,
  items: Array,
  amount: Number,
  address: Object,
  status: String,
  customerName: String,
  customerEmail: String,
  paymentMethod: String
}
```

### Products
```javascript
{
  name: String,
  description: String,
  category: String,
  price: Number,
  offerPrice: Number,
  image: [String],
  rating: Number
}
```

## 🛡️ Error Handling

- **Error Boundaries**: Graceful error handling
- **Loading States**: User-friendly loading indicators
- **Form Validation**: Client and server-side validation
- **API Error Handling**: Proper error responses

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive tablet layouts
- **Desktop Experience**: Enhanced desktop features
- **Accessibility**: WCAG compliant

## 🔄 API Endpoints

- `GET /api/orders` - Fetch user orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/[id]` - Update order status
- `GET /api/products` - Fetch all products
- `POST /api/products` - Create new product
- `DELETE /api/products/[id]` - Delete product
- `GET /api/addresses` - Fetch user addresses
- `POST /api/addresses` - Create new address

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Chandan Khatua**
- GitHub: [@Chandankhatua2004](https://github.com/Chandankhatua2004)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Clerk for authentication
- MongoDB for database
- Tailwind CSS for styling

---

**Made with ❤️ by Chandan Khatua**
