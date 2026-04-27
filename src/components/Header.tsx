'use client';

import Link from 'next/link';
import { Calculator, Trophy, Star, Ship, Medal, Plus, Minus, X, Divide } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from 'react';

type TrophyRecord = {
    operator: '+' | '-' | '×' | '÷';
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

export default function Header() {
  const [stats, setStats] = useState<{
    trophies: Record<string, TrophyRecord>;
    stars: number;
    medals: number;
    math_ships_rank: string;
  }>({ trophies: {}, stars: 0, medals: 0, math_ships_rank: '' });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render
    setIsClient(true);
    const updateStats = () => {
        const savedProgress = localStorage.getItem('sumz_progress');
        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);

                if (progress && typeof progress === 'object') {
                  const rankMap: Record<string, string> = {
                      'random_medium': 'Captain',
                      'random_difficult': 'Admiral',
                      'random_expert': 'Supreme Commander',
                  };

                  setStats({
                      trophies: progress.trophies || {},
                      stars: progress.stars || 0,
                      medals: progress.medals || 0,
                      math_ships_rank: rankMap[progress.math_ships_rank] || '',
                  });
                }
            } catch (e) {
                console.error("Failed to parse progress from localStorage", e);
            }
        }
    }

    // Update stats on mount
    updateStats();
    
    // Also update stats when storage changes (e.g. from another tab)
    window.addEventListener('storage', updateStats);
    
    // Custom event to trigger updates from within the app
    const handleProgressUpdate = () => updateStats();
    window.addEventListener('sumz_progress_updated', handleProgressUpdate);

    return () => {
        window.removeEventListener('storage', updateStats);
        window.removeEventListener('sumz_progress_updated', handleProgressUpdate);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-14 h-auto py-2 sm:py-0 sm:h-14 max-w-screen-2xl items-center justify-between flex-wrap gap-y-2">
        <div className="flex items-center">
            <Link
                href="/mode"
                className="flex items-center gap-2"
            >
                <span className="text-2xl font-extrabold text-primary font-headline">
                    Battle Sums
                </span>
            </Link>
        </div>

        {isClient && (
          <div className="flex items-center justify-center gap-4 sm:-ml-8 order-last sm:order-none w-full sm:w-auto pb-1 sm:pb-0">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center gap-1 text-muted-foreground cursor-pointer" title="Rounds completed">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
                      <span className="font-bold text-sm">{stats.stars}</span>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Star className="h-6 w-6 text-yellow-500 fill-yellow-400"/>Rounds Completed</DialogTitle>
                    <DialogDescription>
                      You have successfully completed {stats.stars} rounds in Challenge Mode. Each star represents a round won. Keep up the great work!
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center gap-1 text-muted-foreground cursor-pointer" title="Challenges completed">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <span className="font-bold text-sm">{Object.keys(stats.trophies).length}</span>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Trophy className="h-6 w-6 text-yellow-600"/>Challenges Completed</DialogTitle>
                    <DialogDescription>
                      Here are the highest levels you have completed for each operation in Challenge Mode.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {Object.values(stats.trophies).length > 0 ? (
                      Object.values(stats.trophies).map((trophy, index) => {
                        const opDetails = operatorDetails[trophy.operator];
                        return (
                          <div key={index} className="flex items-center gap-4 p-2 bg-secondary rounded-md">
                            {opDetails && <opDetails.Icon className="h-6 w-6 text-primary" />}
                            <div>
                                <p className="font-bold">{opDetails.name} Champion</p>
                                <p className="text-sm">{trophy.levelName}, Round {trophy.round}</p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-center text-muted-foreground">No trophies earned yet. Play Challenge Mode to earn them!</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center gap-1 text-muted-foreground cursor-pointer" title="Math Ships battles won">
                      <Medal className="h-5 w-5 text-amber-600" />
                      <span className="font-bold text-sm">{stats.medals}</span>
                      {stats.math_ships_rank && <span className="font-semibold text-xs ml-1 text-amber-700">({stats.math_ships_rank})</span>}
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Medal className="h-6 w-6 text-amber-600"/>Math Ships Battles Won</DialogTitle>
                    <DialogDescription>
                       You have won {stats.medals} battles in Math Ships.
                       {stats.math_ships_rank && ` Your current rank is ${stats.math_ships_rank}.`}
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
          </div>
        )}
        
        <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/tables" passHref>
                    <Button variant="ghost" size="icon">
                      <Calculator className="h-5 w-5" />
                      <span className="sr-only">Tables</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Math Tables</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/math-ships/setup" passHref>
                    <Button variant="ghost" size="icon">
                      <Ship className="h-5 w-5" />
                      <span className="sr-only">Math Ships</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Math Ships</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
