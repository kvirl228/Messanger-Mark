CREATE SCHEMA IF NOT EXISTS app_schema;

CREATE TABLE IF NOT EXISTS app_schema.messages(
    id SERIAL PRIMARY KEY,
    c_senderid BIGINT NOT NULL,
    c_chatid BIGINT NOT NULL,
    c_text VARCHAR(400) NOT NULL,
    c_sendtime TIMESTAMP,
    c_messagestatus BOOLEAN NOT NULL
)