SELECT * from account
-- Task #1
INSERT INTO account (account_firstname, account_lastname, account_email, account_password) 
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Task #2
UPDATE account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony'
  AND account_lastname = 'Stark'
  
-- Task #3
DELETE FROM account
WHERE account_firstname = 'Tony'
  AND account_lastname = 'Stark'

SELECT * from inventory

SELECT * from classification

-- Task #4
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM'
	AND inv_model = 'Hummer'

-- Task #5
SELECT 
    inventory.inv_make, 
    inventory.inv_model, 
    classification.classification_name
FROM 
    inventory
INNER JOIN 
    classification
ON 
    inventory.classification_id = classification.classification_id
WHERE 
    classification.classification_name = 'Sport';

SELECT * from inventory
-- Task #6
UPDATE inventory
SET 
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');


DELETE FROM classification
WHERE classification_name = 'Slugbug'