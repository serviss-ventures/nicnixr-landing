import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Store the child process reference
let websiteProcess: any = null;

export async function GET() {
  try {
    // Check if port 3001 is in use
    const { stdout } = await execAsync('lsof -ti:3001 || echo "FREE"');
    const isRunning = stdout.trim() !== 'FREE';
    
    return NextResponse.json({
      status: isRunning ? 'online' : 'offline',
      url: isRunning ? 'http://localhost:3001' : null,
      port: 3001
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

export async function POST(request: Request) {
  const { action } = await request.json();
  
  if (action === 'start') {
    try {
      // Check if already running
      const { stdout } = await execAsync('lsof -ti:3001 || echo "FREE"');
      if (stdout.trim() !== 'FREE') {
        return NextResponse.json({ 
          status: 'already_running',
          url: 'http://localhost:3001' 
        });
      }
      
      // Start the marketing website
      // Note: In production, you'd use a proper process manager
      const { spawn } = require('child_process');
      websiteProcess = spawn('npm', ['run', 'dev:website'], {
        cwd: process.cwd().replace('/admin-dashboard', ''),
        detached: true,
        stdio: 'ignore'
      });
      
      websiteProcess.unref();
      
      // Wait a bit for the server to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return NextResponse.json({ 
        status: 'started',
        url: 'http://localhost:3001',
        message: 'Marketing website is starting...'
      });
    } catch (error) {
      return NextResponse.json({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to start website' 
      });
    }
  }
  
  if (action === 'stop') {
    try {
      // Kill process on port 3001
      await execAsync('lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "Already stopped"');
      
      return NextResponse.json({ 
        status: 'stopped',
        message: 'Marketing website stopped'
      });
    } catch (error) {
      return NextResponse.json({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to stop website' 
      });
    }
  }
  
  return NextResponse.json({ status: 'error', error: 'Invalid action' });
} 