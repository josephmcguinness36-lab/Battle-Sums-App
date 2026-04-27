'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, X, Divide, CheckCircle, XCircle, Home, Repeat, Keyboard, Delete } from 'lucide-react';
import type { Question, Operator } from '@/lib/gameLogic';

const operators: { op: Operator, Icon: React.ElementType, name: string }[] = [
    { op: '+', Icon: Plus, name: 'Addition' },
    { op: '-', Icon: Minus, name: 'Subtraction' },
    { op: '×', Icon: X, name: 'Multiplication' },
    { op: '÷', Icon: Divide, name: 'Division' },
];

const tableNumbers = Array.from({ length: 13 }, (_, i) => i); // 0 to 12

type GameState = 'selecting' | 'practicing' | 'finished';

const generateTableQuestions = (operator: Operator, baseNumber: number): Question[] => {
    const singleOperatorQuestion = (op: Operator, i: number) => {
        let num1 = baseNumber;
        let num2 = i;
        let answer;
        let questionText: string;

        switch (op) {
            case '+':
                answer = num1 + num2;
                questionText = `${num1} + ${num2}`;
                break;
            case '-':
                answer = num1 + i - num2;
                questionText = `${num1 + i} - ${num2}`;
                break;
            case '×':
                answer = num1 * num2;
                questionText = `${num1} × ${num2}`;
                break;
            case '÷':
                if (num1 === 0) num1 = 1;
                num2 = num1 * i;
                answer = i;
                questionText = `${num2} ÷ ${num1}`;
                break;
            default:
                answer = 0;
                questionText = "Invalid";
        }
        return { text: questionText, answer };
    };
    
    return tableNumbers.map(i => singleOperatorQuestion(operator, i));
};

const Keypad = ({ onKeyPress, onBackspace, onSubmit }: { onKeyPress: (key: string) => void; onBackspace: () => void; onSubmit: () => void; }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    return (
        <div className="grid grid-cols-3 gap-2 mt-2 p-2 bg-secondary/50 rounded-lg">
            {keys.map(key => (
                <Button key={key} variant="outline" className="h-14 text-2xl font-bold" onClick={() => onKeyPress(key)}>
                    {key}
                </Button>
            ))}
             <Button variant="outline" className="h-14" onClick={onBackspace}>
                <Delete className="h-6 w-6" />
            </Button>
            <Button className="h-14 col-span-2 text-lg" onClick={onSubmit}>
                Submit
            </Button>
        </div>
    );
};


