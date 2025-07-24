-- Database schema for ExploreMore PH authentication system
-- Create database
CREATE DATABASE IF NOT EXISTS exploremoreph;
USE exploremoreph;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Create feedback table (referenced in server.js)
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    feedback TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_verified (is_verified)
);

-- Insert sample admin user (optional)
-- Password is 'Admin123!' (hashed with bcrypt)
-- INSERT INTO users (username, email, password_hash, role) VALUES 
-- ('admin', 'admin@exploremore.ph', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXXx/ZKLd/W2', 'admin')
-- ON DUPLICATE KEY UPDATE role = 'admin';


-- NEW STUFF STARTS HERE

-- ADDITING the "filter_feedback table" in the feedback table
ALTER TABLE feedback 
ADD COLUMN filtered_feedback TEXT NULL AFTER feedback;

UPDATE feedback 
SET filtered_feedback = feedback 
WHERE filtered_feedback IS NULL;


-- tourist_spot and price_breakdown table
--CREATE tourist_spot TABLE
CREATE TABLE tourist_spots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(150) NOT NULL,
  region ENUM('Luzon', 'Visayas', 'Mindanao') NOT NULL
);


-- THE DATA INSERT for touristspots
INSERT INTO tourist_spots (name, location, region) VALUES
-- Luzon
('Nagsasa Cove', 'Zambales', 'Luzon'),
('Pacific View Deck', 'Dingalan, Aurora', 'Luzon'),
('Masungi Georeserve', 'Tanay, Guimaras', 'Luzon'),

-- Visayas
('Guisi Lighthouse', 'Guimaras', 'Visayas'),
('Linao Cave', 'Guiuan', 'Visayas'),
('Nova Shell Museum', 'Panglao, Bohol', 'Visayas'),

-- Mindanao
('Philippine Eagle Center', 'Davao City', 'Mindanao'),
('Tinago Falls', 'Iligan City', 'Mindanao'),
('Mount Hamiguitan Range Wildlife Sanctuary', 'Mati City', 'Mindanao'); 




