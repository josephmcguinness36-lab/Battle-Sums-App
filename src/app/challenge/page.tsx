'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Trophy, Plus, Minus, X, Divide, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from 'next/link';

type Operator = '+' | '-' | '×' | '÷';

type TrophyRecord = {
    operator: Operator;
    levelName: string;
    round: number;
    date: string;
};

const operatorDetails = {
    '+': { name: 'Addition', Icon: Plus },
    '-': { name: 'Subtraction', Icon: Minus },
    '×': { name: 'Multiplication', Icon: X },
    '÷': { name: 'Division', Icon: Divide },
};

export default function ChallengePage() {
  const router = useRouter();
  const [trophies, setTrophies] = useState<Record<string, TrophyRecord>>({});

  useEffect(() => {
    const savedProgress = localStorage.getItem('sumz_progress');
    if (savedProgress) {
        try {
            const progress = JSON.parse(savedProgress);
            if (progress.trophies && typeof progress.trophies === 'object' && !Array.isArray(progress.trophies)) {
                 setTrophies(progress.trophies);
            }
        } catch (e) {
            console.error("Failed to parse progress from localStorage", e);
            localStorage.removeItem('sumz_progress');
        }
    }
  }, []);

  const handleStartChallenge = (startLevel: 'easy' | 'medium' | 'difficult') => {
    router.push(`/game?mode=challenge&startLevel=${startLevel}`);
  };
  
  return (
    <div className="container py-12">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
                Challenge Mode
            </h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          How far can your math skills take you? The ultimate test of speed and accuracy.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
            <BrainCircuit className="w-16 h-16 mx-auto text-primary" />
            <CardTitle className="text-3xl font-bold mt-4">The Arena</CardTitle>
            <CardDescription className="text-md mt-2">
                Test your mettle and see how many levels you can clear. The questions get harder and the timer gets faster. Only the best will triumph!
            </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-center">Choose Your Starting Point</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button onClick={() => handleStartChallenge('easy')} className="h-20 text-lg font-bold">
                      Easy
                  </Button>
                  <Button onClick={() => handleStartChallenge('medium')} className="h-20 text-lg font-bold">
                      Medium
                  </Button>
                  <Button onClick={() => handleStartChallenge('difficult')} className="h-20 text-lg font-bold">
                      Difficult
                  </Button>
              </div>
            </div>

            {Object.keys(trophies).length > 0 && (
                <div className="pt-6 border-t">
                    <h3 className="text-xl font-semibold mb-4 text-center">Your Trophies</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {Object.values(trophies).map((trophy, index) => {
                            const opDetails = operatorDetails[trophy.operator as Operator];
                            return (
                                <Dialog key={index}>
                                    <DialogTrigger asChild>
                                        <button className="p-2 bg-yellow-100 rounded-full relative cursor-pointer">
                                            <Trophy className="w-10 h-10 text-yellow-500"/>
                                            {opDetails && <opDetails.Icon className="absolute bottom-1 right-1 w-4 h-4 text-yellow-700 bg-white rounded-full p-0.5" />}
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Trophy className="w-6 h-6 text-yellow-500"/>
                                            {opDetails.name} Champion
                                        </DialogTitle>
                                        <DialogDescription>
                                            You earned this trophy for your exceptional skill in {opDetails.name.toLowerCase()}.
                                        </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="font-semibold text-lg">{trophy.levelName}, Round {trophy.round}</div>
                                            <div className="text-sm text-muted-foreground">Earned on {new Date(trophy.date).toLocaleDateString()}</div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )
                        })}
                    </div>
                </div>
            )}
             <div className="pt-6 border-t">
                <Link href="/time-trial">
                    <Button variant="secondary" className="w-full h-14 text-xl font-bold">
                        <Timer className="mr-2 h-6 w-6"/> 5-Second Time Trial
                    </Button>
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
