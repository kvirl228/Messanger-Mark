CREATE TABLE IF NOT EXISTS app_schema.chat_members(
    id SERIAL PRIMARY KEY,
    c_chatid BIGINT NOT NULL,
    c_userid BIGINT NOT NULL,
    c_role VARCHAR(50)
)