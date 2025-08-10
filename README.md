# Dashboard App

A modern, responsive dashboard application built with React, TypeScript, Tailwind CSS, and Supabase with comprehensive user management and authentication.

## Features

- 🔐 **Multi-User Authentication** - Complete signup/login system supporting multiple users
- 👥 **Demo Mode** - Full-featured demo with multiple local accounts for testing
- 🌓 **Dark Mode** - Toggle between light, dark, and system themes
- 📊 **Data Visualization** - Interactive charts and analytics
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔍 **Advanced Filtering** - Search, sort, and filter project entries
- ⚡ **Real-time Data** - Live updates with Supabase
- 👤 **Profile Management** - Edit user profiles and account settings
- 🔒 **Password Security** - Strong password requirements and validation
- 💾 **Persistent Sessions** - Remember user login state

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication System

### Demo Mode (Default)
When Supabase credentials aren't configured, the app runs in demo mode with:
- **Multiple Local Accounts** - Create and manage multiple demo users
- **Persistent Storage** - Accounts saved in browser localStorage
- **Full Feature Set** - All functionality works except real data persistence
- **Quick Account Switching** - Easy switching between demo accounts

### Real Mode (With Supabase)
With proper Supabase configuration:
- **Real User Registration** - Create actual accounts
- **Secure Authentication** - Full Supabase auth flow
- **Data Persistence** - Real database storage
- **Email Validation** - Proper email verification

### Account Creation Features
- **Strong Password Requirements** - Minimum 6 characters, lowercase letter, and number
- **Email Validation** - Real-time email format checking
- **Duplicate Prevention** - Prevents multiple accounts with same email
- **Real-time Feedback** - Instant validation feedback during signup
- **Profile Management** - Edit name and email after signup

## Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings > API**
4. Copy your **Project URL** and **anon/public key**

## User Management

### Demo Mode Users
- **Create Multiple Accounts** - No limit on demo accounts
- **Quick Account Selection** - Dropdown to switch between accounts
- **Profile Editing** - Modify user information locally
- **Account Overview** - View all created demo accounts

### Profile Features
- **Name & Email Editing** - Update personal information
- **Account Statistics** - View account creation date and login history
- **Demo Mode Status** - Clear indication of demo vs real accounts
- **Settings Access** - User preferences and configuration

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
├── components/          # React components
│   ├── auth/           # Authentication components
│   │   ├── AuthWrapper.tsx    # Auth state wrapper
│   │   ├── LoginForm.tsx      # Enhanced login with multi-user
│   │   └── SignupForm.tsx     # Advanced signup with validation
│   ├── ui/             # Shadcn/ui components
│   ├── UserProfile.tsx # Profile management component
│   └── ...             # Feature components
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Enhanced auth with multi-user support
│   └── ThemeContext.tsx
├── styles/             # CSS and styling
├── utils/              # Utility functions
└── supabase/           # Supabase configuration
```

## Authentication Flow

### Signup Process
1. **Form Validation** - Real-time validation of all fields
2. **Password Strength** - Enforced security requirements
3. **Email Checking** - Duplicate email prevention
4. **Account Creation** - Store in localStorage (demo) or Supabase (real)
5. **Success Feedback** - Clear confirmation and next steps

### Login Process
1. **Account Selection** - Quick selection from existing demo accounts
2. **Credential Entry** - Email/password with show/hide toggle
3. **Authentication** - Validate against localStorage or Supabase
4. **Session Management** - Persistent login state
5. **Profile Access** - Full dashboard access

### Profile Management
1. **View Profile** - Complete account information display
2. **Edit Information** - Modify name and email
3. **Account Stats** - Registration date, login history
4. **Demo Status** - Clear indication of account type

## Security Features

- **Password Requirements** - Minimum length, complexity rules
- **Email Validation** - RFC-compliant email checking
- **Session Management** - Secure token handling
- **Input Sanitization** - Prevent XSS and injection attacks
- **Error Handling** - Graceful error messages without exposure

## Technologies Used

- **React 18** - UI framework with hooks
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS v4** - Modern utility-first styling
- **Supabase** - Backend, authentication, and real-time features
- **Radix UI** - Accessible, unstyled components
- **Recharts** - Beautiful data visualization
- **Vite** - Fast build tool and development server
- **React Hook Form** - Form validation and handling

## Demo Accounts

The app includes a sophisticated demo system:

### Default Demo Account
- **Email:** demo@example.com
- **Password:** demo123
- **Name:** Demo User

### Creating Additional Demo Accounts
1. Click "Sign up" from the login page
2. Fill out the registration form with:
   - **Name:** At least 2 characters
   - **Email:** Valid email format (any domain)
   - **Password:** At least 6 characters, 1 lowercase, 1 number
3. Account is saved locally and available immediately
4. Switch between accounts using the account selector

### Demo Features
- **Persistent Storage** - Accounts saved across browser sessions
- **Profile Management** - Edit account information
- **Multiple Users** - No limit on number of demo accounts
- **Quick Switching** - Easy account selection during login
- **Full Functionality** - All dashboard features work in demo mode

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Deploy

### Other Platforms

Build the project:

```bash
npm run build
```

Deploy the `dist` folder to your preferred hosting platform.

## Development Guidelines

- **Component Structure** - Each component in its own file
- **Type Safety** - Full TypeScript coverage
- **Responsive Design** - Mobile-first approach
- **Accessibility** - WCAG compliant components
- **Performance** - Optimized renders and lazy loading
- **Code Quality** - ESLint and Prettier configured

## Support

For issues and questions:
- Check the browser console for detailed error messages
- Verify environment variables are properly set
- Ensure localStorage is enabled for demo mode
- Review the authentication flow in developer tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.# Dashboard-auth-full-stack
# dashboard-auth-full-stack
