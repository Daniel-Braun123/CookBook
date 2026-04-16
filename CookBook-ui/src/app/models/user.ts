export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  bio?: string;
  role: 'USER' | 'ADMIN';
  savedRecipes: string[];
  ownRecipes: string[];
  joinedAt: string;
}
