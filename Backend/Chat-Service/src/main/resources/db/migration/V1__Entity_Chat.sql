CREATE SCHEMA IF NOT EXISTS app_schema;

CREATE TABLE IF NOT EXISTS app_schema.chats(
    id SERIAL PRIMARY KEY,
    c_type VARCHAR(20) NOT NULL,
    c_title VARCHAR(50),
    c_groupbio VARCHAR(200)
)