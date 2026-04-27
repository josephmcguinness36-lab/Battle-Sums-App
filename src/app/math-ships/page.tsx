

'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Target, Waves, AlertTriangle, Crosshair, Loader2, Medal, Repeat, Home, Shuffle, Keyboard, Delete } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Operator } from '@/lib/gameLogic';


// --- Start of consolidated math-ships-logic.ts ---

const GRID_SIZE = 10;
const SHIPS = [
    { id: 'carrier', name: 'Carrier', size: 5 },
    { id: 'battleship', name: 'Battleship', size: 4 },
    { id: 'cruiser', name: 'Cruiser', size: 3 },
    { id: 'submarine', name: 'Submarine', size: 3 },
    { id: 'destroyer', name: 'Destroyer', size: 2 },
];

type CellStatus = 'hidden' | 'hit' | 'miss' | 'sunk';
type Cell = {
    status: CellStatus;
    shipId: string | null;
};
type GameBoard = Cell[][];
type GameState = 'setup' | 'playing' | 'finished';
type Player = {
    board: GameBoard;
    ships: Record<string, { id: string; name: string; size: number, hits: number, isSunk: boolean }>;
};

type Question = {
  text: string;
  answer: number;
};

// Moved to setup/page.tsx as it's only used there.
// const newDifficultyLevels = { ... };

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const findDifficultyConfig = (difficultyKey: string) => {
    // This is a simplified version since newDifficultyLevels is not here.
    // It infers config from the key. A better approach might be needed if logic becomes complex.
    if (difficultyKey.startsWith('multiples')) {
        const base = parseInt(difficultyKey.split('_')[1], 10);
        return { base };
    }
    if (difficultyKey.startsWith('random')) {
        const parts = difficultyKey.split('_');
        const rangeLabel = parts[2];
        let min = 0, max = 20;

        if (parts[1] === 'easy') {
            if (rangeLabel === '50') { min = 0; max = 50; } else { min = 0; max = 20; }
        } else if (parts[1] === 'medium') {
            if (rangeLabel === '100') { min = 50; max = 100; } else { min = 100; max = 500; }
        } else if (parts[1] === 'difficult') {
            if (rangeLabel === '1000') { min = 500; max = 1000; } else { min = 1000; max = 5000; }
        } else if (parts[1] === 'expert') {
            if (rangeLabel === 'neg') { min = -200; max = -1; } else { min = 100; max = 10000; }
        }
        return { min, max };
    }
    return null;
}

const getAxisLabels = (difficultyKey: string, isHorizontal: boolean): (number | string)[] => {
    if (isHorizontal && difficultyKey.startsWith('random_')) {
        return Array.from({ length: GRID_SIZE }, (_, i) => String.fromCharCode(65 + i));
    }
    if (difficultyKey.startsWith('multiples_')) {
        const config = findDifficultyConfig(difficultyKey);
        const base = (config as { base: number })?.base || 1;
        return Array.from({ length: GRID_SIZE }, (_, i) => (i + 1) * base);
    }
    return Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
};


const createEmptyBoard = (): GameBoard => {
    return Array(GRID_SIZE).fill(null).map(() => 
        Array(GRID_SIZE).fill(null).map(() => ({
            status: 'hidden',
            shipId: null,
        }))
    );
};

const placeShipsRandomly = (board: GameBoard): GameBoard => {
    let newBoard = JSON.parse(JSON.stringify(board));

    for (const ship of SHIPS) {
        let placed = false;
        while (!placed) {
            const isVertical = Math.random() < 0.5;
            const startRow = Math.floor(Math.random() * (GRID_SIZE - (isVertical ? ship.size : 0)));
            const startCol = Math.floor(Math.random() * (GRID_SIZE - (isVertical ? 0 : ship.size)));

            let canPlace = true;
            for (let i = 0; i < ship.size; i++) {
                const row = startRow + (isVertical ? i : 0);
                const col = startCol + (isVertical ? 0 : i);

                if (row >= GRID_SIZE || col >= GRID_SIZE || newBoard[row][col].shipId) {
                    canPlace = false;
                    break;
                }
            }

            if (canPlace) {
                for (let i = 0; i < ship.size; i++) {
                    const row = startRow + (isVertical ? i : 0);
                    const col = startCol + (isVertical ? 0 : i);
                    newBoard[row][col].shipId = ship.id;
                }
                placed = true;
            }
        }
    }
    return newBoard;
};

