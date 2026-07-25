CREATE SCHEMA IF NOT EXISTS app_schema;

CREATE TABLE IF NOT EXISTS app_schema.users(
    id SERIAL PRIMARY KEY,
    c_password VARCHAR(250) NOT NULL,
    c_email VARCHAR(50) NOT NULL,
    c_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    c_verificationcode VARCHAR(6),
    c_codeexpiration TIMESTAMP,
    c_userid BIGINT
)