--CREATE price_breakdown TABLE
CREATE TABLE price_breakdown (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spot_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,  
  label VARCHAR(255) NOT NULL,     
  price_min DECIMAL(10,2),        
  price_max DECIMAL(10,2),        
  notes TEXT,                    
  FOREIGN KEY (spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE
);  


-- THE DATA INSERT for pricebreakdown
INSERT INTO price_breakdown (spot_id, category, label, price_min, price_max, notes) VALUES
-- Nagsasa Cove (Zambales)
(1, 'Total', 'Average total of the whole stay', 8560.00, 13160.00, '2 overnight stays for 4 people'),
(1, 'Accommodation', 'Average cost of accommodation', 500.00, 750.00, ''),
(1, 'Transportation', 'Bus', 540.00, 800.00, 'Manila to San Antonio round trip'),
(1, 'Transportation', 'Tricycle', 100.00, 200.00, 'To Pundaquit beach round trip'),
(1, 'Transportation', 'Boat', 1000.00, 1800.00, 'Pundaquit to Nagsasa round trip'),
(1, 'Food', 'Average Food Cost', 1300.00, 3000.00, ''),
(1, 'Fees', 'Entrance Fee', 50.00, 50.00, 'Per person'),
(1, 'Fees', 'Overnight Fee', 100.00, 100.00, 'Per person'),
(1, 'Fees', 'Cottage/Hut Rental Fee (Day)', 100.00, 100.00, 'Per cottage'),
(1, 'Fees', 'Cottage/Hut Rental Fee (Overnight)', 200.00, 200.00, 'Per cottage'),
(1, 'Fees', 'Tent Rental Fee', 400.00, 500.00, 'Per tent');

-- Pacific View Deck (Aurora)
INSERT INTO price_breakdown (spot_id, category, label, price_min, price_max, notes) VALUES
(2, 'Total', 'Average total of the whole stay', 9290.00, 17385.00, '2 overnight stays for 4 people'),
(2, 'Accommodation', 'Average cost of accommodation', 3000.00, 6000.00, ''),
(2, 'Transportation', 'Bus (Manila to Dingalan)', 1600.00, 2400.00, ''),
(2, 'Transportation', 'Jeepney (town proper to spot)', 200.00, 320.00, ''),
(2, 'Transportation', 'Tricycle/Motorcycle', 450.00, 625.00, ''),
(2, 'Food', 'Average Food Cost', 4000.00, 8000.00, ''),
(2, 'Fees', 'Lighthouse Entrance Fee', 10.00, 10.00, 'Per person'),
(2, 'Fees', 'Beach Entrance Fee', 30.00, 30.00, 'Per person');

-- Masungi Georeserve (Tanay)
INSERT INTO price_breakdown (spot_id, category, label, price_min, price_max, notes) VALUES
(3, 'Total', 'Average total of the whole stay', 14000.00, 16600.00, 'Includes transpo options'),
(3, 'Accommodation', 'Average cost of accommodation', 2500.00, 4000.00, 'Family room or 2 rooms'),
(3, 'Transportation', 'Private Car Fuel', 600.00, 1000.00, 'Round trip'),
(3, 'Transportation', 'Van Rental', 3200.00, 3600.00, 'Round trip for group'),
(3, 'Food', 'Average Food Cost', 1200.00, 2400.00, 'Trail snacks & meals'),
(3, 'Fees', 'Entrance Fee (4 people)', 7200.00, 7200.00, '2 adults, 2 children');

-- Guisi Lighthouse (Guimaras)
INSERT INTO price_breakdown (spot_id, category, label, price_min, price_max, notes) VALUES
(4, 'Total', 'Average total of the whole stay', 40000.00, 60000.00, ''),
(4, 'Accommodation', 'Average cost of accommodation', 2500.00, 4000.00, ''),
(4, 'Transportation', 'Airplane', 5200.00, 5200.00, 'One-way'),
(4, 'Transportation', 'Ferry', 260.00, 260.00, 'One-way'),
(4, 'Transportation', 'Van/Shuttle Bus', 1000.00, 1000.00, ''),
(4, 'Transportation', 'Jeepney', 160.00, 160.00, 'One-way'),
(4, 'Transportation', 'Motorcycle', 2000.00, 2000.00, ''),
(4, 'Food', 'Average Food Cost', 8000.00, 8000.00, ''),
(4, 'Fees', 'Lighthouse Entrance Fee', 10.00, 10.00, ''),
(4, 'Fees', 'Beach Entrance Fee', 30.00, 30.00, '');

-- Linao Cave (Guiuan)
INSERT INTO price_breakdown (spot_id, category, label, price_min, price_max, notes) VALUES
(5, 'Total', 'Average total of the whole stay', 22000.00, 60000.00, ''),
(5, 'Accommodation', 'Average cost of accommodation', 13000.00, 15000.00, ''),
(5, 'Transportation', 'Direct Bus', 1200.00, 2000.00, 'One-way'),
(5, 'Transportation', 'Airplane', 4000.00, 4000.00, 'One-way'),
(5, 'Transportation', 'Van/Bus', 1800.00, 1800.00, ''),
(5, 'Transportation', 'Multicab', 200.00, 200.00, 'One-way'),
(5, 'Transportation', 'Motorcycle', 1000.00, 1000.00, ''),
(5, 'Food', 'Average Food Cost', 8000.00, 8000.00, ''),
(5, 'Fees', 'Tour Guide Fee', 500.00, 500.00, 'Required for entry'),
(5, 'Fees', 'Entrance Fee', 15.00, 25.00, '');

-- Nova Shell Museum (Bohol)
INSERT INTO price_breakdown (spot_id, category, label, price_min, price_max, notes) VALUES
(6, 'Total', 'Average total of the whole stay', 32500.00, 50000.00, ''),
(6, 'Accommodation', 'Average cost of accommodation', 5500.00, 8000.00, ''),
(6, 'Transportation', 'Airplane', 16000.00, 32000.00, 'One-way'),
(6, 'Transportation', 'Bus', 300.00, 400.00, ''),
(6, 'Transportation', 'Van/Car Rental', 2800.00, 20000.00, ''),
(6, 'Transportation', 'Jeepney', 80.00, 120.00, ''),
(6, 'Transportation', 'Tricycle', 300.00, 600.00, ''),
(6, 'Transportation', 'Motorcycle Rental', 600.00, 1400.00, ''),
(6, 'Food', 'Average Food Cost', 9000.00, 9000.00, ''),
(6, 'Fees', 'Entrance Fee', 100.00, 100.00, 'Per person');

-- Philippine Eagle Center (Davao)
INSERT INTO price_breakdown (spot_id, category, label, price_min, price_max, notes) VALUES
(7, 'Total', 'Average total of the whole stay', 30600.00, 50200.00, ''),
(7, 'Accommodation', 'Average cost of accommodation', 2000.00, 4000.00, ''),
(7, 'Transportation', 'Airplane', 16000.00, 24000.00, 'One-way'),
(7, 'Transportation', 'Bus', 16000.00, 24000.00, 'One-way'),
(7, 'Transportation', 'Motorcycle', 1200.00, 2000.00, ''),
(7, 'Food', 'Average Food Cost', 7200.00, 12000.00, ''),
(7, 'Fees', 'Entrance Fee', 100.00, 300.00, 'Per person');

-- Tinago Falls (Iligan)
INSERT INTO price_breakdown (spot_id, category, label, price_min, price_max, notes) VALUES
(8, 'Total', 'Average total of the whole stay', 28400.00, 48800.00, ''),
(8, 'Accommodation', 'Average cost of accommodation', 2400.00, 4800.00, ''),
(8, 'Transportation', 'Airplane', 20000.00, 40000.00, ''),
(8, 'Transportation', 'Bus', 3200.00, 4800.00, ''),
(8, 'Transportation', 'Motorcycle', 2400.00, 4000.00, ''),
(8, 'Food', 'Average Food Cost', 7200.00, 12000.00, ''),
(8, 'Fees', 'Entrance Fee', 200.00, 200.00, 'Per person'),
(8, 'Fees', 'Additional Activity Fees', 50.00, 200.00, '');

-- Mount Hamiguitan Range (Mati City)
INSERT INTO price_breakdown (spot_id, category, label, price_min, price_max, notes) VALUES
(9, 'Total', 'Average total of the whole stay', 20000.00, 39000.00, 'Excludes airfare'),
(9, 'Accommodation', 'Average cost of accommodation', 2400.00, 4800.00, '₱600–₱1,200/night'),
(9, 'Transportation', 'Airplane (Manila–Davao)', 8000.00, 18000.00, 'Total for 4 people'),
(9, 'Transportation', 'Bus/Van (Davao–San Isidro)', 1200.00, 2000.00, 'Total for 4 people'),
(9, 'Transportation', 'Habal-habal (to trailhead)', 400.00, 800.00, 'Total for 4 people'),
(9, 'Food', 'Average Food Cost', 7200.00, 12000.00, ''),
(9, 'Fees', 'Tour Guide Fee', 200.00, 800.00, ''),
(9, 'Fees', 'Entrance Fee', 800.00, 800.00, '₱200/person ×4');


