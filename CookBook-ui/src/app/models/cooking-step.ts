export interface CookingStep {
  id: string;
  stepNumber: number;
  instruction: string;
  image?: string;
  duration?: number;
}
