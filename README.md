# Personal Finance Tracker - Full Stack Application

A comprehensive personal finance tracking application built with React, Node.js, and MongoDB Atlas. Track expenses, set budgets, view analytics, and get smart financial insights.

## 🚀 Features

### Frontend (React + TypeScript)
- **User Authentication** - Secure login/signup with JWT tokens
- **Expense Management** - Add, edit, delete, and filter expenses
- **Budget Tracking** - Set monthly budgets and track spending
- **Analytics Dashboard** - Visual charts and spending insights
- **Smart Suggestions** - AI-powered financial recommendations
- **Responsive Design** - Works on desktop and mobile devices

### Backend (Node.js + Express)
- **RESTful API** - Clean API endpoints for all operations
- **JWT Authentication** - Secure user authentication
- **MongoDB Integration** - Persistent data storage with MongoDB Atlas
- **Data Validation** - Input validation and error handling
- **User Isolation** - Each user sees only their own data

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB Atlas
- **Charts**: Recharts library
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd personal-finance-tracker
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit the `.env` file with your MongoDB Atlas connection string:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-tracker
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### 3. Frontend Setup

```bash
# Navigate back to root directory
cd ..

# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit the `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and update the `MONGODB_URI` in server/.env

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔐 Test Credentials

Create a new account using the signup form, or use these test credentials if you've seeded the database:

- **Email**: demo@example.com
- **Password**: password123

## 📁 Project Structure

```
personal-finance-tracker/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   │   ├── Auth/               # Authentication components
│   │   ├── Dashboard/          # Dashboard components
│   │   ├── Expenses/           # Expense management
│   │   ├── Budgets/            # Budget management
│   │   ├── Analytics/          # Analytics and charts
│   │   └── Insights/           # Smart insights
│   ├── context/                # React context providers
│   ├── services/               # API service layer
│   └── types/                  # TypeScript type definitions
├── server/                      # Backend Node.js application
│   ├── models/                 # MongoDB models
│   ├── routes/                 # Express routes
│   ├── middleware/             # Custom middleware
│   └── config/                 # Configuration files
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Expenses
- `GET /api/expenses` - Get user expenses (with filters)
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Budgets
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create/update budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

## 🎯 Key Features Explained

### Multi-User Support
- Each user has isolated data
- JWT-based authentication
- Secure password hashing with bcrypt

### Expense Tracking
- Categorized expenses (Food, Rent, Shopping, etc.)
- Multiple payment methods (UPI, Credit Card, Cash, etc.)
- Date-based filtering and search

### Budget Management
- Monthly budget limits per category
- Visual progress indicators
- Overspending alerts

### Analytics & Insights
- Interactive charts and graphs
- Spending trends over time
- Category-wise breakdowns
- Smart financial suggestions

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your preferred platform
3. Update environment variables for production

### Backend (Render/Railway)
1. Push your code to GitHub
2. Connect your repository to Render/Railway
3. Set environment variables
4. Deploy the backend service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Ensure MongoDB Atlas is properly configured
3. Verify environment variables are set correctly
4. Check that both frontend and backend servers are running

## 🔮 Future Enhancements

- [ ] Python Flask service for advanced analytics
- [ ] Monthly report generation with SQL database
- [ ] Email notifications for budget alerts
- [ ] Data export functionality
- [ ] Mobile app development
- [ ] Integration with banking APIs

---

Built with ❤️ for Amlgo Labs Full Stack Assessment