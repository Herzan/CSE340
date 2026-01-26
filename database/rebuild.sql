-- Complete database setup for CSE340
-- Run this SQL in your PostgreSQL database

-- Clean up existing tables
DROP TABLE IF EXISTS public.review;
DROP TABLE IF EXISTS public.inventory;
DROP TABLE IF EXISTS public.classification;
DROP TABLE IF EXISTS public.account;

-- Create ENUM type for account_type
CREATE TYPE public.account_type AS ENUM ('Client', 'Employee', 'Admin');

-- 1. Classification Table
CREATE TABLE public.classification (
    classification_id SERIAL PRIMARY KEY,
    classification_name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Account Table
CREATE TABLE public.account (
    account_id SERIAL PRIMARY KEY,
    account_firstname VARCHAR(50) NOT NULL,
    account_lastname VARCHAR(50) NOT NULL,
    account_email VARCHAR(100) NOT NULL UNIQUE,
    account_password VARCHAR(200) NOT NULL,
    account_type account_type NOT NULL DEFAULT 'Client',
    account_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inventory Table
CREATE TABLE public.inventory (
    inv_id SERIAL PRIMARY KEY,
    inv_make VARCHAR(50) NOT NULL,
    inv_model VARCHAR(50) NOT NULL,
    inv_year CHAR(4) NOT NULL,
    inv_description TEXT NOT NULL,
    inv_image VARCHAR(255) NOT NULL,
    inv_thumbnail VARCHAR(255) NOT NULL,
    inv_price DECIMAL(10, 2) NOT NULL,
    inv_miles INTEGER NOT NULL,
    inv_color VARCHAR(30) NOT NULL,
    classification_id INTEGER NOT NULL,
    CONSTRAINT fk_classification 
        FOREIGN KEY (classification_id) 
        REFERENCES public.classification(classification_id)
        ON DELETE CASCADE
);

-- 4. Review Table
CREATE TABLE public.review (
    review_id SERIAL PRIMARY KEY,
    review_text TEXT NOT NULL,
    review_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    inv_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    CONSTRAINT fk_inventory 
        FOREIGN KEY (inv_id) 
        REFERENCES public.inventory(inv_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_account 
        FOREIGN KEY (account_id) 
        REFERENCES public.account(account_id) 
        ON DELETE CASCADE
);

-- Insert Classifications
INSERT INTO public.classification (classification_name) VALUES 
('Custom'),
('Sedan'),
('SUV'),
('Truck'),
('Sport');

-- Insert Sample Vehicles
INSERT INTO public.inventory (
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
) VALUES
-- Custom Vehicles
('Batmobile', 'Custom', '2007', 'Ever want to be a super hero? Now you can.',
 '/images/vehicles/batmobile.jpg', '/images/vehicles/batmobile-tn.jpg', 65000, 29887, 'Black', 1),
('FBI', 'Surveillance Van', '2016', 'Do you like police shows? You will feel right at home driving this van.',
 '/images/vehicles/survan.jpg', '/images/vehicles/survan-tn.jpg', 20000, 19851, 'Brown', 1),
('Dog', 'Car', '1997', 'Original Dog Car complete with fluffy ears.',
 '/images/vehicles/dog-car.jpg', '/images/vehicles/dog-car-tn.jpg', 35000, 71632, 'White', 1),
('DMC', 'Delorean', '1981', 'So fast it is almost like traveling in time.',
 '/images/vehicles/delorean.jpg', '/images/vehicles/delorean-tn.jpg', 69999, 74750, 'Silver', 1),
('Mystery', 'Machine', '1999', 'Scooby and the gang always found luck in solving mysteries.',
 '/images/vehicles/mystery-van.jpg', '/images/vehicles/mystery-van-tn.jpg', 10000, 128564, 'Green', 1);

-- Insert Sample Account (password: password123)
INSERT INTO public.account (
    account_firstname, account_lastname, account_email, account_password, account_type
) VALUES
('John', 'Doe', 'john@example.com', '$2a$10$N7B3Z8s9cTqYwVhLmNpQReKjK8S2M3X4V5B6n7C8d9e0f1g2h3i4j5', 'Client');

-- Verify data
SELECT 'Classifications:' as table, COUNT(*) as count FROM classification
UNION ALL
SELECT 'Inventory:', COUNT(*) FROM inventory
UNION ALL
SELECT 'Accounts:', COUNT(*) FROM account;

-- Test query
SELECT c.classification_name, i.inv_make, i.inv_model, i.inv_year 
FROM inventory i
JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Custom';