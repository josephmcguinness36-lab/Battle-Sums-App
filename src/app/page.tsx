'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function WelcomePage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('sumz_user');
    if (savedUser) {
      router.replace('/mode');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('sumz_user', username.trim());
      router.push('/mode');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <form onSubmit={handleSaveUser}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary font-headline">
              Welcome to Battle Sums!
            </CardTitle>
            <CardDescription className="pt-2">
              Please create a username to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-md">Username</Label>
              <Input
                id="username"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12 text-lg font-bold">
              Save & Play
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
