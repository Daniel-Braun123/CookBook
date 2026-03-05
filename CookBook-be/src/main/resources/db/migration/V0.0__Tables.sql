-- Active: 1772115538381@@127.0.0.1@5433@CookBookDb
-- =============================================
-- CookBook Database Schema
-- Flyway Migration V0.0
-- PostgreSQL on localhost:5433 / CookBookDb
-- =============================================

-- =============================================
-- 1. users
-- =============================================
CREATE TABLE users (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    avatar      VARCHAR(500),
    bio         TEXT,
    password    VARCHAR(255)    NOT NULL,
    joined_at   TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. categories
-- =============================================
CREATE TABLE categories (
    id      BIGSERIAL       PRIMARY KEY,
    name    VARCHAR(100)    NOT NULL UNIQUE,
    icon    VARCHAR(100),
    count   INT             NOT NULL DEFAULT 0
);

-- =============================================
-- 3. recipes
-- =============================================
CREATE TABLE recipes (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT            NOT NULL,
    image           VARCHAR(500),
    rating          DECIMAL(2,1)    NOT NULL DEFAULT 0.0,
    review_count    INT             NOT NULL DEFAULT 0,
    prep_time       INT             NOT NULL,
    cook_time       INT             NOT NULL,
    difficulty      VARCHAR(20)     NOT NULL,
    servings        INT             NOT NULL,
    tags            JSON,
    author_id       BIGINT          NOT NULL,
    category_id     BIGINT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_recipes_author
        FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_recipes_category
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

-- =============================================
-- 4. ingredients
-- =============================================
CREATE TABLE ingredients (
    id          BIGSERIAL       PRIMARY KEY,
    recipe_id   BIGINT          NOT NULL,
    name        VARCHAR(150)    NOT NULL,
    amount      DECIMAL(10,2)   NOT NULL,
    unit        VARCHAR(50)     NOT NULL,

    CONSTRAINT fk_ingredients_recipe
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

-- =============================================
-- 5. cooking_steps
-- =============================================
CREATE TABLE cooking_steps (
    id              BIGSERIAL       PRIMARY KEY,
    recipe_id       BIGINT          NOT NULL,
    step_number     INT             NOT NULL,
    instruction     TEXT            NOT NULL,
    image           VARCHAR(500),
    duration        INT,

    CONSTRAINT fk_steps_recipe
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

-- =============================================
-- 6. nutrition_info
-- =============================================
CREATE TABLE nutrition_info (
    id          BIGSERIAL       PRIMARY KEY,
    recipe_id   BIGINT          NOT NULL UNIQUE,
    calories    INT             NOT NULL,
    protein     INT             NOT NULL,
    carbs       INT             NOT NULL,
    fat         INT             NOT NULL,
    fiber       INT,

    CONSTRAINT fk_nutrition_recipe
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

-- =============================================
-- 7. saved_recipes
-- =============================================
CREATE TABLE saved_recipes (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL,
    recipe_id   BIGINT          NOT NULL,

    CONSTRAINT fk_saved_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_recipe
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
    CONSTRAINT uq_saved_user_recipe
        UNIQUE (user_id, recipe_id)
);

-- =============================================
-- Indexes for common queries
-- =============================================
CREATE INDEX idx_recipes_author      ON recipes (author_id);
CREATE INDEX idx_recipes_category    ON recipes (category_id);
CREATE INDEX idx_recipes_rating      ON recipes (rating DESC);
CREATE INDEX idx_ingredients_recipe  ON ingredients (recipe_id);
CREATE INDEX idx_steps_recipe        ON cooking_steps (recipe_id);
CREATE INDEX idx_saved_user          ON saved_recipes (user_id);
CREATE INDEX idx_saved_recipe        ON saved_recipes (recipe_id);
