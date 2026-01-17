-- -----------------------------------------------------
-- STEP 0: CREATE TABLES (only if they do not exist)
-- -----------------------------------------------------

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    account_id SERIAL PRIMARY KEY,
    account_firstname VARCHAR(50) NOT NULL,
    account_lastname VARCHAR(50) NOT NULL,
    account_email VARCHAR(100) UNIQUE NOT NULL,
    account_password VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) DEFAULT 'Customer'
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    inv_id SERIAL PRIMARY KEY,
    inv_make VARCHAR(50) NOT NULL,
    inv_model VARCHAR(50) NOT NULL,
    inv_description TEXT,
    inv_image VARCHAR(255),
    inv_thumbnail VARCHAR(255),
    classification_id INT
);

-- Classification table
CREATE TABLE IF NOT EXISTS classification (
    classification_id SERIAL PRIMARY KEY,
    classification_name VARCHAR(50) UNIQUE NOT NULL
);

-- -----------------------------------------------------
-- TASKS START
-- -----------------------------------------------------

-- Task 1: Insert a new account
INSERT INTO accounts (
    account_firstname,
    account_lastname,
    account_email,
    account_password
)
VALUES (
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
);

-- Task 2: Update account type to Admin
UPDATE accounts
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Task 3: Delete the account
DELETE FROM accounts
WHERE account_email = 'tony@starkent.com';

-- Task 4: Update inventory description
UPDATE inventory
SET inv_description = REPLACE(
    inv_description,
    'small interiors',
    'a huge interior'
)
WHERE inv_make = 'GM'
  AND inv_model = 'Hummer';

-- Task 5: Select sport vehicles with classification
SELECT
    i.inv_make,
    i.inv_model,
    c.classification_name
FROM inventory i
INNER JOIN classification c
    ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Task 6: Update image paths
UPDATE inventory
SET
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
