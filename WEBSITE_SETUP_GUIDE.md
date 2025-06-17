# NixR Website Setup Guide

This guide explains how to run the NixR marketing website and admin dashboard.

## Project Structure

- **Root Directory (`/`)**: Marketing website
- **Admin Dashboard (`/admin-dashboard`)**: Admin control panel
- **Mobile App (`/mobile-app`)**: React Native app

## Automated Website Management

The admin dashboard now has built-in controls to start/stop the marketing website!

### From the Admin Dashboard:

1. Navigate to **Marketing → Website Preview**
2. Click the **Start** button to launch the marketing website
3. The website will automatically start on port 3001 and open in a new tab
4. Use the **Stop** button to shut down the website server
5. Status is automatically checked every 5 seconds

### Features:
- **Automatic server management** - Start/stop the website directly from admin dashboard
- **Real-time status updates** - See if the website is online or offline
- **Error handling** - Clear error messages if something goes wrong
- **Device preview** - Switch between Desktop, Tablet, and Mobile views
- **Live preview** - See your website changes in real-time

## Manual Setup (if needed)

### Installing Dependencies:
```bash
# In the root directory
npm install
```

### Running the Marketing Website Manually:
```bash
# From the root directory
npm run dev:website
```

This will start the marketing website on **http://localhost:3001**

### Running the Admin Dashboard:
```bash
cd admin-dashboard
npm run dev
```

This will start the admin dashboard on **http://localhost:3000**

## Running the Applications

You have two separate Next.js applications:

1. **Marketing Website** (Port 3001)
   - Located in the root directory
   - Run with: `npm run dev:website`
   - Access at: http://localhost:3001

2. **Admin Dashboard** (Port 3000)
   - Located in `/admin-dashboard`
   - Run with: `cd admin-dashboard && npm run dev`
   - Access at: http://localhost:3000

## Running Both Applications

To have both the website and admin dashboard available:

**Option 1: Two Terminal Windows**
```bash
# Terminal 1 - Website
npm run dev:website

# Terminal 2 - Admin Dashboard
cd admin-dashboard && npm run dev
```

**Option 2: Using Background Process**
```bash
# Start admin dashboard in background
cd admin-dashboard && npm run dev &

# Then start website
cd .. && npm run dev:website
```

## Navigation

- The "Admin Dashboard" button on the website will take you to http://localhost:3000
- Both applications need to be running for the link to work

## Troubleshooting

If you get a 404 when clicking "Admin Dashboard":
1. Make sure the admin dashboard is running (`cd admin-dashboard && npm run dev`)
2. Check that it's running on port 3000 (not 3004 or 3005)
3. The website link is hardcoded to http://localhost:3000

## Development Notes

- The website uses Tailwind CSS v3 for styling
- Both apps share the same purple/pink color theme
- The admin dashboard includes AI Coach integration and analytics

## Marketing Website Features

- Modern dark theme matching the app design
- Hero section with download CTAs
- Features showcase (AI Coach, Buddy System, Progress Tracking)
- How it works guide
- Responsive design for all devices
- Glass morphism effects
- Smooth animations

## Notes

- The marketing website runs on port 3001
- The admin dashboard runs on port 3000
- Both share the same dark theme and design system
- The website preview in the admin dashboard requires the marketing website to be running
- All website management happens through the admin dashboard's Website Preview page 