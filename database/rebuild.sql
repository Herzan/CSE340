-- ==========================================
-- DATABASE REBUILD SCRIPT
-- ==========================================

-- STEP 1: DROP TABLES (order matters)
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS classification;
DROP TABLE IF EXISTS accounts;

-- STEP 2: CREATE TABLES

CREATE TABLE accounts (
    account_id SERIAL PRIMARY KEY,
    account_firstname VARCHAR(50) NOT NULL,
    account_lastname VARCHAR(50) NOT NULL,
    account_email VARCHAR(100) UNIQUE NOT NULL,
    account_password VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) DEFAULT 'Customer'
);

CREATE TABLE classification (
    classification_id SERIAL PRIMARY KEY,
    classification_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE inventory (
    inv_id SERIAL PRIMARY KEY,
    inv_make VARCHAR(50) NOT NULL,
    inv_model VARCHAR(50) NOT NULL,
    inv_description TEXT NOT NULL,
    inv_image VARCHAR(255),
    inv_thumbnail VARCHAR(255),
    classification_id INT REFERENCES classification(classification_id)
);

-- STEP 3: INSERT SEED DATA

INSERT INTO classification (classification_name)
VALUES
('Sport'),
('SUV'),
('Truck'),
('Sedan');

INSERT INTO inventory (
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    classification_id
)
VALUES (
    'GM',
    'Hummer',
    'A vehicle with small interiors',
    '/images/hummer.jpg',
    '/images/hummer-tn.jpg',
    2
);

-- STEP 4: UPDATE STATEMENTS (REQUIRED TASKS)

-- Update GM Hummer description
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM'
AND inv_model = 'Hummer';

-- Update image paths
UPDATE inventory
SET
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
