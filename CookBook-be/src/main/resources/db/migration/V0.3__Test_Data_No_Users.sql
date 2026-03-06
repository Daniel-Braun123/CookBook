-- =============================================
-- CookBook Test Data
-- Flyway Migration V0.3
-- =============================================

-- =============================================
-- 1. Test Users (Minimal)
-- =============================================
-- Note: Passwords are BCrypt hashed "password123"
INSERT INTO users (id, name, email, password, joined_at) VALUES
(1, 'Test User 1', 'test1@cookbook.de', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgW.Q6h7M.FWqJz/fFPL2oFP3D4K', NOW()),
(2, 'Test User 2', 'test2@cookbook.de', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgW.Q6h7M.FWqJz/fFPL2oFP3D4K', NOW()),
(3, 'Test User 3', 'test3@cookbook.de', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgW.Q6h7M.FWqJz/fFPL2oFP3D4K', NOW()),
(4, 'Test User 4', 'test4@cookbook.de', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgW.Q6h7M.FWqJz/fFPL2oFP3D4K', NOW()),
(5, 'Test User 5', 'test5@cookbook.de', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgW.Q6h7M.FWqJz/fFPL2oFP3D4K', NOW())
ON CONFLICT (email) DO NOTHING;

-- Reset sequence to ensure next user gets ID > 5
SELECT setval('users_id_seq', GREATEST(5, (SELECT MAX(id) FROM users)));

-- =============================================
-- 2. Categories
-- =============================================
INSERT INTO categories (id, name, icon, count) VALUES
(1, 'Frühstück', '🍳', 1),
(2, 'Pasta', '🍝', 1),
(3, 'Vegan', '🥗', 1),
(4, 'Fisch', '🐟', 1),
(5, 'Dessert', '🍰', 1),
(6, 'Suppen', '🍲', 1)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to ensure next category gets ID > 6
SELECT setval('categories_id_seq', GREATEST(6, (SELECT MAX(id) FROM categories)));

-- =============================================
-- 3. Recipes
-- =============================================

-- Recipe 1: Cremige Tomatensuppe
INSERT INTO recipes (id, title, description, image, rating, review_count, prep_time, cook_time, difficulty, servings, tags, author_id, category_id, created_at) VALUES
(1, 'Cremige Tomatensuppe mit Basilikum', 
 'Eine samtige Tomatensuppe mit frischem Basilikum und einem Hauch von Knoblauch. Perfekt für kalte Tage.',
 '/recipes/tomato-soup.jpg',
 4.8,
 234,
 15,
 30,
 'EINFACH',
 4,
 '["Vegetarisch", "Gesund", "Schnell"]',
 1,
 6,
 '2024-01-15');

-- Recipe 2: Klassische Spaghetti Carbonara
INSERT INTO recipes (id, title, description, image, rating, review_count, prep_time, cook_time, difficulty, servings, tags, author_id, category_id, created_at) VALUES
(2, 'Klassische Spaghetti Carbonara',
 'Original italienische Carbonara mit Guanciale, Pecorino und cremiger Eier-Sauce. Ein zeitloser Klassiker.',
 '/recipes/carbonara.jpg',
 4.9,
 567,
 10,
 20,
 'MITTEL',
 4,
 '["Italienisch", "Klassiker"]',
 2,
 2,
 '2024-01-10');

-- Recipe 3: Veganer Buddha Bowl
INSERT INTO recipes (id, title, description, image, rating, review_count, prep_time, cook_time, difficulty, servings, tags, author_id, category_id, created_at) VALUES
(3, 'Veganer Buddha Bowl',
 'Bunte Schüssel voller Nährstoffe mit Quinoa, geröstetem Gemüse und Tahini-Dressing.',
 '/recipes/buddha-bowl.jpg',
 4.7,
 189,
 20,
 25,
 'EINFACH',
 2,
 '["Vegan", "Gesund", "Bowl"]',
 3,
 3,
 '2024-01-12');

-- Recipe 4: Fluffige Pancakes
INSERT INTO recipes (id, title, description, image, rating, review_count, prep_time, cook_time, difficulty, servings, tags, author_id, category_id, created_at) VALUES
(4, 'Fluffige Pancakes mit Ahornsirup',
 'Amerikanische Pancakes, die auf der Zunge zergehen. Mit echtem Ahornsirup und frischen Beeren.',
 '/recipes/pancakes.jpg',
 4.6,
 423,
 10,
 15,
 'EINFACH',
 4,
 '["Süß", "Frühstück", "Amerikanisch"]',
 4,
 1,
 '2024-01-08');

-- Recipe 5: Mediterraner Lachs
INSERT INTO recipes (id, title, description, image, rating, review_count, prep_time, cook_time, difficulty, servings, tags, author_id, category_id, created_at) VALUES
(5, 'Mediterraner Lachs mit Gemüse',
 'Zarter Lachs auf einem Bett von gegrilltem Mittelmeer-Gemüse mit Zitronen-Kräuter-Butter.',
 '/recipes/salmon.jpg',
 4.9,
 312,
 15,
 25,
 'MITTEL',
 2,
 '["Gesund", "Low Carb", "Mediterran"]',
 5,
 4,
 '2024-01-05');

-- Recipe 6: Tiramisu
INSERT INTO recipes (id, title, description, image, rating, review_count, prep_time, cook_time, difficulty, servings, tags, author_id, category_id, created_at) VALUES
(6, 'Tiramisu Klassisch',
 'Das Original aus Italien: Löffelbiskuits, Mascarpone, Espresso und Kakao in perfekter Harmonie.',
 '/recipes/tiramisu.jpg',
 4.8,
 456,
 30,
 0,
 'MITTEL',
 8,
 '["Italienisch", "Süß", "No-Bake"]',
 2,
 5,
 '2024-01-03')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to ensure next recipe gets ID > 6
SELECT setval('recipes_id_seq', GREATEST(6, (SELECT MAX(id) FROM recipes)));

-- =============================================
-- 4. Ingredients
-- =============================================

-- Ingredients for Recipe 1 (Tomatensuppe)
INSERT INTO ingredients (recipe_id, name, amount, unit) VALUES
(1, 'Tomaten (Dose)', 800, 'g'),
(1, 'Zwiebel', 1, 'Stück'),
(1, 'Knoblauch', 2, 'Zehen'),
(1, 'Basilikum', 1, 'Bund'),
(1, 'Sahne', 100, 'ml'),
(1, 'Olivenöl', 2, 'EL'),
(1, 'Salz', 1, 'TL'),
(1, 'Pfeffer', 1, 'Prise')
ON CONFLICT DO NOTHING;

-- Ingredients for Recipe 2 (Carbonara)
INSERT INTO ingredients (recipe_id, name, amount, unit) VALUES
(2, 'Spaghetti', 400, 'g'),
(2, 'Guanciale', 200, 'g'),
(2, 'Eigelb', 4, 'Stück'),
(2, 'Pecorino Romano', 100, 'g'),
(2, 'Schwarzer Pfeffer', 2, 'TL')
ON CONFLICT DO NOTHING;

-- Ingredients for Recipe 3 (Buddha Bowl)
INSERT INTO ingredients (recipe_id, name, amount, unit) VALUES
(3, 'Quinoa', 150, 'g'),
(3, 'Kichererbsen', 200, 'g'),
(3, 'Süßkartoffel', 1, 'große'),
(3, 'Avocado', 1, 'Stück'),
(3, 'Spinat', 100, 'g'),
(3, 'Tahini', 3, 'EL')
ON CONFLICT DO NOTHING;

-- Ingredients for Recipe 4 (Pancakes)
INSERT INTO ingredients (recipe_id, name, amount, unit) VALUES
(4, 'Mehl', 250, 'g'),
(4, 'Milch', 300, 'ml'),
(4, 'Eier', 2, 'Stück'),
(4, 'Backpulver', 2, 'TL'),
(4, 'Butter', 30, 'g'),
(4, 'Ahornsirup', 100, 'ml')
ON CONFLICT DO NOTHING;

-- Ingredients for Recipe 5 (Lachs)
INSERT INTO ingredients (recipe_id, name, amount, unit) VALUES
(5, 'Lachsfilet', 400, 'g'),
(5, 'Zucchini', 1, 'Stück'),
(5, 'Paprika', 2, 'Stück'),
(5, 'Cherrytomaten', 200, 'g'),
(5, 'Zitrone', 1, 'Stück'),
(5, 'Frische Kräuter', 1, 'Bund')
ON CONFLICT DO NOTHING;

-- Ingredients for Recipe 6 (Tiramisu)
INSERT INTO ingredients (recipe_id, name, amount, unit) VALUES
(6, 'Löffelbiskuits', 400, 'g'),
(6, 'Mascarpone', 500, 'g'),
(6, 'Espresso', 300, 'ml'),
(6, 'Eigelb', 4, 'Stück'),
(6, 'Zucker', 100, 'g'),
(6, 'Kakaopulver', 2, 'EL')
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. Cooking Steps
-- =============================================

-- Steps for Recipe 1 (Tomatensuppe)
INSERT INTO cooking_steps (recipe_id, step_number, instruction, duration) VALUES
(1, 1, 'Zwiebel und Knoblauch fein hacken und in Olivenöl glasig anschwitzen.', 5),
(1, 2, 'Die Dosentomaten hinzugeben und 20 Minuten köcheln lassen.', 20),
(1, 3, 'Mit einem Stabmixer pürieren bis die Suppe cremig ist.', 2),
(1, 4, 'Sahne einrühren und mit Salz und Pfeffer abschmecken.', 2),
(1, 5, 'Mit frischem Basilikum garnieren und servieren.', 1)
ON CONFLICT DO NOTHING;

-- Steps for Recipe 2 (Carbonara)
INSERT INTO cooking_steps (recipe_id, step_number, instruction, duration) VALUES
(2, 1, 'Spaghetti in reichlich Salzwasser al dente kochen.', 10),
(2, 2, 'Guanciale in Streifen schneiden und knusprig braten.', 8),
(2, 3, 'Eigelb mit geriebenem Pecorino und Pfeffer vermischen.', 2),
(2, 4, 'Heiße Pasta zum Guanciale geben und vom Herd nehmen.', 1),
(2, 5, 'Ei-Käse-Mischung unterrühren bis eine cremige Sauce entsteht.', 2)
ON CONFLICT DO NOTHING;

-- Steps for Recipe 3 (Buddha Bowl)
INSERT INTO cooking_steps (recipe_id, step_number, instruction, duration) VALUES
(3, 1, 'Quinoa nach Packungsanleitung kochen.', 15),
(3, 2, 'Süßkartoffel würfeln und mit Kichererbsen im Ofen rösten.', 25),
(3, 3, 'Tahini-Dressing aus Tahini, Zitrone und Wasser anrühren.', 3),
(3, 4, 'Alle Zutaten in einer Schüssel anrichten und mit Dressing servieren.', 5)
ON CONFLICT DO NOTHING;

-- Steps for Recipe 4 (Pancakes)
INSERT INTO cooking_steps (recipe_id, step_number, instruction, duration) VALUES
(4, 1, 'Mehl, Backpulver und eine Prise Salz vermischen.', 2),
(4, 2, 'Milch, Eier und geschmolzene Butter hinzufügen und verrühren.', 3),
(4, 3, 'In einer Pfanne bei mittlerer Hitze goldbraun backen.', 15),
(4, 4, 'Mit Ahornsirup und frischen Beeren servieren.', 2)
ON CONFLICT DO NOTHING;

-- Steps for Recipe 5 (Lachs)
INSERT INTO cooking_steps (recipe_id, step_number, instruction, duration) VALUES
(5, 1, 'Gemüse in mundgerechte Stücke schneiden.', 10),
(5, 2, 'Gemüse auf einem Backblech verteilen und mit Olivenöl beträufeln.', 5),
(5, 3, 'Lachs würzen und auf das Gemüse legen.', 3),
(5, 4, 'Bei 200°C etwa 20 Minuten backen.', 20),
(5, 5, 'Mit Zitronensaft und frischen Kräutern servieren.', 2)
ON CONFLICT DO NOTHING;

-- Steps for Recipe 6 (Tiramisu)
INSERT INTO cooking_steps (recipe_id, step_number, instruction, duration) VALUES
(6, 1, 'Eigelb mit Zucker cremig schlagen.', 5),
(6, 2, 'Mascarpone vorsichtig unterheben.', 3),
(6, 3, 'Löffelbiskuits kurz in Espresso tauchen und schichten.', 10),
(6, 4, 'Abwechselnd Creme und Biskuits schichten.', 10),
(6, 5, 'Mindestens 4 Stunden kühlen und mit Kakao bestäuben.', 240)
ON CONFLICT DO NOTHING;

-- =============================================
-- 6. Nutrition Info
-- =============================================

INSERT INTO nutrition_info (recipe_id, calories, protein, carbs, fat, fiber) VALUES
(1, 180, 4, 15, 12, 3),
(2, 650, 25, 70, 30, 3),
(3, 520, 18, 60, 24, 12),
(4, 380, 10, 55, 14, NULL),
(5, 420, 35, 15, 25, 5),
(6, 420, 8, 45, 24, NULL)
ON CONFLICT (recipe_id) DO NOTHING;
