'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer } from 'lucide-react';
import { levelOrder, levelDetails } from '@/lib/gameLogic';
import { Operator } from '@/lib/gameLogic';

const formSchema = z.object({
  level: z.string(),
  operator: z.enum(['+', '-', '×', '÷']),
});

type FormValues = z.infer<typeof formSchema>;

const operators: { op: Operator, name: string }[] = [
    { op: '+', name: 'Addition' },
    { op: '-', name: 'Subtraction' },
    { op: '×', name: 'Multiplication' },
    { op: '÷', name: 'Division' },
];


export default function TimeTrialPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: 'easy-1',
      operator: '+',
    },
  });

  function onSubmit(values: FormValues) {
    const { level, operator } = values;
    router.push(`/game?mode=time-trial&level=${level}&operator=${encodeURIComponent(operator)}`);
  }

  return (
    <div className="container py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
            5-Second Time Trial
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
            How fast can you think? 20 questions, 5 seconds each. No feedback until the end!
            </p>
        </div>
        <Card className="max-w-md mx-auto shadow-xl">
            <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                    <Timer className="w-8 h-8 text-primary" />
                    <CardTitle className="text-2xl font-bold">Setup Your Time Trial</CardTitle>
                </div>
                <CardDescription>
                    Choose your difficulty and operation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Difficulty Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select a difficulty" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {levelOrder.map(levelId => {
                                    const details = levelDetails[levelId as keyof typeof levelDetails];
                                    return (
                                        <SelectItem key={levelId} value={levelId}>
                                            {details.name} ({details.description})
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                            </Select>
                            <FormDescription>
                                Choose the type of questions for your time trial.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="operator"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Operation</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select an operation" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {operators.map(({ op, name }) => (
                                    <SelectItem key={op} value={op}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormDescription>
                                Choose which math operation to practice.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full h-12 text-lg font-bold">Start Time Trial</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
