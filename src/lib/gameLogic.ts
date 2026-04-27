
import { Shield, Star, Trophy, BrainCircuit } from "lucide-react";

export type Question = {
  text: string;
  answer: number;
};

export type Operator = '+' | '-' | '×' | '÷';

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const levelOrder = [
  'easy-1', 'easy-2', 'easy-3',
  'medium-1', 'medium-2', 'medium-3',
  'difficult-1', 'difficult-2', 'difficult-3',
  'expert'
];

export const levelDetails = {
    'easy-1': { name: 'Easy 1', Icon: Shield, description: 'Numbers 0-10' },
    'easy-2': { name: 'Easy 2', Icon: Shield, description: 'Numbers 0-20' },
    'easy-3': { name: 'Easy 3', Icon: Shield, description: 'Numbers 10-50' },
    'medium-1': { name: 'Medium 1', Icon: Star, description: 'Numbers 10-100' },
    'medium-2': { name: 'Medium 2', Icon: Star, description: 'Numbers 10-200' },
    'medium-3': { name: 'Medium 3', Icon: Star, description: 'Numbers 10-500' },
    'difficult-1': { name: 'Difficult 1', Icon: Trophy, description: 'Numbers 100-1000' },
    'difficult-2': { name: 'Difficult 2', Icon: Trophy, description: 'Numbers 100-5000' },
    'difficult-3': { name: 'Difficult 3', Icon: Trophy, description: 'Numbers 100-10000' },
    'expert': { name: 'Expert', Icon: BrainCircuit, description: 'Includes negative numbers' },
};


const levelConfig = {
  'easy-1': { minNum1: 0, maxNum1: 10, minNum2: 0, maxNum2: 10 },
  'easy-2': { minNum1: 0, maxNum1: 10, minNum2: 10, maxNum2: 20 },
  'easy-3': { minNum1: 10, maxNum1: 25, minNum2: 10, maxNum2: 25 },
  'medium-1': { minNum1: 10, maxNum1: 50, minNum2: 20, maxNum2: 100 },
  'medium-2': { minNum1: 10, maxNum1: 100, minNum2: 100, maxNum2: 200 },
  'medium-3': { minNum1: 10, maxNum1: 100, minNum2: 100, maxNum2: 400 },
  'difficult-1': { minNum1: 100, maxNum1: 300, minNum2: 200, maxNum2: 1000 },
  'difficult-2': { minNum1: 100, maxNum1: 2000, minNum2: 1000, maxNum2: 3000 },
  'difficult-3': { minNum1: 100, maxNum1: 5000, minNum2: 1000, maxNum2: 5000 },
  'expert': { minNum1: -1000, maxNum1: 1000, minNum2: -1000, maxNum2: 1000 },
};

const getExpertConfig = () => {
    const expertLevels = ['difficult-2', 'difficult-3'];
    const includeNegatives = Math.random() > 0.5;

    if (includeNegatives) {
        return levelConfig['expert'];
    } else {
        const randomDifficultLevel = expertLevels[Math.floor(Math.random() * expertLevels.length)];
        return levelConfig[randomDifficultLevel as keyof typeof levelConfig];
    }
}

export const generateQuestion = (level: string, operator: Operator): Question => {
  const config = level === 'expert' ? getExpertConfig() : levelConfig[level as keyof typeof levelConfig] || levelConfig['easy-1'];
  
  let num1, num2;
  num1 = getRandomInt(config.minNum1, config.maxNum1);
  num2 = getRandomInt(config.minNum2, config.maxNum2);

  if (operator === '+' || operator === '-') {
    // Randomly swap to not always have the smaller number first
    if (Math.random() > 0.5) {
      [num1, num2] = [num2, num1];
    }
  }

  if (operator === '-') {
    // For non-expert levels, ensure the result is not negative
    if (level !== 'expert' && num1 < num2) {
      [num1, num2] = [num2, num1];
    }
    if (num1 === num2) num1 += getRandomInt(1, 5); // Avoid zero result
  }

  if (operator === '÷') {
    if (num2 === 0) num2 = getRandomInt(config.minNum2 > 0 ? config.minNum2 : 1, config.maxNum2); // Avoid division by zero
    
    // Create a product to be the dividend to ensure whole number answers
    let factor1, factor2;
    if (level.startsWith('easy')) {
      factor1 = getRandomInt(2, 5);
      factor2 = getRandomInt(2, 5);
    } else if (level.startsWith('medium')) {
      factor1 = getRandomInt(3, 15);
      factor2 = getRandomInt(3, 15);
    } else { // difficult and expert
      factor1 = getRandomInt(5, 25);
      factor2 = getRandomInt(5, 25);
    }

    num1 = factor1 * factor2;
    num2 = factor1;
  }
  
  if (operator === '×') {
    if (level.startsWith('easy')) {
      num1 = getRandomInt(1, 10);
      num2 = getRandomInt(1, 10);
    } else if (level.startsWith('medium')) {
        num1 = getRandomInt(2, 25);
        num2 = getRandomInt(2, 25);
    } else { // difficult and expert
        num1 = getRandomInt(10, 100);
        num2 = getRandomInt(10, 100);
    }
  }

  let answer: number;
  switch (operator) {
    case '+': answer = num1 + num2; break;
    case '-': answer = num1 - num2; break;
    case '×': answer = num1 * num2; break;
    case '÷': answer = num1 / num2; break;
    default: answer = 0;
  }

  return { text: `${num1} ${operator} ${num2}`, answer };
};
