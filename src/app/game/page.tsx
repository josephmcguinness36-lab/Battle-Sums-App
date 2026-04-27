'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateQuestion, Question, Operator, levelOrder, levelDetails } from '@/lib/gameLogic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, X, Divide, CheckCircle, XCircle, Loader2, Home, Star, Trophy, Repeat, StopCircle, ArrowRightCircle, Keyboard, Delete } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type GameState = 'selecting_operator' | 'playing' | 'round_transition' | 'finished' | 'star_earned' | 'level_up' | 'time_trial_results';

const MIN_CORRECT_FOR_ROUND_WIN = 8;
const QUESTIONS_PER_ROUND = 10;
const ROUNDS_PER_LEVEL = 2;
const EXPERT_QUESTIONS_PER_ROUND = 10;
const TIME_TRIAL_QUESTIONS = 20;
const TIME_TRIAL_DURATION = 5;

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

function GameComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const mode = searchParams.get('mode') || 'free-play';
  const timeTrialOperator = searchParams.get('operator') as Operator | null;

  const [gameState, setGameState] = useState<GameState>('selecting_operator');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [showKeypad, setShowKeypad] = useState(mode === 'challenge' || mode === 'time-trial');
  
  // Challenge mode specific state
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalCorrectInGame, setTotalCorrectInGame] = useState(0);
  const [stars, setStars] = useState(0);

  // Free play / Time Trial mode state
  const freePlayLevel = searchParams.get('level') || 'easy-1';
  const freePlayCount = parseInt(searchParams.get('count') || '10', 10);
  const freePlayTimer = searchParams.get('timer') || 'none';
  const timeTrialLevel = searchParams.get('level') || 'easy-1';
  const [timeTrialAnswers, setTimeTrialAnswers] = useState<({ question: Question; userAnswer: string; isCorrect: boolean })[]>([]);

  const level = mode === 'challenge' ? levelOrder[currentLevelIndex] : (mode === 'time-trial' ? timeTrialLevel : freePlayLevel);

  const getInitialTime = useCallback(() => {
    if (mode === 'time-trial') return TIME_TRIAL_DURATION;
    if (mode === 'free-play' && freePlayTimer !== 'none') {
        return parseInt(freePlayTimer, 10);
    }
    if (mode !== 'challenge') return null;
    
    if (level === 'expert') {
        return 10;
    }

    switch (currentRound) {
        case 1: return 30;
        case 2: return 20;
        case 3: return 15;
        case 4: return 10;
        default: return 30;
    }
  }, [mode, level, currentRound, freePlayTimer]);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(getInitialTime());
  
  const resultsImage = PlaceHolderImages.find(p => p.id === 'results-trophy');

  const saveTrophy = useCallback(() => {
    if (mode !== 'challenge' || !selectedOperator) return;
    const savedProgress = localStorage.getItem('sumz_progress');
    let progress: { trophies: Record<string, any>; totalSumsCompleted?: number; stars?: number } = { trophies: {}, totalSumsCompleted: 0, stars: 0 };

    if (savedProgress) {
        try {
            const parsed = JSON.parse(savedProgress);
            progress = parsed;
            if (!parsed.trophies || typeof parsed.trophies !== 'object' || Array.isArray(parsed.trophies)) {
                 progress.trophies = {};
            }
        } catch(e) {
            console.error("Failed to parse progress", e);
        }
    }

    const currentTrophy = progress.trophies[selectedOperator];
    const newScore = (currentLevelIndex * ROUNDS_PER_LEVEL) + currentRound;
    
    let oldScore = 0;
    if (currentTrophy) {
        const oldLevelIndex = levelOrder.indexOf(currentTrophy.levelName.split(',')[0].replace(' Champion', ''));
        oldScore = (oldLevelIndex * ROUNDS_PER_LEVEL) + currentTrophy.round;
    }

    if (!currentTrophy || newScore > oldScore) {
        const newTrophy = {
            operator: selectedOperator,
            levelName: levelDetails[level as keyof typeof levelDetails].name,
            round: currentRound,
            date: new Date().toISOString(),
        };
        progress.trophies[selectedOperator] = newTrophy;
        localStorage.setItem('sumz_progress', JSON.stringify(progress));
        window.dispatchEvent(new CustomEvent('sumz_progress_updated'));
    }
  }, [mode, level, currentRound, currentLevelIndex, selectedOperator]);

  const handleFinish = useCallback(() => {
     if (mode === 'time-trial') {
      setGameState('time_trial_results');
    } else {
      setGameState('finished');
    }
  }, [mode]);
  
    // Effect for timed state transitions (star earned, level up, round transition)
    useEffect(() => {
        if (gameState === 'star_earned' || gameState === 'level_up') {
            const timer = setTimeout(() => {
                setGameState('round_transition');
                setCountdown(3);
            }, 2500);
            return () => clearTimeout(timer);
        }

        if (gameState === 'round_transition' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } 
        
        if (gameState === 'round_transition' && countdown === 0) {
            let nextRound = currentRound + 1;
            let nextLevelIndex = currentLevelIndex;

            const isCurrentLevelExpert = levelOrder[currentLevelIndex] === 'expert';
            const roundsInCurrentLevel = isCurrentLevelExpert ? 1 : ROUNDS_PER_LEVEL;
            
            if (nextRound > roundsInCurrentLevel) {
                nextRound = 1;
                nextLevelIndex += 1;
            }

            if (nextLevelIndex >= levelOrder.length) {
                handleFinish();
                return;
            }
            
            setCurrentRound(nextRound);
            setCurrentLevelIndex(nextLevelIndex);
            
            const nextLevelId = levelOrder[nextLevelIndex];
            const isNextLevelExpert = nextLevelId === 'expert';
            const questionsPerRound = isNextLevelExpert ? EXPERT_QUESTIONS_PER_ROUND : QUESTIONS_PER_ROUND;

            const newQuestions = Array.from({ length: questionsPerRound }, () => generateQuestion(nextLevelId, selectedOperator || '+'));
            
            setQuestions(newQuestions);
            setCurrentQuestionIndex(0);
            setScore(0);
            setGameState('playing');
        }
    }, [gameState, countdown, currentRound, currentLevelIndex, handleFinish, selectedOperator]);

  const handleRoundEnd = useCallback(() => {
    const isExpert = level === 'expert';
    const minCorrect = isExpert ? MIN_CORRECT_FOR_ROUND_WIN : MIN_CORRECT_FOR_ROUND_WIN;

    if (score >= minCorrect) {
        setStars(prev => prev + 1);
        try {
            const savedProgress = localStorage.getItem('sumz_progress');
            let progress = savedProgress ? JSON.parse(savedProgress) : { trophies: {}, totalSumsCompleted: 0, stars: 0 };
            progress.stars = (progress.stars || 0) + 1;
            localStorage.setItem('sumz_progress', JSON.stringify(progress));
            window.dispatchEvent(new CustomEvent('sumz_progress_updated'));
        } catch(e) {
            console.error("Could not update star count in localStorage", e);
        }

        saveTrophy();

        const roundsInCurrentLevel = isExpert ? 1 : ROUNDS_PER_LEVEL;
        const isLastRoundOfLevel = currentRound === roundsInCurrentLevel;

        if (isLastRoundOfLevel) {
            if (currentLevelIndex < levelOrder.length - 1) {
                setGameState('level_up');
            } else {
                handleFinish();
            }
        } else {
            setGameState('star_earned');
        }
    } else {
        handleFinish();
    }
  }, [score, handleFinish, level, saveTrophy, currentRound, currentLevelIndex]);

  const startGame = (operator: Operator) => {
    setSelectedOperator(operator);

    let initialLevelIndex = 0;
    if (mode === 'challenge') {
      const startLevelParam = searchParams.get('startLevel') || 'easy';
      if (startLevelParam === 'medium') {
        const mediumIndex = levelOrder.indexOf('medium-1');
        initialLevelIndex = mediumIndex > -1 ? mediumIndex : 0;
      } else if (startLevelParam === 'difficult') {
        const difficultIndex = levelOrder.indexOf('difficult-1');
        initialLevelIndex = difficultIndex > -1 ? difficultIndex : 0;
      }
    }

    const levelId = mode === 'challenge' 
        ? levelOrder[initialLevelIndex] 
        : (mode === 'time-trial' ? timeTrialLevel : freePlayLevel);

    if(!levelId) {
        router.push('/challenge');
        toast({
            variant: "destructive",
            title: "Error starting game",
            description: "Could not determine starting level.",
        });
        return;
    }

    const isExpert = levelId === 'expert';
    const count = mode === 'challenge' 
        ? (isExpert ? EXPERT_QUESTIONS_PER_ROUND : QUESTIONS_PER_ROUND)
        : (mode === 'time-trial' ? TIME_TRIAL_QUESTIONS : freePlayCount);

    const newQuestions = Array.from({ length: count }, () => generateQuestion(levelId, operator));
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCurrentLevelIndex(initialLevelIndex);
    setCurrentRound(1);
    setTotalCorrectInGame(0);
    setStars(0);
    setTimeTrialAnswers([]);
    setGameState('playing');
  };

   useEffect(() => {
    if (mode === 'time-trial' && timeTrialOperator && timeTrialLevel) {
      startGame(timeTrialOperator);
    }
  }, [mode, timeTrialOperator, timeTrialLevel]);

   // Effect to update timer when game state changes
  useEffect(() => {
    if(gameState === 'playing') {
        setTimeLeft(getInitialTime());
    }
  }, [gameState, currentRound, currentLevelIndex, getInitialTime, currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    setFeedback(null);
    setUserAnswer('');
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      // Manually trigger timer reset for the next question
      const newTime = getInitialTime();
      setTimeLeft(newTime);
    } else {
      if (mode === 'challenge') {
        handleRoundEnd();
      } else {
        handleFinish();
      }
    }
  }, [currentQuestionIndex, questions.length, mode, handleFinish, handleRoundEnd, getInitialTime]);

  const handleTimeUp = useCallback(() => {
    if (feedback !== null) return;
    setFeedback('incorrect');
    const currentQuestion = questions[currentQuestionIndex];
    if (mode === 'time-trial') {
        setTimeTrialAnswers(prev => [...prev, { question: currentQuestion, userAnswer: 'timed-out', isCorrect: false }]);
        handleNextQuestion();
        return;
    }

    toast({
        variant: "destructive",
        title: "Time's up!",
        description: `The correct answer was ${currentQuestion?.answer}.`,
        duration: 2000
    });
    setTimeout(() => {
        handleNextQuestion();
    }, 2000);
  }, [mode, questions, currentQuestionIndex, handleNextQuestion, toast, feedback]);


  useEffect(() => {
    if (gameState !== 'playing' || feedback !== null || timeLeft === null) {
      return;
    }

    if (timeLeft === 0) {
      handleTimeUp();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(t => (t !== null ? t - 1 : null));
    }, 1000);

    return () => clearTimeout(timerId);

  }, [gameState, feedback, timeLeft, handleTimeUp]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer || feedback !== null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = parseInt(userAnswer, 10) === currentQuestion?.answer;

    if (mode === 'time-trial') {
        setTimeTrialAnswers(prev => [...prev, { question: currentQuestion, userAnswer, isCorrect }]);
         if (isCorrect) {
            setScore(prev => prev + 1);
        } else {
             toast({
                variant: "destructive",
                title: "Incorrect!",
                description: `The correct answer was ${currentQuestion.answer}.`,
                duration: 1000
            });
        }
        setUserAnswer('');
        handleNextQuestion();
        return;
    }
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setScore(prev => prev + 1);
      if(mode === 'challenge') {
          setTotalCorrectInGame(prev => prev + 1);
      }
      
      try {
        const savedProgress = localStorage.getItem('sumz_progress');
        let progress = savedProgress ? JSON.parse(savedProgress) : { trophies: {}, totalSumsCompleted: 0 };
        progress.totalSumsCompleted = (progress.totalSumsCompleted || 0) + 1;
        localStorage.setItem('sumz_progress', JSON.stringify(progress));
        window.dispatchEvent(new CustomEvent('sumz_progress_updated'));
      } catch (e) {
        console.error("Could not update total sums completed in localStorage", e);
      }
      setTimeout(handleNextQuestion, 1000);
    } else {
      toast({
        variant: "destructive",
        title: "Not quite!",
        description: `The correct answer was ${currentQuestion.answer}.`,
        duration: 2000
      });
      setTimeout(handleNextQuestion, 2000);
    }

  };
  
  const resetGame = () => {
    if (mode === 'time-trial') {
      router.push('/time-trial');
    } else {
      setGameState('selecting_operator');
      setQuestions([]);
    }
  }
  
  useEffect(() => {
    if (gameState === 'playing' && feedback === null && !showKeypad) {
      inputRef.current?.focus();
    }
  }, [gameState, feedback, currentQuestionIndex, showKeypad]);


  if (gameState === 'selecting_operator' && mode !== 'time-trial') {
    const operators: { op: Operator, Icon: React.ElementType }[] = [
      { op: '+', Icon: Plus },
      { op: '-', Icon: Minus },
      { op: '×', Icon: X },
      { op: '÷', Icon: Divide },
    ];
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-2">Choose an Operation</h1>
        <p className="text-muted-foreground mb-8">This will be used for all questions in your session.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-xl mx-auto">
          {operators.map(({ op, Icon }) => (
            <Button
              key={op}
              className="h-24 w-full text-4xl"
              onClick={() => startGame(op)}
              variant="outline"
            >
              <Icon className="h-12 w-12" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'star_earned') {
    return (
        <div className="container py-12 text-center flex flex-col items-center justify-center min-h-[80vh]">
            <div className="animate-twinkle">
                <Star className="w-48 h-48 text-yellow-400 fill-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold mt-8 animate-fade-in">You've earned a star!</h1>
        </div>
    );
  }

  if (gameState === 'level_up') {
    return (
        <div className="container py-12 text-center flex flex-col items-center justify-center min-h-[80vh]">
            <h1 className="text-8xl font-extrabold text-primary animate-level-up">Level Up!</h1>
        </div>
    );
  }
  
  if (gameState === 'round_transition') {
    const isExpert = level === 'expert';
    const nextLevelIndex = currentRound === (isExpert ? 1 : ROUNDS_PER_LEVEL) ? currentLevelIndex + 1 : currentLevelIndex;
    const nextLevelId = levelOrder[nextLevelIndex] as keyof typeof levelDetails;
    const nextLevelName = levelDetails[nextLevelId]?.name || '';
    const nextRound = currentRound === (isExpert ? 1 : ROUNDS_PER_LEVEL) ? 1 : currentRound + 1;

    return (
        <div className="container py-12 text-center">
            <Card className="max-w-md mx-auto shadow-2xl p-8">
                <h1 className="text-4xl font-bold mt-6">{isExpert ? "Final Round!" : "Round Complete!"}</h1>
                <p className="text-lg text-muted-foreground mt-2">You beat Round {currentRound} of {levelDetails[level as keyof typeof levelDetails].name}!</p>
                <div className="my-6">
                    <p className="text-muted-foreground">Next up:</p>
                    <p className="text-2xl font-bold text-primary"> {nextLevelName} - Round {nextRound}</p>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-3xl font-bold">{countdown}</p>
                </div>
            </Card>
        </div>
    )
  }

  if (gameState === 'playing' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    const levelName = levelDetails[level as keyof typeof levelDetails].name;
    const LevelIcon = levelDetails[level as keyof typeof levelDetails].Icon;

    return (
      <div className="container py-12 flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
                 {mode === 'challenge' ? (
                     <div className="flex items-center gap-2">
                        <LevelIcon className="w-6 h-6 text-primary"/>
                        <CardTitle className="text-xl">{levelName}{level !== 'expert' && ` - Round ${currentRound}`}</CardTitle>
                    </div>
                ) : (
                    <CardTitle>{mode === 'time-trial' ? `Time Trial - ${score}/${questions.length}` : `Question ${currentQuestionIndex + 1} of ${questions.length}`}</CardTitle>
                )}
                <div className="flex items-center gap-4">
                    {mode === 'challenge' && level !== 'expert' && (
                        <div className="flex items-center gap-1 text-primary">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-500"/>
                            <span className="font-bold">{stars}</span>
                        </div>
                    )}
                    {timeLeft !== null && (
                        <div className="relative flex items-center justify-center h-10 w-10 text-2xl font-bold text-primary">
                            <span>{timeLeft}</span>
                            {timeLeft <= 5 && timeLeft > 0 && (
                                <span className="absolute text-5xl font-extrabold text-destructive animate-ping-slow">{timeLeft}</span>
                            )}
                        </div>
                    )}
                    {(mode === 'challenge' || mode === 'free-play') && (
                        <Button variant="ghost" size="icon" onClick={handleFinish} aria-label="End Game">
                            <StopCircle className="h-6 w-6 text-destructive" />
                        </Button>
                    )}
                </div>
            </div>
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
                {mode === 'free-play' && !showKeypad && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-16 w-16"
                        onClick={handleNextQuestion}
                        aria-label="Skip question"
                        disabled={feedback !== null}
                    >
                        <ArrowRightCircle className="h-8 w-8" />
                    </Button>
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
    const isExpert = level === 'expert';
    const minCorrectForWin = isExpert ? MIN_CORRECT_FOR_ROUND_WIN : MIN_CORRECT_FOR_ROUND_WIN;
    const passed = score >= minCorrectForWin;
    
    return (
       <div className="container py-12 text-center">
        <Card className="max-w-md mx-auto shadow-2xl p-8">
            {resultsImage && <Image
                src={resultsImage.imageUrl}
                alt={resultsImage.description}
                width={200}
                height={200}
                data-ai-hint={resultsImage.imageHint}
                className="mx-auto rounded-full border-4 border-primary"
            />}
          <h1 className="text-4xl font-bold mt-6">
            {mode === 'challenge' && !passed && stars === 0 ? "Game Over!" : "Session Complete!"}
          </h1>
          {mode === 'challenge' ? (
              <>
                <p className="text-lg text-muted-foreground mt-2">You made it to <span className="font-bold text-primary">{levelDetails[level as keyof typeof levelDetails].name}{level !== 'expert' && `, Round ${currentRound}`}</span></p>
                <p className="text-2xl font-bold my-4">Final Score: {score} / {questions.length}</p>
                <div className="my-4 flex justify-center items-center gap-4 text-3xl font-bold">
                    {stars > 0 && <div className="flex items-center gap-2">
                        <Star className="w-8 h-8 fill-yellow-400 text-yellow-500"/>
                        <span>{stars}</span>
                    </div>}
                   {passed && score >= minCorrectForWin && <div className="flex items-center gap-2">
                        <Trophy className="w-8 h-8 text-yellow-600"/>
                        <span>Trophy Earned!</span>
                    </div>}
                </div>
                 {!passed && stars > 0 && <p className="text-destructive mt-4">You needed {minCorrectForWin} correct answers to pass the round.</p>}
                 {!passed && stars === 0 && <p className="text-destructive mt-4">You needed {minCorrectForWin} correct answers to earn a star.</p>}

              </>
          ) : (
             <>
                <p className="text-lg text-muted-foreground mt-2">Here's how you did:</p>
                <p className="text-6xl font-bold text-primary my-4">{score} / {questions.length}</p>
                <p className="text-2xl font-semibold">That's {Math.round((score/questions.length)*100)}% correct!</p>
             </>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={resetGame} className="h-12 text-lg" >
                <Repeat className="mr-2 h-5 w-5"/> Play Again
            </Button>
            <Button variant="outline" onClick={() => router.push(mode === 'challenge' ? '/challenge' : '/free-play')} className="h-12 text-lg">
                <Home className="mr-2 h-5 w-5"/> Back to Menu
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'time_trial_results') {
    return (
      <div className="container py-12 text-center">
        <Card className="max-w-md mx-auto shadow-2xl p-8">
          <h1 className="text-4xl font-bold mt-6">Time Trial Complete!</h1>
          <p className="text-lg text-muted-foreground mt-2">Here are your results:</p>
          <p className="text-6xl font-bold text-primary my-4">{score} / {TIME_TRIAL_QUESTIONS}</p>

          <div className="mt-4 max-h-60 overflow-y-auto text-left space-y-2">
            {timeTrialAnswers.map((ans, index) => (
              <div key={index} className={`flex justify-between items-center p-2 rounded-md ${ans.isCorrect ? 'bg-green-100' : ans.userAnswer === 'timed-out' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <span className="font-mono">{ans.question.text} = {ans.userAnswer === 'timed-out' ? '?' : ans.userAnswer || '?'}</span>
                 {ans.userAnswer === 'timed-out' ? 
                  <span className="text-sm font-semibold text-yellow-700">Time Out</span>
                  : ans.isCorrect ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600">{ans.question.answer}</span>
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                }
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={resetGame} className="h-12 text-lg">
              <Repeat className="mr-2 h-5 w-5"/> Play Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/challenge')} className="h-12 text-lg">
              <Home className="mr-2 h-5 w-5"/> Back to Menu
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}


export default function GamePage() {
    return (
        <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <GameComponent />
        </Suspense>
    )
}
