# Port Configuration

## Current Port Assignments

- **Admin Dashboard**: Port 3001 (http://localhost:3001)
- **Marketing Website**: Port 3002 (http://localhost:3002)
- **Mobile App (future)**: Port 3003

## Why These Ports?

When running `npm run dev` in the main directory:
1. Port 3000 is typically taken by another process
2. Next.js automatically tries 3001, which is taken by admin dashboard
3. Website runs on the next available port: 3002

## Running the Services

### Option 1: Using the startup script
```bash
./start-editor.sh
```

### Option 2: Manual startup
```bash
# Terminal 1 - Admin Dashboard
cd admin-dashboard && npm run dev

# Terminal 2 - Website  
npm run dev
```

## Accessing the Services

- Admin Dashboard: http://localhost:3001
- Website Editor: http://localhost:3001/website
- Live Website: http://localhost:3002

## Troubleshooting

If you see the admin dashboard instead of the website in the preview:
1. Check that the website is running on port 3002
2. The admin dashboard's website preview has been updated to use port 3002
3. Click the refresh button in the website status bar

## Configuration Files Updated

- `admin-dashboard/src/lib/websiteManager.ts` - Changed from 3001 to 3002
- `admin-dashboard/src/app/api/website/route.ts` - Changed from 3001 to 3002
- `admin-dashboard/src/app/website/page.tsx` - Changed "Open in New Tab" to 3002 