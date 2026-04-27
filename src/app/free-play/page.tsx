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
import { SlidersHorizontal } from 'lucide-react';
import { levelOrder, levelDetails } from '@/lib/gameLogic';

const formSchema = z.object({
  count: z.string(),
  level: z.string(),
  timer: z.string(),
});

type FormValues = z.infer<typeof formSchema>;


export default function FreePlayPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      count: '10',
      level: 'easy-1',
      timer: 'none',
    },
  });

  function onSubmit(values: FormValues) {
    const { count, level, timer } = values;
    router.push(`/game?mode=free-play&count=${count}&level=${level}&timer=${timer}`);
  }

  return (
    <div className="container py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
            Free Play Mode
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
            Create your perfect practice session.
            </p>
        </div>
        <Card className="max-w-md mx-auto shadow-xl">
            <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                    <SlidersHorizontal className="w-8 h-8 text-primary" />
                    <CardTitle className="text-2xl font-bold">Customize Your Game</CardTitle>
                </div>
                <CardDescription>
                    Set the rules and play your way.
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
                                Choose the type of questions to practice.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="count"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Number of Sums</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select number of sums" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="10">10 Questions</SelectItem>
                                <SelectItem value="20">20 Questions</SelectItem>
                                <SelectItem value="30">30 Questions</SelectItem>
                                <SelectItem value="50">50 Questions</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormDescription>
                            Choose how many questions you want to answer.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="timer"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Time per Question</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select a time limit" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">No Timer</SelectItem>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="20">20 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormDescription>
                                Add a time limit for each question.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full h-12 text-lg font-bold">Start Game</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
