'use client';

import { useEffect } from 'react';
import { Button } from '../../components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('AI Brain page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-medium text-white mb-4">
          Something went wrong loading AI Brain
        </h2>
        <p className="text-white/60 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={reset} variant="primary">
          Try again
        </Button>
      </div>
    </div>
  );
} 