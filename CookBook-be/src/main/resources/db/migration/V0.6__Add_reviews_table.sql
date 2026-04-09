CREATE TABLE reviews (
    id          BIGSERIAL   PRIMARY KEY,
    recipe_id   BIGINT      NOT NULL,
    user_id     BIGINT      NOT NULL,
    stars       INT         NOT NULL CHECK (stars BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_reviews_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user   FOREIGN KEY (user_id)   REFERENCES users   (id) ON DELETE CASCADE,
    CONSTRAINT uq_reviews_user_recipe UNIQUE (user_id, recipe_id)
);

CREATE INDEX idx_reviews_recipe ON reviews (recipe_id);
CREATE INDEX idx_reviews_user   ON reviews (user_id);
