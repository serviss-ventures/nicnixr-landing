import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'start') {
      // Start the mobile app with Expo web
      const projectRoot = path.join(process.cwd(), '..', 'mobile-app');
      
      try {
        // First, kill any existing processes on the ports
        await execAsync('lsof -ti:8081 | xargs kill -9 2>/dev/null || true');
        await execAsync('lsof -ti:19006 | xargs kill -9 2>/dev/null || true');
        
        // Wait a bit for ports to be freed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Start Expo web in the background with specific port and non-interactive mode
        exec(`cd ${projectRoot} && EXPO_NO_PROMPT=true npx expo start --web --port 19006`, (error, stdout, stderr) => {
          if (error) {
            console.error('Expo start error:', error);
          }
          if (stdout) {
            console.log('Expo output:', stdout);
          }
          if (stderr) {
            console.error('Expo stderr:', stderr);
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Mobile app starting...',
          url: 'http://localhost:19006'
        });
      } catch (error) {
        console.error('Failed to start mobile app:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to start mobile app' },
          { status: 500 }
        );
      }
    } else if (action === 'stop') {
      // Stop the Expo server
      try {
        // Kill process on port 8081 (Metro bundler)
        await execAsync('lsof -ti:8081 | xargs kill -9 2>/dev/null || true');
        // Kill process on port 19006 (Expo web)
        await execAsync('lsof -ti:19006 | xargs kill -9 2>/dev/null || true');
        
        return NextResponse.json({ 
          success: true, 
          message: 'Mobile app stopped' 
        });
      } catch (error) {
        console.error('Failed to stop mobile app:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to stop mobile app' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Mobile app API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if Expo web is running on port 19006
    const { stdout } = await execAsync('lsof -ti:19006 2>/dev/null || echo ""');
    const isRunning = stdout.trim() !== '';
    
    return NextResponse.json({
      isRunning,
      url: isRunning ? 'http://localhost:19006' : null,
      platform: 'web'
    });
  } catch (error) {
    return NextResponse.json({
      isRunning: false,
      url: null,
      platform: 'web',
      error: 'Failed to check status'
    });
  }
} 