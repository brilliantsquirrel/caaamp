# CAAAMP - Camping Event Application Management Platform

A full-stack web application for managing camping event applications built with Next.js, PostgreSQL, and Google OAuth.

## Features

- **Google OAuth Authentication** - Secure sign-in with Google accounts
- **Event Management** - Browse and view camping events
- **Application System** - Submit applications with detailed information
- **User Dashboard** - Track application status and view upcoming events
- **Admin Interface** - Review applications, update statuses, and add internal notes
- **Fixed Application Form** - Standard form fields for all events (name, contact info, dietary restrictions, medical conditions, etc.)

## Tech Stack

- **Frontend**: Next.js 14+ (React, App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with Google OAuth
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **TypeScript**: Full type safety

## Project Structure

```
campv2/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API endpoints
│   │   ├── admin/                # Admin pages
│   │   ├── dashboard/            # User dashboard
│   │   ├── events/               # Event pages
│   │   └── login/                # Login page
│   ├── components/               # React components
│   ├── lib/                      # Utilities and configs
│   └── types/                    # TypeScript types
├── prisma/
│   └── schema.prisma             # Database schema
└── public/                       # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Google Cloud Console project for OAuth

### 1. Clone and Install

```bash
cd campv2
npm install
```

### 2. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret

### 3. Configure Environment Variables

Update `.env` file with your credentials:

```env
# Database (for local dev, you can use Prisma's built-in dev database)
DATABASE_URL="prisma+postgres://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations (creates tables)
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Initial Setup Tasks

### Create First Admin User

1. Sign in with your Google account
2. Open Prisma Studio: `npx prisma studio`
3. Find your user in the `User` table
4. Set `isAdmin` field to `true`
5. Refresh the app - you'll now see the Admin menu

### Create Test Events

Since events are managed via API/database (no UI yet), you can:

1. Use Prisma Studio to manually create events
2. Or use the Prisma client directly:

```typescript
// In a script or API route
await prisma.event.create({
  data: {
    name: "Summer Camp 2026",
    description: "Annual summer camping trip",
    startDate: new Date("2026-07-15"),
    endDate: new Date("2026-07-20"),
    location: "Yosemite National Park",
    applicationDeadline: new Date("2026-06-01"),
    maxParticipants: 50,
    isActive: true,
  },
});
```

## Key Features & Pages

### Public Pages
- **/** - Landing page with overview
- **/events** - Browse all active events
- **/events/[id]** - Event details
- **/login** - Google OAuth sign-in

### User Pages (Protected)
- **/dashboard** - View your applications and upcoming events
- **/events/[id]/apply** - Submit application form

### Admin Pages (Protected, Admin Only)
- **/admin** - Admin dashboard with statistics
- **/admin/applications** - All applications with filtering
- **/admin/applications/[id]** - Review and update application status

### API Endpoints

**User Endpoints:**
- `GET /api/events` - List active events
- `GET /api/events/[id]` - Event details
- `GET /api/applications` - User's applications
- `POST /api/applications` - Submit application
- `PATCH /api/applications/[id]` - Update application
- `DELETE /api/applications/[id]` - Delete application

**Admin Endpoints:**
- `GET /api/admin/applications` - All applications (with filters)
- `GET /api/admin/applications/[id]` - Application details
- `PATCH /api/admin/applications/[id]` - Update status/notes

## Database Schema

### Key Tables

- **User** - User accounts (from Google OAuth)
- **Event** - Camping events
- **Application** - User applications to events
- **Account/Session** - NextAuth authentication data

### Application Fields

**User-provided:**
- Applicant name
- Phone number
- Emergency contact (name & phone)
- Dietary restrictions
- Medical conditions
- Special requirements

**Admin-only:**
- Status (pending/approved/rejected/waitlist)
- Admin notes
- Reviewed by / reviewed at

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Prisma commands
npx prisma studio          # Open database GUI
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Create/apply migrations
npx prisma db push         # Push schema changes (dev only)
```

## Deployment

### Database (GCP Cloud SQL)

1. Create PostgreSQL instance in GCP
2. Create database `caaamp`
3. Get connection string
4. Update `DATABASE_URL` in production environment

### Application (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables:
   - DATABASE_URL
   - NEXTAUTH_URL (your production URL)
   - NEXTAUTH_SECRET
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
4. Update Google OAuth redirect URIs with production URL
5. Deploy

## Troubleshooting

**Can't sign in:**
- Check Google OAuth credentials
- Verify redirect URI matches exactly
- Check console for errors

**Database errors:**
- Verify DATABASE_URL is correct
- Run `npx prisma generate`
- Check database is accessible

**No events showing:**
- Create events via Prisma Studio
- Ensure `isActive` is true
- Check startDate is in the future

## Future Enhancements

- Admin UI for event creation/management
- Email notifications
- File uploads for supporting documents
- Event capacity tracking with automatic waitlist
- Custom fields per event
- Bulk application processing
- CSV export
- Analytics dashboard

## Support

For issues or questions, refer to the implementation plan at:
`/Users/jackfruit/.claude/plans/quirky-dreaming-brook.md`
