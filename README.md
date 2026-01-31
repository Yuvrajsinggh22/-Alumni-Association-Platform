<<<<<<< HEAD
# Alumni Association Platform

A comprehensive full-stack platform for Government Engineering College alumni to connect, network, find jobs, attend events, and contribute to the community.

## 🚀 Features

### Core Functionality
- **Alumni Registration & Authentication** - Secure JWT-based authentication with email verification
- **Profile Management** - Comprehensive alumni profiles with professional information
- **Alumni Directory** - Search and filter alumni by various criteria
- **Job Portal** - Post jobs, browse opportunities, and apply directly
- **Events & Reunions** - Create, manage, and register for alumni events
- **Donation System** - Integrated payment processing with Stripe and Razorpay
- **Messaging System** - Real-time messaging between alumni
- **Admin Dashboard** - Administrative controls for managing the platform

### Additional Features
- **Follow System** - Connect with fellow alumni
- **Success Stories** - Share and celebrate achievements
- **Feedback System** - Collect and manage user feedback
- **Privacy Controls** - Granular privacy settings for profiles
- **Responsive Design** - Mobile-first responsive UI

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Primary database
- **Prisma ORM** - Database toolkit and ORM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Stripe & Razorpay** - Payment processing
- **Joi** - Input validation
- **Helmet** - Security middleware

### Frontend
- **React.js** - Frontend framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled accessible UI components
- **Heroicons** - Beautiful SVG icons
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Development Tools
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple commands
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
alumni-platform/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── routes/
│   │   ├── admin.js
│   │   ├── alumni.js
│   │   ├── auth.js
│   │   ├── donations.js
│   │   ├── events.js
│   │   ├── feedback.js
│   │   ├── jobs.js
│   │   └── messages.js
│   ├── utils/
│   │   └── validation.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Layout/
│   │   │   └── UI/
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Alumni/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Donations/
│   │   │   ├── Events/
│   │   │   ├── Jobs/
│   │   │   ├── Landing/
│   │   │   ├── Messages/
│   │   │   ├── Profile/
│   │   │   └── Settings/
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alumni-platform/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/alumni_db"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   
   # Email (Optional - for notifications)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   
   # Payment Gateways
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="your-razorpay-secret"
   
   # File Storage (Optional)
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET="your-bucket-name"
   
   # Firebase (Optional - for push notifications)
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_PRIVATE_KEY="your-private-key"
   FIREBASE_CLIENT_EMAIL="your-client-email"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The backend server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The frontend application will start on `http://localhost:3000`

## 🔧 Development

### Running Both Servers Concurrently

From the root directory, you can run both backend and frontend servers:

```bash
# Install concurrently globally
npm install -g concurrently

# Run both servers
concurrently "cd backend && npm run dev" "cd frontend && npm start"
```

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate new migration
npx prisma migrate dev --name migration-name
```

### Code Quality

```bash
# Backend linting
cd backend && npm run lint

# Frontend linting
cd frontend && npm run lint

# Format code
npm run format
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new alumni
- `POST /api/auth/login` - Login alumni
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Alumni Endpoints
- `GET /api/alumni` - Get alumni directory with filters
- `GET /api/alumni/:id` - Get specific alumni profile
- `POST /api/alumni/:id/follow` - Follow an alumni
- `DELETE /api/alumni/:id/follow` - Unfollow an alumni

### Jobs Endpoints
- `GET /api/jobs` - Get job listings with filters
- `POST /api/jobs` - Create new job posting
- `GET /api/jobs/:id` - Get specific job details
- `POST /api/jobs/:id/apply` - Apply for a job

### Events Endpoints
- `GET /api/events` - Get event listings
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get specific event details
- `POST /api/events/:id/register` - Register for event

### Donations Endpoints
- `POST /api/donations/stripe/create-payment-intent` - Create Stripe payment
- `POST /api/donations/razorpay/create-order` - Create Razorpay order
- `GET /api/donations` - Get donation history

### Messages Endpoints
- `GET /api/messages/conversations` - Get user conversations
- `POST /api/messages` - Send new message
- `GET /api/messages/:conversationId` - Get conversation messages

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Joi schemas for request validation
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Cross-origin request security
- **Helmet Security** - Security headers
- **SQL Injection Prevention** - Prisma ORM protection

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - Theme switching capability
- **Accessibility** - WCAG compliant components
- **Loading States** - Smooth user experience
- **Error Handling** - Comprehensive error messages
- **Toast Notifications** - User feedback system

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. **Environment Variables**
   Set all required environment variables in your hosting platform

2. **Database**
   Use a managed PostgreSQL service (Heroku Postgres, Railway, etc.)

3. **Build Command**
   ```bash
   npm install && npx prisma generate && npx prisma db push
   ```

4. **Start Command**
   ```bash
   npm start
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `build`

2. **Environment Variables**
   Set `REACT_APP_API_URL` to your backend URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Roadmap

### Phase 1 (Current)
- ✅ Core platform functionality
- ✅ Authentication and profiles
- ✅ Job portal and events
- ✅ Donation system
- ✅ Messaging system

### Phase 2 (Upcoming)
- 📱 React Native mobile app
- 📁 File storage integration
- 🔔 Push notifications
- 📊 Advanced analytics
- 🤖 AI-powered job matching

### Phase 3 (Future)
- 🎓 Mentorship program
- 📚 Resource library
- 🏆 Achievement system
- 🌐 Multi-language support
- 🔗 Third-party integrations

---

**Built with ❤️ for the Government Engineering College Alumni Community**
"# SIH-management" 
=======
# SIH-management
Prototype
>>>>>>> fb0dc0fc8d5ca72a8a36da24f96e113e8da3832a
