export type RecipePage = {
  id: string;
  pageNumber: number;
  imageDataUrl: string;
  ocrText?: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  cuisine?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  tags: string[];
  collections: string[];
  favorite: boolean;
  pages: RecipePage[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type RecipeDraft = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;
