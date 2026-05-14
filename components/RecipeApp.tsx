'use client';

import { useEffect, useMemo, useState } from 'react';
import { db, seedRecipesIfEmpty } from '@/lib/db';
import { fileToDataUrl, formatMinutes } from '@/lib/image';
import { Recipe, RecipePage } from '@/lib/types';

type View = 'home' | 'recipes' | 'collections' | 'favorites' | 'add' | 'detail';

const navItems: { id: View; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'collections', label: 'Collections' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'add', label: 'Add Recipe' }
];

function unique(values: string[]) {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort();
}

function splitList(value: string) {
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

export default function RecipeApp() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [view, setView] = useState<View>('home');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function refresh() {
    const all = await db.recipes.orderBy('updatedAt').reverse().toArray();
    setRecipes(all);
  }

  useEffect(() => {
    seedRecipesIfEmpty().then(refresh);
    if ('serviceWorker' in navigator) {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      navigator.serviceWorker.register(`${basePath}/sw.js`, { scope: `${basePath || ''}/` }).catch(() => undefined);
    }
  }, []);

  const selected = recipes.find((r) => r.id === selectedId) ?? recipes[0];
  const favorites = recipes.filter((r) => r.favorite);
  const collections = unique(recipes.flatMap((r) => r.collections));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter((recipe) => {
      const haystack = [
        recipe.title,
        recipe.description,
        recipe.cuisine,
        recipe.notes,
        ...recipe.tags,
        ...recipe.collections,
        ...recipe.pages.map((p) => p.ocrText ?? '')
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [recipes, query]);

  function openRecipe(id: string) {
    setSelectedId(id);
    setView('detail');
  }

  async function toggleFavorite(recipe: Recipe) {
    await db.recipes.update(recipe.id, { favorite: !recipe.favorite, updatedAt: new Date().toISOString() });
    refresh();
  }

  async function removeRecipe(recipe: Recipe) {
    const ok = confirm(`Delete ${recipe.title}? This removes it from this device.`);
    if (!ok) return;
    await db.recipes.delete(recipe.id);
    setSelectedId(null);
    setView('recipes');
    refresh();
  }

  const visibleRecipes = view === 'favorites' ? favorites : filtered;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">🍲</div>
          <div>
            <strong>Recipe Book</strong><br />
            <small>private photo library</small>
          </div>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setView(item.id)} className={view === item.id ? 'active' : ''}>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        {view !== 'detail' && <Header recipeCount={recipes.length} setView={setView} />}

        {view === 'home' && (
          <>
            <SearchBar query={query} setQuery={setQuery} />
            <Shelf title="Fresh picks" subtitle="Recently updated recipes">
              <RecipeGrid recipes={filtered.slice(0, 8)} openRecipe={openRecipe} toggleFavorite={toggleFavorite} />
            </Shelf>
            <Shelf title="Smart shelves" subtitle="Market-style organization">
              <div className="grid">
                {['Weeknight', 'Family Recipes', 'Desserts', 'For Guests', 'Saved Offline', 'Needs OCR Review'].map((name) => (
                  <button className="card" key={name} onClick={() => { setQuery(name); setView('recipes'); }}>
                    <div className="card-cover">{name === 'Desserts' ? '🍰' : name === 'For Guests' ? '🍽️' : '🧺'}</div>
                    <div className="card-body"><h3>{name}</h3><p className="meta">Tap to filter your book</p></div>
                  </button>
                ))}
              </div>
            </Shelf>
          </>
        )}

        {(view === 'recipes' || view === 'favorites') && (
          <>
            <SearchBar query={query} setQuery={setQuery} />
            <Shelf title={view === 'favorites' ? 'Favorites' : 'All recipes'} subtitle={`${visibleRecipes.length} shown`}>
              <RecipeGrid recipes={visibleRecipes} openRecipe={openRecipe} toggleFavorite={toggleFavorite} />
            </Shelf>
          </>
        )}

        {view === 'collections' && (
          <Shelf title="Collections" subtitle="Manual groups for occasions and themes">
            <div className="grid">
              {collections.length === 0 && <p className="meta">No collections yet. Add collection names when creating a recipe.</p>}
              {collections.map((collection) => {
                const count = recipes.filter((r) => r.collections.includes(collection)).length;
                return (
                  <button className="card" key={collection} onClick={() => { setQuery(collection); setView('recipes'); }}>
                    <div className="card-cover">🧺</div>
                    <div className="card-body"><h3>{collection}</h3><p className="meta">{count} recipe{count === 1 ? '' : 's'}</p></div>
                  </button>
                );
              })}
            </div>
          </Shelf>
        )}

        {view === 'add' && <RecipeForm onSaved={() => { refresh(); setView('recipes'); }} />}

        {view === 'detail' && selected && (
          <RecipeDetail recipe={selected} back={() => setView('recipes')} refresh={refresh} toggleFavorite={toggleFavorite} removeRecipe={removeRecipe} />
        )}
      </main>

      <nav className="bottom-tabs">
        {navItems.slice(0, 5).map((item) => (
          <button key={item.id} onClick={() => setView(item.id)} className={view === item.id ? 'active' : ''}>{item.label}</button>
        ))}
      </nav>
    </div>
  );
}