const setupGame = (): { player: Player; opponent: Player } => {
    const playerShips = SHIPS.reduce((acc, ship) => {
        acc[ship.id] = { ...ship, hits: 0, isSunk: false, name: ship.name };
        return acc;
    }, {} as Player['ships']);

    const opponentShips = SHIPS.reduce((acc, ship) => {
        acc[ship.id] = { ...ship, hits: 0, isSunk: false, name: ship.name };
        return acc;
    }, {} as Player['ships']);

    const playerBoard = placeShipsRandomly(createEmptyBoard());
    const opponentBoard = placeShipsRandomly(createEmptyBoard());

    return {
        player: { board: playerBoard, ships: playerShips },
        opponent: { board: opponentBoard, ships: opponentShips },
    };
};

const generateMathShipsQuestion = (
    rowValue: number,
    colValue: number,
    difficultyKey: string,
    operator: Operator
): Question => {
    
    let num1 = rowValue;
    let num2 = colValue;
    let questionText: string;
    let answer: number;

    const config = findDifficultyConfig(difficultyKey);

    if (difficultyKey.startsWith('random_')) {
        const { min, max } = (config as { min: number, max: number }) || { min: 0, max: 20 };
        num1 = getRandomInt(min, max);
        num2 = getRandomInt(min, max);
    }

    switch (operator) {
        case '+':
            answer = num1 + num2;
            questionText = `${num1} + ${num2}`;
            break;
        case '-':
             if (num1 < num2) [num1, num2] = [num2, num1];
             if (num1 === num2) num1 += 1;
             answer = num1 - num2;
             questionText = `${num1} - ${num2}`;
            break;
        case '×':
            answer = num1 * num2;
            questionText = `${num1} × ${num2}`;
            break;
        case '÷':
            if (num2 === 0) num2 = 1; 
            const product = num1 * num2;
            answer = num1;
            questionText = `${product} ÷ ${num2}`;
            break;
        default:
            answer = num1 + num2;
            questionText = `${num1} + ${num2}`;
    }

    return { text: questionText, answer };
};

const Keypad = ({ onKeyPress, onBackspace, onSubmit }: { onKeyPress: (key: string) => void; onBackspace: () => void; onSubmit: () => void; }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    return (
        <div className="grid grid-cols-3 gap-2 mt-4 p-2 bg-secondary/50 rounded-lg">
            {keys.map(key => (
                <Button key={key} variant="outline" className="h-12 text-xl font-bold" onClick={() => onKeyPress(key)}>
                    {key}
                </Button>
            ))}
             <Button variant="outline" className="h-12" onClick={onBackspace}>
                <Delete className="h-6 w-6" />
            </Button>
            <Button className="h-12 col-span-2 text-lg" onClick={onSubmit}>
                Submit
            </Button>
        </div>
    );
};

// --- End of consolidated math-ships-logic.ts ---


