# Next Coder Admin Panel

A modern, secure admin panel for managing the Next Coder website content including portfolios, testimonials, careers, and analytics.

## Features

- 🔐 **Secure Authentication** - Login system with JWT tokens
- 📊 **Dashboard Analytics** - Overview of all key metrics
- 💼 **Portfolio Management** - Add, edit, and manage project portfolios
- 💬 **Testimonials Management** - Manage client testimonials and reviews
- 👥 **Careers Management** - Handle job postings and applications
- 📈 **Analytics Dashboard** - Detailed insights and reporting
- ⚙️ **Settings Panel** - Configure application settings
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design** - Works on all device sizes

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: JWT tokens with localStorage
- **API Integration**: Axios for backend communication

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 5000

### Installation

1. Navigate to the admin panel directory:
```bash
cd "Next Coder Website/next-coder-admin"
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the Admin Panel

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Login with demo credentials:
   - **Email**: admin@wenextcoder.com
   - **Password**: admin123

## Project Structure

```
next-coder-admin/
├── src/
│   ├── app/
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── login/           # Login page
│   │   ├── globals.css      # Global styles
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── admin/           # Admin-specific components
│   │   └── ui/              # Reusable UI components
│   └── lib/
│       ├── auth.ts          # Authentication utilities
│       ├── api.ts           # API client functions
│       └── utils.ts         # Utility functions
├── public/                  # Static assets
└── package.json
```

## Authentication

The admin panel uses a simple JWT-based authentication system:

- **Login**: Email/password authentication
- **Session**: Stored in localStorage
- **Protection**: All admin routes require authentication
- **Logout**: Clears session and redirects to login

### Demo Credentials

- **Email**: admin@wenextcoder.com
- **Password**: admin123

## API Integration

The admin panel connects to the backend API for:

- **Portfolio Management**: CRUD operations for projects
- **Testimonials**: Manage client reviews
- **Contact Forms**: Handle incoming messages
- **Analytics**: Dashboard statistics and insights

### API Endpoints

- `GET /api/portfolio` - Get all portfolio items
- `POST /api/portfolio` - Create new portfolio item
- `PUT /api/portfolio/:id` - Update portfolio item
- `DELETE /api/portfolio/:id` - Delete portfolio item
- `GET /api/testimonials` - Get all testimonials
- `POST /api/testimonials` - Create new testimonial
- `PUT /api/testimonials/:id` - Update testimonial
- `DELETE /api/testimonials/:id` - Delete testimonial

## Features Overview

### Dashboard
- Key metrics and statistics
- Recent projects overview
- Latest testimonials
- Quick actions

### Portfolio Management
- Add new projects
- Edit existing projects
- Upload project images
- Set project status
- Manage categories and technologies

### Testimonials Management
- Review client testimonials
- Approve/reject testimonials
- Edit testimonial content
- Manage client information

### Analytics
- Project performance metrics
- Testimonial engagement stats
- Contact form analytics
- Traffic and conversion data

## Development

### Adding New Features

1. Create components in `src/components/admin/`
2. Add API functions in `src/lib/api.ts`
3. Update routing in `src/app/admin/`
4. Add navigation items in `src/components/admin/app-sidebar.tsx`

### Styling

- Use Tailwind CSS classes
- Follow the design system in `src/app/globals.css`
- Use shadcn/ui components when possible
- Maintain consistent spacing and colors

## Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

Make sure to set the following environment variables:

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXTAUTH_SECRET`: Secret for authentication (production)
- `NEXTAUTH_URL`: Admin panel URL (production)

## Security

- All admin routes are protected
- JWT tokens are used for authentication
- API calls include proper error handling
- Input validation on all forms
- XSS protection with proper sanitization

## Support

For issues or questions about the admin panel:

1. Check the console for error messages
2. Verify API connectivity
3. Ensure proper authentication
4. Check environment variables

## License

This project is part of the Next Coder website ecosystem.