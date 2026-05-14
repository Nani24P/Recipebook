'use client';

import Dexie, { Table } from 'dexie';
import { Recipe } from './types';

class RecipeBookDatabase extends Dexie {
  recipes!: Table<Recipe, string>;

  constructor() {
    super('PersonalRecipeBook');
    this.version(1).stores({
      recipes: 'id, title, favorite, createdAt, updatedAt'
    });
  }
}

export const db = new RecipeBookDatabase();

export async function seedRecipesIfEmpty() {
  const count = await db.recipes.count();
  if (count > 0) return;

  const now = new Date().toISOString();
  await db.recipes.bulkAdd([
    {
      id: crypto.randomUUID(),
      title: 'Sample Family Pasta',
      description: 'Replace this sample with your own scanned or photographed recipe pages.',
      cuisine: 'Italian',
      difficulty: 'Easy',
      prepTimeMinutes: 15,
      cookTimeMinutes: 25,
      servings: 4,
      tags: ['Dinner', 'Pasta', 'Family Classic'],
      collections: ['Weeknight', 'Family Recipes'],
      favorite: true,
      pages: [],
      notes: 'Tip: upload 3–10 photos per recipe from the Add Recipe panel.',
      createdAt: now,
      updatedAt: now
    },
    {
      id: crypto.randomUUID(),
      title: 'Sample Dessert Card',
      description: 'Use collections and tags to make your recipe book feel like a curated market app.',
      cuisine: 'Home',
      difficulty: 'Medium',
      prepTimeMinutes: 20,
      cookTimeMinutes: 40,
      servings: 8,
      tags: ['Dessert', 'Baking', 'Guests'],
      collections: ['Desserts', 'For Guests'],
      favorite: false,
      pages: [],
      notes: '',
      createdAt: now,
      updatedAt: now
    }
  ]);
}
