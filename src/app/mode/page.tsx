'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Zap, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ModeSelectionPage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const challengeImage = PlaceHolderImages.find(p => p.id === 'challengeMode');
  const freePlayImage = PlaceHolderImages.find(p => p.id === 'freePlayMode');


  useEffect(() => {
    const savedUser = localStorage.getItem('sumz_user');
    if (!savedUser) {
      router.replace('/');
    } else {
      setUsername(savedUser);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
          Welcome, <span className="text-primary">{username}!</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose a game mode to start practicing your math skills.
        </p>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/challenge" passHref>
          <Card className="flex flex-col shadow-xl hover:shadow-2xl transition-shadow h-full cursor-pointer">
            {challengeImage && <Image src={challengeImage.imageUrl} alt={challengeImage.description} width={600} height={400} className="rounded-t-lg object-cover h-60 w-full" data-ai-hint={challengeImage.imageHint}/>}
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold"><Zap/> Challenge Mode</CardTitle>
              <CardDescription>Test your speed and accuracy in a series of timed challenges.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/free-play" passHref>
          <Card className="flex flex-col shadow-xl hover:shadow-2xl transition-shadow h-full cursor-pointer">
              {freePlayImage && <Image src={freePlayImage.imageUrl} alt={freePlayImage.description} width={600} height={400} className="rounded-t-lg object-cover h-60 w-full" data-ai-hint={freePlayImage.imageHint} />}
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold"><SlidersHorizontal/> Free Play</CardTitle>
              <CardDescription>
                Customize your own practice session by picking the rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

    

    