const Grid = ({ board, onCellClick, isPlayer, isFinished, currentTarget, firingTarget, axisLabelsX, axisLabelsY }: { board: GameBoard; onCellClick: (row: number, col: number) => void; isPlayer: boolean, isFinished: boolean, currentTarget: {row: number, col: number} | null; firingTarget: {row: number, col: number} | null; axisLabelsX: (string|number)[], axisLabelsY: (string|number)[] }) => {
    return (
        <div className="grid grid-cols-11 gap-1 bg-blue-200 p-2 rounded-lg">
            {/* Header Row */}
            <div />
            {axisLabelsX.map((label, i) => (
                <div key={`header-${i}`} className="w-8 h-8 flex items-center justify-center font-bold text-blue-800">{label}</div>
            ))}

            {board.map((row, rowIndex) => (
                <React.Fragment key={`row-wrapper-${rowIndex}`}>
                    {/* Row Header */}
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-blue-800">{axisLabelsY[rowIndex]}</div>
                    {/* Grid Cells */}
                    {row.map((cell, colIndex) => {
                        const isTargeted = (!isPlayer && currentTarget?.row === rowIndex && currentTarget?.col === colIndex);
                        const isFiring = firingTarget?.row === rowIndex && firingTarget?.col === colIndex;
                        return (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => !isPlayer && onCellClick(rowIndex, colIndex)}
                                disabled={isPlayer || cell.status !== 'hidden' || isFinished || firingTarget !== null}
                                className={cn(
                                    "w-8 h-8 flex items-center justify-center rounded-md transition-colors text-white relative",
                                    {
                                        "bg-blue-400 hover:bg-blue-500": cell.status === 'hidden' && !isPlayer,
                                        "bg-blue-300 cursor-default": cell.status === 'hidden' && isPlayer,
                                        "bg-gray-400": cell.status === 'miss',
                                        "bg-red-500 animate-explosion": cell.status === 'hit',
                                        "bg-gray-700": cell.status === 'sunk',
                                        "bg-yellow-400": isFiring && !isPlayer,
                                        "bg-purple-400": isFiring && isPlayer,
                                    }
                                )}
                            >
                                {cell.status === 'hit' && <Target className="w-6 h-6 animate-hit-glow" />}
                                {cell.status === 'miss' && <Waves className="w-5 h-5 opacity-50" />}
                                {cell.status === 'sunk' && <Ship className="w-5 h-5" />}
                                {isPlayer && cell.shipId && cell.status === 'hidden' && <Ship className="w-5 h-5 text-gray-600" />}
                                {isTargeted && !isFiring && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-500/50 animate-targeting"></div>
                                    </div>
                                )}
                                {isFiring && <Crosshair className="w-6 h-6 text-black animate-flashing" />}
                            </button>
                        )
                    })}
                </React.Fragment>
            ))}
        </div>
    );
};

type OpponentAIState = {
    mode: 'hunt' | 'target';
    potentialTargets: { row: number; col: number }[];
    hits: { row: number; col: number }[];
};

