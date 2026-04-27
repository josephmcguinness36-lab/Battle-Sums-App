'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Minus, X, Divide, BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type Operator = 'addition' | 'subtraction' | 'multiplication' | 'division';

const numbers = Array.from({ length: 11 }, (_, i) => i); // 0 to 10

const renderTableHeader = () => (
  <TableHeader>
    <TableRow>
      <TableHead className="w-[50px] text-center font-bold text-lg bg-secondary">Op</TableHead>
      {numbers.map((num) => (
        <TableHead key={num} className="text-center font-bold text-lg bg-secondary">
          {num}
        </TableHead>
      ))}
    </TableRow>
  </TableHeader>
);

const AdditionTable = () => (
  <Table>
    {renderTableHeader()}
    <TableBody>
      {numbers.map((rowNum) => (
        <TableRow key={rowNum}>
          <TableHead className="text-center font-bold text-lg bg-secondary">{rowNum}</TableHead>
          {numbers.map((colNum) => (
            <TableCell key={colNum} className="text-center text-md font-mono">
              {rowNum + colNum}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const SubtractionTable = () => (
    <Table>
      {renderTableHeader()}
      <TableBody>
        {numbers.map((rowNum) => (
          <TableRow key={rowNum}>
            <TableHead className="text-center font-bold text-lg bg-secondary">{rowNum}</TableHead>
            {numbers.map((colNum) => {
              const result = rowNum - colNum;
              return (
                <TableCell 
                  key={colNum} 
                  className={cn(
                    "text-center text-md font-mono",
                    result < 0 && "text-destructive font-semibold"
                  )}
                >
                  {result}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
);

const MultiplicationTable = () => (
  <Table>
    {renderTableHeader()}
    <TableBody>
      {numbers.map((rowNum) => (
        <TableRow key={rowNum}>
          <TableHead className="text-center font-bold text-lg bg-secondary">{rowNum}</TableHead>
          {numbers.map((colNum) => (
            <TableCell key={colNum} className="text-center text-md font-mono">
              {rowNum * colNum}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const DivisionTable = () => {
    const divisionNumbers = Array.from({ length: 10 }, (_, i) => i + 1); // 1 to 10
    const divisionVerticalAxis = Array.from({ length: 11 }, (_, i) => i * 10); // 0, 10, 20...100

    return (
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px] text-center font-bold text-lg bg-secondary">Op</TableHead>
                {divisionNumbers.map((num) => (
                    <TableHead key={num} className="text-center font-bold text-lg bg-secondary">
                    {num}
                    </TableHead>
                ))}
                </TableRow>
            </TableHeader>
            <TableBody>
            {divisionVerticalAxis.map((rowNum) => (
                <TableRow key={rowNum}>
                <TableHead className="text-center font-bold text-lg bg-secondary">{rowNum}</TableHead>
                {divisionNumbers.map((colNum) => {
                    const result = rowNum / colNum;
                    const isWholeNumber = result % 1 === 0;
                    return (
                        <TableCell key={colNum} className={cn("text-center text-md font-mono", isWholeNumber && "font-bold")}>
                            {isWholeNumber ? result : result.toFixed(2)}
                        </TableCell>
                    );
                })}
                </TableRow>
            ))}
            </TableBody>
        </Table>
    )
};

const operatorComponents = {
  addition: { Component: AdditionTable, Icon: Plus, title: "Addition Table (0-10)" },
  subtraction: { Component: SubtractionTable, Icon: Minus, title: "Subtraction Table (0-10)" },
  multiplication: { Component: MultiplicationTable, Icon: X, title: "Multiplication Table (0-10)" },
  division: { Component: DivisionTable, Icon: Divide, title: "Division Table (0-10)" }
};

const operatorButtons: { id: Operator, label: string, Icon: React.ElementType }[] = [
    { id: 'addition', label: 'Addition', Icon: Plus },
    { id: 'subtraction', label: 'Subtraction', Icon: Minus },
    { id: 'multiplication', label: 'Multiplication', Icon: X },
    { id: 'division', label: 'Division', Icon: Divide },
];


export default function TablesPage() {
  const [activeOperator, setActiveOperator] = useState<Operator>('addition');
  const { Component, Icon, title } = operatorComponents[activeOperator];

  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
                Math Tables
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Your reference for basic arithmetic. Click below to start practicing.
            </p>
            <div className="pt-4">
                <Link href="/table-practice" passHref>
                    <Button size="lg" className="h-14 text-xl">
                        <BookOpenCheck className="w-6 h-6 mr-3" />
                        Practice Tables
                    </Button>
                </Link>
            </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {operatorButtons.map(({ id, label, Icon }) => (
                <Button
                    key={id}
                    variant={activeOperator === id ? 'default' : 'outline'}
                    onClick={() => setActiveOperator(id)}
                    className="h-12 text-md"
                >
                    <Icon className="w-5 h-5 mr-2"/>
                    {label}
                </Button>
            ))}
          </div>

          <div className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Icon/> {title}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Component />
                </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
