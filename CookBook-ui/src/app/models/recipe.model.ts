export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  servings: number;
  category: string;
  tags: string[];
  author: Author;
  ingredients: Ingredient[];
  steps: CookingStep[];
  nutrition?: NutritionInfo;
  createdAt: string;
  isSaved?: boolean;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface CookingStep {
  id: string;
  stepNumber: number;
  instruction: string;
  image?: string;
  duration?: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  savedRecipes: string[];
  ownRecipes: string[];
  joinedAt: string;
}
