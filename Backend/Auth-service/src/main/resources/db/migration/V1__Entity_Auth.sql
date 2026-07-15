CREATE SCHEMA IF NOT EXISTS app_schema;

CREATE TABLE IF NOT EXISTS app_schema.users(
    id SERIAL PRIMARY KEY,
    c_email VARCHAR(50) NOT NULL,
    c_password VARCHAR(250) NOT NULL,
    c_userid INT NOT NULL
)