function MathShipsGame() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

    const [isClient, setIsClient] = useState(false);
    const [gameState, setGameState] = useState<GameState>('setup');
    const [player, setPlayer] = useState<Player | null>(null);
    const [opponent, setOpponent] = useState<Player | null>(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    
    const [attackModalOpen, setAttackModalOpen] = useState(false);
    const [currentTarget, setCurrentTarget] = useState<{row: number, col: number} | null>(null);
    const [firingTarget, setFiringTarget] = useState<{row: number, col: number} | null>(null);
    const [opponentFiringTarget, setOpponentFiringTarget] = useState<{row: number, col: number} | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const [showKeypad, setShowKeypad] = useState(false);
    
    const gameStateRef = useRef(gameState);
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    const opponentAIState = useRef<OpponentAIState>({
        mode: 'hunt',
        potentialTargets: [],
        hits: [],
    });


    const operator = (searchParams.get('operator') as Operator) || '+';
    const difficulty = searchParams.get('difficulty') || 'random_easy_20';
    
    const axisLabelsX = useMemo(() => getAxisLabels(difficulty, true), [difficulty]);
    const axisLabelsY = useMemo(() => getAxisLabels(difficulty, false), [difficulty]);
    
    const startGame = useCallback(() => {
        const { player, opponent } = setupGame();
        setPlayer(player);
        setOpponent(opponent);
        setGameState('playing');
        setIsPlayerTurn(true);
        setWinner(null);
        setGameStarted(false);
        opponentAIState.current = {
            mode: 'hunt',
            potentialTargets: [],
            hits: [],
        };
    }, []);

    useEffect(() => {
        setIsClient(true);
        startGame();
    }, [startGame]);

    const checkWinCondition = useCallback((p: Player) => {
        return Object.values(p.ships).every(ship => ship.isSunk);
    }, []);
    
    const handleShufflePlayerShips = useCallback(() => {
        startGame();
        toast({
            title: "Fleet Redeployed!",
            description: "The entire battle has been reset.",
            duration: 2000
        });
    }, [startGame, toast]);

    const updatePlayerCellStatus = useCallback((row: number, col: number, status: CellStatus): string | null => {
        let sunkShipName: string | null = null;
        setPlayer(prevPlayer => {
            if (!prevPlayer) return null;

            const newBoard = JSON.parse(JSON.stringify(prevPlayer.board));
            const newPlayerState = { ...prevPlayer, board: newBoard };
            newPlayerState.board[row][col] = { ...newPlayerState.board[row][col], status: status };

            if (status === 'hit') {
                const shipId = newPlayerState.board[row][col].shipId;
                if (shipId) {
                    const newShips = { ...newPlayerState.ships };
                    const ship = { ...newShips[shipId] };
                    ship.hits += 1;
                    if (ship.hits === ship.size) {
                        ship.isSunk = true;
                        sunkShipName = ship.name;
                        // Mark all cells of the sunk ship
                        for (let r = 0; r < GRID_SIZE; r++) {
                            for (let c = 0; c < GRID_SIZE; c++) {
                                if (newPlayerState.board[r][c].shipId === shipId) {
                                    newPlayerState.board[r][c].status = 'sunk';
                                }
                            }
                        }
                    }
                    newShips[shipId] = ship;
                    newPlayerState.ships = newShips;
                }
            }
            
            if (checkWinCondition(newPlayerState)) {
                setWinner('Opponent');
                setGameState('finished');
            }
            
            return newPlayerState;
        });

        return sunkShipName;
    }, [checkWinCondition]);


    const opponentTurn = useCallback(() => {
        if (gameStateRef.current !== 'playing' || !player) return;

        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
            let row: number, col: number;
            const ai = opponentAIState.current;

            if (ai.potentialTargets.length > 0) {
                const target = ai.potentialTargets.shift()!;
                row = target.row;
                col = target.col;
            } else {
                 ai.mode = 'hunt';
                 ai.hits = [];
                let attempts = 0;
                do {
                    row = Math.floor(Math.random() * GRID_SIZE);
                    col = Math.floor(Math.random() * GRID_SIZE);
                    attempts++;
                } while (
                    player.board[row]?.[col]?.status !== 'hidden' && attempts < 100
                );
                // If we can't find a target after 100 tries, something is wrong, so we just pick the first available.
                if (player.board[row]?.[col]?.status !== 'hidden') {
                    for(let r = 0; r < GRID_SIZE; r++) {
                        for(let c = 0; c < GRID_SIZE; c++) {
                            if (player.board[r][c].status === 'hidden') {
                                row = r;
                                col = c;
                                break;
                            }
                        }
                    }
                }
            }
            
            const targetCell = player.board[row]?.[col];
            if (!targetCell || targetCell.status !== 'hidden') {
                 if(ai.potentialTargets.length === 0) {
                    ai.mode = 'hunt';
                    ai.hits = [];
                 }
                 if(gameStateRef.current === 'playing') opponentTurn();
                 return;
            }


            const questionRowValue = axisLabelsY[row] as number;
            const questionColValue = difficulty.startsWith('random_') ? (col + 1) : (axisLabelsX[col] as number);

            const question = generateMathShipsQuestion(questionRowValue, questionColValue, difficulty, operator);
            
            const isOpponentCorrect = Math.random() < 0.97;

            if (!isOpponentCorrect) {
                if(gameStateRef.current === 'playing') {
                    toast({
                        title: 'Opponent Misfired!',
                        description: "The opponent answered incorrectly. Your turn!",
                        duration: 3000
                    });
                    setIsPlayerTurn(true);
                }
                return;
            }

            if(gameStateRef.current === 'playing') {
                toast({ 
                    title: 'Opponent Firing!', 
                    description: (
                        <div>
                            <p>Target: ({axisLabelsY[row]}, {axisLabelsX[col]})</p>
                            <p className="font-mono animate-answer-reveal">{question.text} = {question.answer}</p>
                        </div>
                    ),
                    duration: 4000
                });
            }
            
            setOpponentFiringTarget({ row, col });

            setTimeout(() => {
                let wasHit = false;
                let sunkShipName: string | null = null;

                if (targetCell.shipId) {
                    wasHit = true;
                    sunkShipName = updatePlayerCellStatus(row, col, 'hit');
                } else {
                    updatePlayerCellStatus(row, col, 'miss');
                }
                
                if (sunkShipName) {
                    toast({title: `Your ${sunkShipName} has been sunk!`, variant: 'destructive'});
                }

                if(wasHit) {
                    ai.mode = 'target';
                    ai.hits.push({row, col});

                    if(sunkShipName) {
                        ai.mode = 'hunt';
                        ai.potentialTargets = [];
                        ai.hits = [];
                    } else {
                        const addPotentialTarget = (r: number, c: number) => {
                            if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && player.board[r][c].status === 'hidden') {
                               if (!ai.potentialTargets.some(t => t.row === r && t.col === c)) {
                                  ai.potentialTargets.push({ row: r, col: c });
                               }
                            }
                        };
                        
                        if(ai.hits.length >= 2) {
                            ai.potentialTargets = []; 
                            const isVertical = ai.hits[0].col === ai.hits[1].col;
                            const minRow = Math.min(...ai.hits.map(h => h.row));
                            const maxRow = Math.max(...ai.hits.map(h => h.row));
                            const minCol = Math.min(...ai.hits.map(h => h.col));
                            const maxCol = Math.max(...ai.hits.map(h => h.col));

                            if(isVertical) {
                                addPotentialTarget(minRow - 1, ai.hits[0].col);
                                addPotentialTarget(maxRow + 1, ai.hits[0].col);
                            } else { 
                                addPotentialTarget(ai.hits[0].row, minCol - 1);
                                addPotentialTarget(ai.hits[0].row, maxCol + 1);
                            }
                        } else { 
                           addPotentialTarget(row - 1, col);
                           addPotentialTarget(row + 1, col);
                           addPotentialTarget(row, col - 1);
                           addPotentialTarget(row, col + 1);
                        }
                    }

                }

                setOpponentFiringTarget(null);
                if (gameStateRef.current === 'playing') {
                    setIsPlayerTurn(true);
                    toast({ title: "Your turn!", duration: 1500 });
                }
            }, 2000);

        }, 1500);

    }, [player, difficulty, operator, axisLabelsX, axisLabelsY, updatePlayerCellStatus, toast]);

    const switchTurns = useCallback(() => {
        if (gameStateRef.current !== 'playing') return;
        setGameStarted(true);
        setIsPlayerTurn(false);
        opponentTurn();
    }, [opponentTurn]);
    
    const updateOpponentCellStatus = useCallback((row: number, col: number, status: CellStatus) => {
        if (!opponent) return;

        let gameJustEnded = false;
        const newOpponentState = JSON.parse(JSON.stringify(opponent));
        newOpponentState.board[row][col].status = status;

        if (status === 'hit') {
            const shipId = newOpponentState.board[row][col].shipId;
            if (shipId) {
                const ship = newOpponentState.ships[shipId];
                ship.hits += 1;
                if (ship.hits === ship.size) {
                    ship.isSunk = true;
                    if(gameStateRef.current === 'playing') {
                         toast({ title: `You sunk their ${ship.name}!`, className: 'bg-green-100' });
                    }
                     for (let r = 0; r < GRID_SIZE; r++) {
                        for (let c = 0; c < GRID_SIZE; c++) {
                            if (newOpponentState.board[r][c].shipId === shipId) {
                                newOpponentState.board[r][c].status = 'sunk';
                            }
                        }
                    }
                }
            }
        }
        
        if (checkWinCondition(newOpponentState)) {
            setWinner('Player');
            setGameState('finished');
            gameJustEnded = true;
             try {
                const savedProgress = localStorage.getItem('sumz_progress');
                let progress = savedProgress ? JSON.parse(savedProgress) : { trophies: {}, totalSumsCompleted: 0, stars: 0, medals: 0 };
                progress.medals = (progress.medals || 0) + 1;

                const ranks: Record<string, number> = {
                    'random_easy': 1, 'random_medium': 2, 'random_difficult': 3, 'random_expert': 4,
                    'multiples': 1,
                };
                
                let difficultyKey = difficulty.replace(/_(\d+|[a-z]+)$/, '');
                if (difficulty.startsWith('multiples')) difficultyKey = 'multiples';

                const currentRank = ranks[difficultyKey] || 0;
                const savedRank = ranks[progress.math_ships_rank || ''] || 0;

                if (currentRank > savedRank) {
                    progress.math_ships_rank = difficultyKey;
                }

                localStorage.setItem('sumz_progress', JSON.stringify(progress));
                window.dispatchEvent(new CustomEvent('sumz_progress_updated'));
            } catch(e) {
                console.error("Could not update medal count in localStorage", e);
            }
        }
        
        setOpponent(newOpponentState);
        return gameJustEnded;
    }, [opponent, checkWinCondition, toast, difficulty]);
    
    const handleCellClick = (row: number, col: number) => {
        if (!isPlayerTurn || gameStateRef.current !== 'playing' || !opponent || firingTarget || opponentFiringTarget) return;

        const targetCell = opponent.board[row][col];
        if (targetCell.status !== 'hidden') {
            toast({ title: "You've already fired there!", variant: 'destructive', duration: 2000 });
            return;
        }
        
        setCurrentTarget({ row, col });
        const questionRowValue = axisLabelsY[row] as number;
        const questionColValue = difficulty.startsWith('random_') ? (col + 1) : (axisLabelsX[col] as number);
        const question = generateMathShipsQuestion(questionRowValue, questionColValue, difficulty, operator);
        setCurrentQuestion(question);
        setAttackModalOpen(true);
    };

    const handleAnswerSubmit = () => {
        if (!currentTarget || !currentQuestion || !opponent) return;
    
        const isCorrect = parseInt(userAnswer, 10) === currentQuestion.answer;
    
        if (!isCorrect) {
            setShowCorrectAnswer(true);
            setTimeout(() => {
                setAttackModalOpen(false);
                setUserAnswer('');
                setShowCorrectAnswer(false);
                
                if (gameStateRef.current === 'playing') {
                    toast({
                        variant: "destructive",
                        title: "Incorrect Answer!",
                        description: `Your turn is forfeit. The correct answer was ${currentQuestion.answer}.`,
                    });
                }
                
                setCurrentTarget(null);
                setCurrentQuestion(null);
                switchTurns();
            }, 1500);
            return;
        }

        setAttackModalOpen(false);
        setUserAnswer('');
        setFiringTarget(currentTarget);
    
        setTimeout(() => {
            const targetCell = opponent.board[currentTarget.row][currentTarget.col];
            let gameJustEnded = false;
            if (targetCell.shipId) {
                gameJustEnded = updateOpponentCellStatus(currentTarget.row, currentTarget.col, 'hit');
                if (!gameJustEnded) {
                    toast({ title: 'Direct Hit!', description: "You landed a shot on an enemy ship!", className: 'bg-green-100' });
                }
            } else {
                gameJustEnded = updateOpponentCellStatus(currentTarget.row, currentTarget.col, 'miss');
                 if (!gameJustEnded) {
                    toast({ title: 'Miss!', description: "Your shot landed in empty water." });
                }
            }
    
            setFiringTarget(null);
            setCurrentTarget(null);
            setCurrentQuestion(null);
             if (gameStateRef.current === 'playing') {
                switchTurns();
            }
        }, 2000);
    };

    useEffect(() => {
        if (attackModalOpen && !showKeypad) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [attackModalOpen, showKeypad]);
    
    if (!isClient || gameState === 'setup' || !player || !opponent) {
        return (
          <div className="flex min-h-[80vh] items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 text-lg">Setting up the battlefield...</p>
          </div>
        );
    }

    const isFinished = gameState === 'finished';
    const opponentShipsLeft = opponent ? Object.values(opponent.ships).filter(s => !s.isSunk).length : SHIPS.length;
    const playerShipsLeft = player ? Object.values(player.ships).filter(s => !s.isSunk).length : SHIPS.length;

    if (isFinished) {
         return (
            <div className="container py-12 text-center">
                <Card className="max-w-md mx-auto shadow-2xl p-8">
                    {winner === 'Player' ? (
                        <>
                            <Medal className="mx-auto h-24 w-24 text-amber-500" />
                            <h1 className="text-4xl font-bold mt-6">Victory!</h1>
                            <p className="text-lg text-muted-foreground mt-2">You have defeated the enemy fleet and earned a medal!</p>
                        </>
                    ) : (
                         <>
                            <AlertTriangle className="mx-auto h-24 w-24 text-destructive" />
                            <h1 className="text-4xl font-bold mt-6">Defeat!</h1>
                            <p className="text-lg text-muted-foreground mt-2">The enemy fleet has defeated you. Better luck next time.</p>
                        </>
                    )}

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={startGame} className="h-12 text-lg">
                            <Repeat className="mr-2 h-5 w-5"/> Play Again
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/math-ships/setup')} className="h-12 text-lg">
                            <Home className="mr-2 h-5 w-5"/> Back to Setup
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div className="container py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline flex items-center justify-center gap-4">
                        <Ship className="w-10 h-10" />
                        Math Ships
                    </h1>
                     <div className="mt-4 text-xl font-semibold">
                        {isFinished ? (
                             <span>Game Over! {winner} wins!</span>
                        ) : isPlayerTurn ? (
                            <span className="text-primary animate-pulse">Your Turn</span>
                        ) : (
                            <span className="text-muted-foreground">Opponent's Turn...</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <Card className={cn((!isPlayerTurn || isFinished) && 'opacity-50')}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  Your Fleet
                                  {!gameStarted && (
                                    <Button onClick={handleShufflePlayerShips} variant="ghost" size="icon" className="h-6 w-6">
                                      <Shuffle className="w-4 h-4" />
                                    </Button>
                                  )}
                                </span>
                                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Ship className="w-4 h-4"/> Ships Left: {playerShipsLeft}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Grid board={player.board} onCellClick={() => {}} isPlayer={true} isFinished={isFinished} currentTarget={null} firingTarget={opponentFiringTarget} axisLabelsX={axisLabelsX} axisLabelsY={axisLabelsY} />
                        </CardContent>
                    </Card>
                    <Card className={cn(isPlayerTurn && !firingTarget && !opponentFiringTarget &&'border-primary border-2', (!isPlayerTurn || firingTarget || isFinished) && 'opacity-50')}>
                        <CardHeader>
                             <CardTitle className="flex items-center justify-between">
                                Enemy Waters
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Target className="w-4 h-4"/> Ships Left: {opponentShipsLeft}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Grid board={opponent.board} onCellClick={handleCellClick} isPlayer={false} isFinished={isFinished} currentTarget={currentTarget} firingTarget={firingTarget} axisLabelsX={axisLabelsX} axisLabelsY={axisLabelsY} />
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <Dialog open={attackModalOpen} onOpenChange={(open) => { if(!open) { setCurrentTarget(null); setShowCorrectAnswer(false); setShowKeypad(false); } setAttackModalOpen(open); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Fire Control: Target ({currentTarget ? axisLabelsY[currentTarget.row] : ''}, {currentTarget ? axisLabelsX[currentTarget.col] : ''})</DialogTitle>
                        <DialogDescription>
                            Solve the problem correctly to launch your attack. An incorrect answer will result in a miss.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="text-center p-8 bg-muted rounded-lg my-4 relative overflow-hidden">
                        <p className="text-3xl font-mono font-bold">{currentQuestion?.text} = ?</p>
                        {showCorrectAnswer && (
                            <div className="absolute inset-0 bg-muted flex items-center justify-center">
                                <p className="text-3xl font-mono font-bold text-red-500 animate-slide-out-answer">{currentQuestion?.answer}</p>
                            </div>
                        )}
                    </div>
                     <div className="flex gap-2">
                        {showKeypad ? (
                            <div className="h-12 text-lg text-center flex-grow bg-background border border-input rounded-md flex items-center justify-center font-mono">
                                {userAnswer || <span className="text-muted-foreground">...</span>}
                            </div>
                        ) : (
                            <Input
                                ref={inputRef}
                                type="number"
                                placeholder="Your Answer"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !showCorrectAnswer && handleAnswerSubmit()}
                                className="h-12 text-lg text-center"
                                disabled={showCorrectAnswer}
                            />
                        )}
                         <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-12 w-12"
                            onClick={() => setShowKeypad(s => !s)}
                            aria-label="Toggle keypad"
                        >
                            <Keyboard className="h-6 w-6" />
                        </Button>
                    </div>

                    {showKeypad && (
                        <Keypad
                            onKeyPress={(key) => setUserAnswer(prev => prev + key)}
                            onBackspace={() => setUserAnswer(prev => prev.slice(0, -1))}
                            onSubmit={() => handleAnswerSubmit()}
                        />
                    )}

                    <DialogFooter className="mt-4">
                         <Button onClick={() => { setCurrentTarget(null); setAttackModalOpen(false); }} variant="outline" disabled={showCorrectAnswer}>Cancel</Button>
                         <Button onClick={handleAnswerSubmit} className="text-lg" disabled={showCorrectAnswer || !userAnswer}>Fire!</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function MathShipsPage() {
    return (
        <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <MathShipsGame />
        </Suspense>
    )
}