function Header({ recipeCount, setView }: { recipeCount: number; setView: (view: View) => void }) {
  return (
    <section className="hero">
      <div>
        <h1>Your private recipe market.</h1>
        <p>Store photo-based recipes, swipe through pages while cooking, organize by shelves, and keep your favorites easy to find on iPhone and iPad.</p>
      </div>
      <div className="actions">
        <button className="btn primary" onClick={() => setView('add')}>Add Recipe</button>
        <button className="btn" onClick={() => setView('recipes')}>{recipeCount} recipes</button>
      </div>
    </section>
  );
}

function SearchBar({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  return (
    <div className="searchbar">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, tag, collection, notes, or OCR text..." />
      {query && <button className="btn" onClick={() => setQuery('')}>Clear</button>}
    </div>
  );
}

function Shelf({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="shelf-title"><h2>{title}</h2><span>{subtitle}</span></div>
      {children}
    </section>
  );
}

function RecipeGrid({ recipes, openRecipe, toggleFavorite }: { recipes: Recipe[]; openRecipe: (id: string) => void; toggleFavorite: (recipe: Recipe) => void }) {
  if (recipes.length === 0) return <div className="panel"><p className="meta">No recipes match this view yet.</p></div>;
  return (
    <div className="grid">
      {recipes.map((recipe) => (
        <article className="card" key={recipe.id}>
          <button className="card-cover" onClick={() => openRecipe(recipe.id)} aria-label={`Open ${recipe.title}`}>
            {recipe.pages[0]?.imageDataUrl ? <img src={recipe.pages[0].imageDataUrl} alt="Recipe cover" /> : '📖'}
          </button>
          <div className="card-body">
            <h3>{recipe.title}</h3>
            <div className="meta">
              <span>{recipe.pages.length} page{recipe.pages.length === 1 ? '' : 's'}</span>
              <span>•</span>
              <span>{formatMinutes((recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0))}</span>
              {recipe.favorite && <span>• ★ Favorite</span>}
            </div>
            <div className="tags">{recipe.tags.slice(0, 4).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
            <div className="actions" style={{ marginTop: 14 }}>
              <button className="btn" onClick={() => openRecipe(recipe.id)}>Open</button>
              <button className="btn" onClick={() => toggleFavorite(recipe)}>{recipe.favorite ? 'Unfavorite' : 'Favorite'}</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function RecipeForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('Dinner, Family Classic');
  const [collections, setCollections] = useState('Weeknight');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<Recipe['difficulty']>('Easy');
  const [prep, setPrep] = useState('');
  const [cook, setCook] = useState('');
  const [servings, setServings] = useState('');
  const [pages, setPages] = useState<RecipePage[]>([]);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files).slice(0, 10);
    const converted = await Promise.all(selected.map(async (file, index) => ({
      id: crypto.randomUUID(),
      pageNumber: pages.length + index + 1,
      imageDataUrl: await fileToDataUrl(file),
      ocrText: ''
    })));
    setPages((current) => [...current, ...converted]);
  }

  async function save() {
    if (!title.trim()) {
      alert('Add a recipe title first.');
      return;
    }
    const now = new Date().toISOString();
    const recipe: Recipe = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      tags: splitList(tags),
      collections: splitList(collections),
      favorite: false,
      pages: pages.map((page, index) => ({ ...page, pageNumber: index + 1 })),
      notes: notes.trim(),
      difficulty,
      prepTimeMinutes: prep ? Number(prep) : undefined,
      cookTimeMinutes: cook ? Number(cook) : undefined,
      servings: servings ? Number(servings) : undefined,
      createdAt: now,
      updatedAt: now
    };
    await db.recipes.add(recipe);
    onSaved();
  }

  return (
    <section className="panel">
      <div className="shelf-title"><h2>Add recipe</h2><span>Upload 3–10 pages, then organize</span></div>
      <div className="form-grid">
        <div className="field full"><label>Recipe title</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Grandma's stuffed peppers" /></div>
        <div className="field full"><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description or source" /></div>
        <div className="field"><label>Tags, comma separated</label><input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
        <div className="field"><label>Collections, comma separated</label><input value={collections} onChange={(e) => setCollections(e.target.value)} /></div>
        <div className="field"><label>Difficulty</label><select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Recipe['difficulty'])}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
        <div className="field"><label>Servings</label><input type="number" value={servings} onChange={(e) => setServings(e.target.value)} /></div>
        <div className="field"><label>Prep minutes</label><input type="number" value={prep} onChange={(e) => setPrep(e.target.value)} /></div>
        <div className="field"><label>Cook minutes</label><input type="number" value={cook} onChange={(e) => setCook(e.target.value)} /></div>
        <div className="field full"><label>Recipe page photos</label><input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} /></div>
        <div className="field full"><label>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Personal tips, substitutions, family notes..." /></div>
      </div>
      {pages.length > 0 && <div className="tags" style={{ marginTop: 14 }}>{pages.map((page) => <span className="tag" key={page.id}>Page {page.pageNumber}</span>)}</div>}
      <div className="actions" style={{ marginTop: 18 }}><button className="btn primary" onClick={save}>Save Recipe</button></div>
    </section>
  );
}

