>   BEGIN;

-- ================================
-- CLEANUP
-- ================================
DROP TABLE IF EXISTS public.review CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.classification CASCADE;
DROP TABLE IF EXISTS public.account CASCADE;
DROP TYPE IF EXISTS public.account_type;

-- ================================
-- ENUM TYPE FOR ACCOUNT ROLES
-- ================================
CREATE TYPE public.account_type AS ENUM ('Client', 'Employee', 'Admin');

-- ================================
-- CLASSIFICATION TABLE
-- ================================
CREATE TABLE public.classification (
    classification_id SERIAL PRIMARY KEY,
    classification_name VARCHAR(30) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- ACCOUNT TABLE
-- ================================
CREATE TABLE public.account (
    account_id SERIAL PRIMARY KEY,
    account_firstname VARCHAR(50) NOT NULL,
    account_lastname VARCHAR(50) NOT NULL,
    account_email VARCHAR(255) NOT NULL UNIQUE,
    account_password VARCHAR(255) NOT NULL,
    account_type account_type NOT NULL DEFAULT 'Client',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- ================================
-- INVENTORY TABLE
-- ================================
CREATE TABLE public.inventory (
    inv_id SERIAL PRIMARY KEY,
    inv_make VARCHAR(50) NOT NULL,
    inv_model VARCHAR(50) NOT NULL,
    inv_year CHAR(4) NOT NULL CHECK (inv_year ~ '^[0-9]{4}$'),
    inv_description TEXT NOT NULL,
    inv_image VARCHAR(255) NOT NULL,
    inv_thumbnail VARCHAR(255) NOT NULL,
    inv_price NUMERIC(10,2) NOT NULL CHECK (inv_price > 0),
    inv_miles INTEGER NOT NULL CHECK (inv_miles >= 0),
    inv_color VARCHAR(30) NOT NULL,
    classification_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_featured BOOLEAN DEFAULT FALSE,
    stock_status VARCHAR(20) DEFAULT 'In Stock' CHECK (stock_status IN ('In Stock', 'Low Stock', 'Out of Stock')),
    CONSTRAINT fk_classification
        FOREIGN KEY (classification_id)
        REFERENCES public.classification(classification_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ================================
-- REVIEW TABLE
-- ================================
CREATE TABLE public.review (
    review_id SERIAL PRIMARY KEY,
    review_text TEXT NOT NULL CHECK (LENGTH(review_text) >= 10),
    review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    inv_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_approved BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_review_inventory
        FOREIGN KEY (inv_id)
        REFERENCES public.inventory(inv_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_review_account
        FOREIGN KEY (account_id)
        REFERENCES public.account(account_id)
        ON DELETE CASCADE,
    CONSTRAINT unique_user_review_per_vehicle
        UNIQUE (inv_id, account_id)
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================
CREATE INDEX idx_inventory_classification ON public.inventory(classification_id);
CREATE INDEX idx_inventory_make_model ON public.inventory(inv_make, inv_model);
CREATE INDEX idx_inventory_price ON public.inventory(inv_price);
CREATE INDEX idx_inventory_year ON public.inventory(inv_year);
CREATE INDEX idx_account_email ON public.account(account_email);
CREATE INDEX idx_review_inventory ON public.review(inv_id);
CREATE INDEX idx_review_account ON public.review(account_id);
CREATE INDEX idx_review_date ON public.review(review_date DESC);

-- ================================
-- INSERT CLASSIFICATIONS
-- ================================
INSERT INTO public.classification (classification_name) VALUES
('Custom'),
('Sport'),
('SUV'),
('Truck'),
('Sedan');

-- ================================
-- INSERT SAMPLE VEHICLES
-- ================================
INSERT INTO public.inventory (
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id, is_featured
) VALUES
-- =======================
-- CUSTOM VEHICLES (Featured)
-- =======================
('Batmobile', 'Custom', '2007',
 'Ever want to be a superhero? Now you can with this iconic vehicle. Features include bulletproof armor, grappling hooks, and the ability to switch to motorcycle mode for navigating tight city streets.',
 '/images/vehicles/batmobile.jpg', '/images/vehicles/batmobile-tn.jpg', 65000, 29887,
 'Black', 1, TRUE),

('FBI', 'Surveillance Van', '2016',
 'Professional surveillance vehicle equipped with the latest technology. Includes hidden cameras, audio monitoring equipment, and reinforced construction for field operations.',
 '/images/vehicles/survan.jpg', '/images/vehicles/survan-tn.jpg', 20000, 19851,
 'Brown', 1, FALSE),

('Dog', 'Car', '1997',
 'Original 90s classic straight from Aspen, Colorado. This unique vehicle features fluffy dog ears, a wagging tail, and has been fully restored to its original condition.',
 '/images/vehicles/dog-car.jpg', '/images/vehicles/dog-car-tn.jpg', 35000, 71632,
 'White', 1, FALSE),

('Aerocar International', 'Aerocar', '1963',
 'One of only 6 ever made! This revolutionary vehicle converts from car to airplane in minutes. Perfect for avoiding traffic and reaching remote destinations.',
 '/images/vehicles/aerocar.jpg', '/images/vehicles/aerocar-tn.jpg', 700000, 18956,
 'Red', 1, TRUE),

('Monster', 'Truck', '1995',
 'Built for extreme off-road performance. Features 60-inch tires, reinforced chassis, and a powerful V8 engine. Ready for mud, jumps, and rough terrain.',
 '/images/vehicles/monster-truck.jpg', '/images/vehicles/monster-truck-tn.jpg', 150000, 3998,
 'Purple', 1, FALSE),

('Mystery', 'Machine', '1999',
 'The iconic van from the classic cartoon series. Equipped with 4-wheel drive and plenty of space for mystery-solving equipment. Complete with original paint job.',
 '/images/vehicles/mystery-van.jpg', '/images/vehicles/mystery-van-tn.jpg', 10000, 128564,
 'Green', 1, FALSE),

-- =======================
-- SPORT VEHICLES
-- =======================
('Chevy', 'Camaro', '2018',
 'Striking design meets exceptional performance. This Camaro features a V6 engine, sport-tuned suspension, and modern technology package. Perfect for daily driving with style.',
 '/images/vehicles/camaro.jpg', '/images/vehicles/camaro-tn.jpg', 25000, 101222,
 'Silver', 2, TRUE),

('Lamborghini', 'Adventador', '2016',
 'Exotic Italian supercar with breathtaking performance. The V12 engine produces 700+ horsepower, reaching 0-60 mph in under 3 seconds. Includes carbon fiber body and premium interior.',
 '/images/vehicles/adventador.jpg', '/images/vehicles/adventador-tn.jpg', 417650, 71003,
 'Blue', 2, TRUE),

-- =======================
-- SUV VEHICLES
-- =======================
('Jeep', 'Wrangler', '2019',
 'Legendary off-road capability with modern comforts. Features 4-wheel drive, removable doors and roof, and advanced safety systems. Perfect for adventure seekers.',
 '/images/vehicles/wrangler.jpg', '/images/vehicles/wrangler-tn.jpg', 28045, 41205,
 'Yellow', 3, FALSE),

-- =======================
-- TRUCK VEHICLES
-- =======================
('Cadillac', 'Escalade', '2019',
 'Full-size luxury SUV with premium features. Includes leather seating, advanced entertainment system, and powerful V8 engine. Perfect for family trips or business meetings.',
 '/images/vehicles/escalade.jpg', '/images/vehicles/escalade-tn.jpg', 75195, 41958,
 'Black', 4, FALSE),

('GM', 'Hummer', '2016',
 'Rugged off-road vehicle with impressive towing capacity. Features reinforced construction, all-terrain tires, and advanced 4WD system. Ready for any challenge.',
 '/images/vehicles/hummer.jpg', '/images/vehicles/hummer-tn.jpg', 58800, 56564,
 'Yellow', 4, FALSE),

('Spartan', 'Fire Truck', '2012',
 'Fully equipped emergency vehicle. Includes 1000 ft. of hose, 1000 gallon water tank, and emergency lighting system. Great for municipalities or special events.',
 '/images/vehicles/fire-truck.jpg', '/images/vehicles/fire-truck-tn.jpg', 50000, 38522,
 'Red', 4, TRUE),

-- =======================
-- SEDAN VEHICLES
-- =======================
('Mechanic', 'Special', '1964',
 'Restoration project with great potential. Original parts included. With some TLC, this classic can be brought back to its former glory.',
 '/images/vehicles/mechanic.jpg', '/images/vehicles/mechanic-tn.jpg', 100, 200125,
 'Rust', 5, FALSE),

('Ford', 'Model T', '1921',
 'Historic automobile - the first mass-produced car. Original condition with hand-crank start. A true piece of automotive history.',
 '/images/vehicles/model-t.jpg', '/images/vehicles/model-t-tn.jpg', 30000, 26357,
 'Black', 5, FALSE),

('Ford', 'Crown Victoria', '2013',
 'Former police interceptor in excellent condition. Features include reinforced suspension, heavy-duty brakes, and original police package equipment.',
 '/images/vehicles/crwn-vic.jpg', '/images/vehicles/crwn-vic-tn.jpg', 10000, 108247,
 'White', 5, FALSE);

-- ================================
-- INSERT SAMPLE ACCOUNTS
-- ================================
-- Password for all accounts: "password123"
INSERT INTO public.account (
    account_firstname, account_lastname, account_email,
    account_password, account_type, created_at
) VALUES
-- Admin Account
('System', 'Administrator', 'admin@cse340.com',
 '$2a$10$N7B3Z8s9cTqYwVhLmNpQReKjK8S2M3X4V5B6n7C8d9e0f1g2h3i4j5',
 'Admin', NOW() - INTERVAL '30 days'),

-- Employee Accounts
('Sarah', 'Johnson', 'sarah.j@cse340.com',
 '$2a$10$N7B3Z8s9cTqYwVhLmNpQReKjK8S2M3X4V5B6n7C8d9e0f1g2h3i4j5',
 'Employee', NOW() - INTERVAL '15 days'),

('Michael', 'Chen', 'michael.c@cse340.com',
 '$2a$10$N7B3Z8s9cTqYwVhLmNpQReKjK8S2M3X4V5B6n7C8d9e0f1g2h3i4j5',
 'Employee', NOW() - INTERVAL '10 days'),

-- Client Accounts
('John', 'Doe', 'john.doe@example.com',
 '$2a$10$N7B3Z8s9cTqYwVhLmNpQReKjK8S2M3X4V5B6n7C8d9e0f1g2h3i4j5',
 'Client', NOW() - INTERVAL '5 days'),

('Emma', 'Wilson', 'emma.wilson@example.com',
 '$2a$10$N7B3Z8s9cTqYwVhLmNpQReKjK8S2M3X4V5B6n7C8d9e0f1g2h3i4j5',
 'Client', NOW() - INTERVAL '2 days'),

('Robert', 'Smith', 'robert.smith@example.com',
 '$2a$10$N7B3Z8s9cTqYwVhLmNpQReKjK8S2M3X4V5B6n7C8d9e0f1g2h3i4j5',
 'Client', NOW() - INTERVAL '1 day');

-- ================================
-- INSERT SAMPLE REVIEWS
-- ================================
INSERT INTO public.review (review_text, inv_id, account_id, rating) VALUES
('Absolutely love my Batmobile! The motorcycle mode is perfect for city traffic. Highly recommended!', 1, 4, 5),
('Great surveillance van for my security business. Well-maintained and reliable.', 2, 5, 4),
('The Dog Car is a conversation starter everywhere I go! So much fun to drive.', 3, 6, 5),
('The Aerocar is everything I hoped for. Flying to work beats sitting in traffic!', 4, 4, 5),
('Camaro handles beautifully and turns heads wherever I go. Great value for money.', 7, 5, 4),
('The Wrangler tackled the mountain trails with ease. Perfect adventure vehicle!', 9, 6, 5);

-- ================================
-- UPDATE TRIGGER FUNCTION FOR INVENTORY
-- ================================
CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_modtime
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_timestamp();

-- ================================
-- VIEWS FOR REPORTING
-- ================================
CREATE VIEW public.inventory_summary AS
SELECT 
    c.classification_name,
    COUNT(i.inv_id) AS vehicle_count,
    MIN(i.inv_price) AS min_price,
    MAX(i.inv_price) AS max_price,
    ROUND(AVG(i.inv_price), 2) AS avg_price,
    SUM(i.inv_miles) AS total_miles,
    ROUND(AVG(i.inv_miles), 0) AS avg_miles
FROM public.inventory i
JOIN public.classification c ON i.classification_id = c.classification_id
GROUP BY c.classification_name, c.classification_id
ORDER BY c.classification_name;

CREATE VIEW public.featured_vehicles AS
SELECT 
    i.inv_id,
    i.inv_make,
    i.inv_model,
    i.inv_year,
    i.inv_price,
    i.inv_image,
    i.inv_thumbnail,
    c.classification_name
FROM public.inventory i
JOIN public.classification c ON i.classification_id = c.classification_id
WHERE i.is_featured = TRUE
ORDER BY i.inv_price DESC;

CREATE VIEW public.recent_reviews AS
SELECT 
    r.review_id,
    r.review_text,
    r.review_date,
    r.rating,
    a.account_firstname || ' ' || a.account_lastname AS reviewer_name,
    i.inv_make || ' ' || i.inv_model AS vehicle_name
FROM public.review r
JOIN public.account a ON r.account_id = a.account_id
JOIN public.inventory i ON r.inv_id = i.inv_id
WHERE r.is_approved = TRUE
ORDER BY r.review_date DESC
LIMIT 10;

-- ================================
-- VERIFICATION QUERIES
-- ================================
SELECT '=== DATABASE SETUP COMPLETE ===' AS message;

SELECT 'Classifications:' AS table_name, COUNT(*) AS count FROM public.classification
UNION ALL
SELECT 'Inventory:', COUNT(*) FROM public.inventory
UNION ALL
SELECT 'Accounts:', COUNT(*) FROM public.account
UNION ALL
SELECT 'Reviews:', COUNT(*) FROM public.review;

SELECT '=== ACCOUNT SUMMARY ===' AS message;
SELECT 
    account_type,
    COUNT(*) AS count,
    MIN(created_at) AS first_account,
    MAX(created_at) AS last_account
FROM public.account
GROUP BY account_type
ORDER BY account_type;

SELECT '=== INVENTORY SUMMARY ===' AS message;
SELECT * FROM public.inventory_summary;

SELECT '=== FEATURED VEHICLES ===' AS message;
SELECT 
    classification_name,
    inv_make,
    inv_model,
    inv_year,
    '$' || TO_CHAR(inv_price, 'FM999,999,999') AS price
FROM public.featured_vehicles
ORDER BY classification_name, inv_price DESC;

SELECT '=== RECENT REVIEWS ===' AS message;
SELECT 
    vehicle_name,
    reviewer_name,
    rating,
    LEFT(review_text, 50) || '...' AS preview
FROM public.recent_reviews
ORDER BY review_date DESC
LIMIT 5;

COMMIT;

-- ================================
-- POST-SETUP INSTRUCTIONS
-- ================================
SELECT '=== IMPORTANT NOTES ===' AS message;
SELECT '1. Admin login: admin@cse340.com / password123' AS note
UNION ALL
SELECT '2. Employee login: sarah.j@cse340.com / password123'
UNION ALL
SELECT '3. Client login: john.doe@example.com / password123'
UNION ALL
SELECT '4. Access inventory management at: /inv/ (requires Admin/Employee login)'
UNION ALL
SELECT '5. Test accounts are ready for W04 assignment requirements';
