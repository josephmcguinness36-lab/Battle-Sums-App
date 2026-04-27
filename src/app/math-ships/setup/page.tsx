
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, X, Divide, Ship } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Operator } from '@/lib/gameLogic';
import { Loader2 } from 'lucide-react';

const operators: { op: Operator; name: string, Icon: React.ElementType }[] = [
    { op: '+', name: 'Addition', Icon: Plus },
    { op: '-', name: 'Subtraction', Icon: Minus },
    { op: '×', name: 'Multiplication', Icon: X },
    { op: '÷', name: 'Division', Icon: Divide },
];

const newDifficultyLevels = {
    multiples: {
        'multiples_1': { label: 'Multiples of 1', base: 1 },
        'multiples_2': { label: 'Multiples of 2', base: 2 },
        'multiples_3': { label: 'Multiples of 3', base: 3 },
        'multiples_4': { label: 'Multiples of 4', base: 4 },
        'multiples_5': { label: 'Multiples of 5', base: 5 },
        'multiples_6': { label: 'Multiples of 6', base: 6 },
        'multiples_7': { label: 'Multiples of 7', base: 7 },
        'multiples_8': { label: 'Multiples of 8', base: 8 },
        'multiples_9': { label: 'Multiples of 9', base: 9 },
        'multiples_10': { label: 'Multiples of 10', base: 10 },
    },
    random: {
        easy: {
            label: 'Easy - Cadet',
            options: {
                'random_easy_20': { label: 'Numbers to 20', min: 0, max: 20 },
                'random_easy_50': { label: 'Numbers to 50', min: 0, max: 50 },
            }
        },
        medium: {
            label: 'Medium - Captain',
            options: {
                'random_medium_100': { label: 'Numbers 50 to 100', min: 50, max: 100 },
                'random_medium_500': { label: 'Numbers 100 to 500', min: 100, max: 500 },
            }
        },
        difficult: {
            label: 'Difficult - Admiral',
            options: {
                'random_difficult_1000': { label: 'Numbers 500 to 1000', min: 500, max: 1000 },
                'random_difficult_5000': { label: 'Numbers 1000 to 5000', min: 1000, max: 5000 },
            }
        },
        expert: {
            label: 'Expert - Supreme Commander',
            options: {
                'random_expert_neg': { label: 'Negative numbers -200 to -1', min: -200, max: -1 },
                'random_expert_large': { label: 'Large numbers 100 to 10,000', min: 100, max: 10000 },
            }
        }
    }
};

type GameMode = 'multiples' | 'random';

export default function MathShipsSetupPage() {
    const router = useRouter();
    const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
    const [gameMode, setGameMode] = useState<GameMode>('random');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
    const [username, setUsername] = useState<string | null>(null);
    const [rank, setRank] = useState<string | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('sumz_user');
        if (savedUser) {
            setUsername(savedUser);
        }
        const savedProgress = localStorage.getItem('sumz_progress');
        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);
                const rankMap: Record<string, string> = {
                    'random_medium': 'Captain',
                    'random_difficult': 'Admiral',
                    'random_expert': 'Supreme Commander',
                };
                setRank(rankMap[progress.math_ships_rank] || '');
            } catch (e) {
                console.error("Failed to parse progress from localStorage", e);
            }
        }
    }, []);

    const handleStartGame = () => {
        if (selectedOperator && selectedDifficulty) {
            router.push(`/math-ships?operator=${encodeURIComponent(selectedOperator)}&difficulty=${selectedDifficulty}`);
        }
    };

    const renderDifficultyOptions = () => {
        const levels = newDifficultyLevels[gameMode];
        if (!levels) return null;

        if (gameMode === 'multiples') {
            return (
                 <Select onValueChange={(value: string) => setSelectedDifficulty(value)}>
                    <SelectTrigger id="difficulty" className="h-12">
                        <SelectValue placeholder="Select a multiple" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(levels).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{(value as {label: string}).label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        if (gameMode === 'random') {
            const groupedLevels = levels as typeof newDifficultyLevels.random;
            return (
                 <Select onValueChange={(value: string) => setSelectedDifficulty(value)}>
                    <SelectTrigger id="difficulty" className="h-12">
                        <SelectValue placeholder="Select a difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(groupedLevels).map(([groupKey, group]) => (
                            <SelectGroup key={groupKey}>
                                <SelectLabel>{group.label}</SelectLabel>
                                {Object.entries(group.options).map(([levelKey, level]) => (
                                    <SelectItem key={levelKey} value={levelKey}>{level.label}</SelectItem>
                                ))}
                            </SelectGroup>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        return null;
    }

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline flex items-center justify-center gap-4">
                    <Ship className="w-10 h-10" />
                    Math Ships
                </h1>
                <p className="mt-4 text-lg text-muted-foreground h-7">
                    {username ? (
                        <>
                           Welcome, <span className="font-bold text-primary">{rank} {username}</span>! Configure your game and prepare for battle.
                        </>
                    ) : (
                       'Configure your game and prepare for battle!'
                    )}
                </p>
            </div>
            <Card className="max-w-lg mx-auto shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Game Setup</CardTitle>
                    <CardDescription>
                        Choose your operation, game mode, and difficulty.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div>
                        <Label className="text-lg font-semibold mb-2 block">1. Select Operation</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {operators.map(({ op, name, Icon }) => (
                                <Button
                                    key={op}
                                    variant={selectedOperator === op ? 'default' : 'outline'}
                                    className="h-16 text-lg flex-col gap-1"
                                    onClick={() => setSelectedOperator(op)}
                                >
                                    <Icon className="h-7 w-7" />
                                    <span>{name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <Label className="text-lg font-semibold mb-2 block">2. Select Game Mode</Label>
                        <div className="grid grid-cols-2 gap-4">
                             <Button
                                variant={gameMode === 'multiples' ? 'default' : 'outline'}
                                className="h-12 text-lg"
                                onClick={() => { setGameMode('multiples'); setSelectedDifficulty(''); }}
                            >
                                Play Multiples
                            </Button>
                             <Button
                                variant={gameMode === 'random' ? 'default' : 'outline'}
                                className="h-12 text-lg"
                                onClick={() => { setGameMode('random'); setSelectedDifficulty(''); }}
                            >
                                Play Random
                            </Button>
                        </div>
                    </div>

                    <div>
                         <Label htmlFor="difficulty" className="text-lg font-semibold mb-2 block">3. Select Difficulty</Label>
                         {renderDifficultyOptions()}
                    </div>
                    <Button
                        onClick={handleStartGame}
                        disabled={!selectedOperator || !selectedDifficulty}
                        className="w-full h-14 text-xl font-bold"
                    >
                        Start Game
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