export default function TablePracticePage() {
    const router = useRouter();
    const { toast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

    const [gameState, setGameState] = useState<GameState>('selecting');
    const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
    const [selectedBaseNumber, setSelectedBaseNumber] = useState<number | null>(null);
    
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [showKeypad, setShowKeypad] = useState(false);

    const startGame = () => {
        if (selectedOperator && selectedBaseNumber !== null) {
            const newQuestions = generateTableQuestions(selectedOperator, selectedBaseNumber);
            setQuestions(newQuestions);
            setGameState('practicing');
            setCurrentQuestionIndex(0);
            setUserAnswer('');
            setFeedback(null);
        }
    };
    
    const handleNextQuestion = () => {
        setFeedback(null);
        setUserAnswer('');
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questions.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
        } else {
            setGameState('finished');
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!userAnswer || feedback !== null) return;
        
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = parseInt(userAnswer, 10) === currentQuestion?.answer;
        
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            toast({ title: "Correct!", duration: 1000 });
            setTimeout(handleNextQuestion, 1000);
        } else {
            toast({ variant: "destructive", title: "Try again!", description: `The correct answer was ${currentQuestion.answer}` });
            setUserAnswer('');
            setTimeout(() => {
                setFeedback(null)
            }, 1500);
        }
    };
    
    const resetGame = () => {
        setGameState('selecting');
        setSelectedOperator(null);
        setSelectedBaseNumber(null);
        setQuestions([]);
    };
    
    useEffect(() => {
        if (gameState === 'practicing' && feedback === null && !showKeypad) {
          inputRef.current?.focus();
        }
    }, [gameState, feedback, currentQuestionIndex, showKeypad]);

    if (gameState === 'selecting') {
        return (
            <div className="container py-12">
                <Card className="max-w-2xl mx-auto shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold">Practice Your Math Tables</CardTitle>
                        <CardContent>First, choose an operation. Then, pick a number to practice.</CardContent>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-center mb-4">1. Select Operation</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {operators.map(({ op, Icon }) => (
                                    <Button
                                        key={op}
                                        variant={selectedOperator === op ? 'default' : 'outline'}
                                        className="h-20 text-3xl"
                                        onClick={() => setSelectedOperator(op)}
                                    >
                                        <Icon className="h-10 w-10" />
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                             <h3 className="text-xl font-semibold text-center mb-4">2. Select Number (0-12)</h3>
                             <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                {tableNumbers.map(num => (
                                    <Button
                                        key={num}
                                        variant={selectedBaseNumber === num ? 'default' : 'outline'}
                                        className="h-14 text-2xl"
                                        onClick={() => setSelectedBaseNumber(num)}
                                    >
                                        {num}
                                    </Button>
                                ))}
                             </div>
                        </div>

                        <Button 
                            onClick={startGame} 
                            disabled={!selectedOperator || selectedBaseNumber === null}
                            className="w-full h-14 text-xl"
                        >
                            Start Practicing
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (gameState === 'practicing' && questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex) / questions.length) * 100;
        const operatorName = operators.find(o => o.op === selectedOperator)?.name || 'Practice';
        
        return (
             <div className="container py-12 flex justify-center items-center min-h-[80vh]">
                <Card className="w-full max-w-lg shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-center">
                        {operatorName} Practice: {selectedBaseNumber}s Table
                    </CardTitle>
                    <Progress value={progress} className="mt-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-center my-8 relative">
                        {feedback === 'correct' && <CheckCircle className="absolute inset-0 m-auto h-32 w-32 text-green-500 animate-ping opacity-30" />}
                        {feedback === 'incorrect' && <XCircle className="absolute inset-0 m-auto h-32 w-32 text-red-500 animate-ping opacity-30" />}
                        <p className="text-5xl font-bold font-mono tracking-widest">{currentQuestion.text} = ?</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                         <div className="flex gap-4">
                            {showKeypad ? (
                                <div className="h-16 text-3xl text-center flex-grow bg-muted rounded-md flex items-center justify-center font-mono border border-input">
                                    {userAnswer || <span className="text-muted-foreground">...</span>}
                                </div>
                            ) : (
                                <Input
                                    ref={inputRef}
                                    type="number"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Your Answer"
                                    className="h-16 text-3xl text-center"
                                    autoFocus
                                    disabled={feedback !== null}
                                />
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-16 w-16"
                                onClick={() => setShowKeypad(s => !s)}
                                aria-label="Toggle keypad"
                            >
                                <Keyboard className="h-8 w-8" />
                            </Button>
                        </div>

                        {!showKeypad && (
                            <Button type="submit" className="w-full mt-6 h-12 text-lg" disabled={feedback !== null}>
                                Submit
                            </Button>
                        )}
                    </form>
                    {showKeypad && (
                        <Keypad
                            onKeyPress={(key) => setUserAnswer(prev => prev + key)}
                            onBackspace={() => setUserAnswer(prev => prev.slice(0, -1))}
                            onSubmit={() => handleSubmit()}
                        />
                    )}
                </CardContent>
                </Card>
            </div>
        );
    }

    if (gameState === 'finished') {
        const operatorName = operators.find(o => o.op === selectedOperator)?.name.toLowerCase() || 'practice';
        return (
            <div className="container py-12 text-center">
                <Card className="max-w-md mx-auto shadow-2xl p-8">
                     <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
                     <h1 className="text-4xl font-bold mt-6">Table Complete!</h1>
                     <p className="text-lg text-muted-foreground mt-2">
                        You finished practicing the {selectedBaseNumber}s table for {operatorName}.
                     </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={resetGame} className="h-12 text-lg" >
                            <Repeat className="mr-2 h-5 w-5"/> Practice Another
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/tables')} className="h-12 text-lg">
                            <Home className="mr-2 h-5 w-5"/> Back to Tables
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return null;
}