function RecipeDetail({ recipe, back, refresh, toggleFavorite, removeRecipe }: { recipe: Recipe; back: () => void; refresh: () => void; toggleFavorite: (recipe: Recipe) => void; removeRecipe: (recipe: Recipe) => void }) {
  const [pageIndex, setPageIndex] = useState(0);
  const currentPage = recipe.pages[pageIndex];

  async function saveOffline() {
    if ('caches' in window) {
      const cache = await caches.open('recipe-pages-v1');
      await Promise.all(
        recipe.pages.map((page) =>
          cache.put(
            `recipe-page-${recipe.id}-${page.pageNumber}`,
            new Response(page.imageDataUrl, { headers: { 'Content-Type': 'text/plain' } })
          ).catch(() => undefined)
        )
      );
    }
    alert('Saved locally on this device. For this starter app, the recipe already lives in IndexedDB.');
  }

  return (
    <section>
      <div className="actions" style={{ marginBottom: 18 }}>
        <button className="btn" onClick={back}>← Back</button>
        <button className="btn" onClick={() => toggleFavorite(recipe)}>{recipe.favorite ? '★ Favorite' : '☆ Favorite'}</button>
        <button className="btn green" onClick={saveOffline}>Save Offline</button>
        <button className="btn danger" onClick={() => removeRecipe(recipe)}>Delete</button>
      </div>
      <div className="viewer">
        <div>
          <div className="page-stage">
            {currentPage?.imageDataUrl ? <img src={currentPage.imageDataUrl} alt={`${recipe.title} page ${currentPage.pageNumber}`} /> : <div className="empty-page"><h2>No photo pages yet</h2><p>Add a new recipe with page photos to use the swipe-style reader.</p></div>}
          </div>
          {recipe.pages.length > 0 && <div className="page-controls"><button className="btn" onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}>Previous</button><button className="btn">Page {pageIndex + 1} / {recipe.pages.length}</button><button className="btn" onClick={() => setPageIndex(Math.min(recipe.pages.length - 1, pageIndex + 1))}>Next</button></div>}
        </div>
        <aside className="panel">
          <h1 style={{ marginTop: 0 }}>{recipe.title}</h1>
          <p className="meta">{recipe.difficulty ?? '—'} • Prep {formatMinutes(recipe.prepTimeMinutes)} • Cook {formatMinutes(recipe.cookTimeMinutes)} • Serves {recipe.servings ?? '—'}</p>
          <p>{recipe.description}</p>
          <div className="tags">{recipe.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          <div className="shelf-title"><h2>Collections</h2><span>{recipe.collections.length}</span></div>
          <div className="tags">{recipe.collections.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          <div className="shelf-title"><h2>Notes</h2><span>personal</span></div>
          <p className="meta">{recipe.notes || 'No notes yet.'}</p>
          <p className="meta">Created {new Date(recipe.createdAt).toLocaleDateString()}</p>
        </aside>
      </div>
    </section>
  );
}
