'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ServerStatusCheck() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:5001/health');
        if (response.ok) {
          setStatus('online');
          setError(null);
        } else {
          setStatus('offline');
          setError('Server responded with error');
        }
      } catch {
        setStatus('offline');
        setError('Cannot connect to server. Make sure the server is running on port 5001.');
      }
    };

    checkServerStatus();
  }, []);

  if (status === 'checking') {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
            <span className="text-yellow-800">Checking server status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'offline') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">Server is offline</p>
              <p className="text-red-700 text-sm">{error}</p>
              <div className="mt-2 text-sm text-red-700">
                <p>To start the server:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Open terminal in the server directory</li>
                  <li>Run: <code className="bg-red-100 px-1 rounded">npm run dev</code></li>
                  <li>Make sure MongoDB is running</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-800">Server is online and running</span>
        </div>
      </CardContent>
    </Card>
  );
}
