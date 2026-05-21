-- Active: 1772115538381@@127.0.0.1@5433@CookBookDb
-- =============================================
-- Chat History Tables
-- =============================================

CREATE TABLE chat_conversations (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL,
    title       VARCHAR(200)    NOT NULL DEFAULT 'Neues Gespräch',
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_chat_conv_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE chat_messages (
    id                  BIGSERIAL       PRIMARY KEY,
    conversation_id     BIGINT          NOT NULL,
    role                VARCHAR(20)     NOT NULL,
    content             TEXT            NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_chat_msg_conv
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations (id) ON DELETE CASCADE
);
