-- PostgreSQL schema for ExploreMore PH (Supabase)
-- This script converts MySQL syntax to PostgreSQL

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    filtered_feedback TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_feedback_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for feedback table
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_verified ON feedback(is_verified);

-- Create tourist_spots table
CREATE TABLE IF NOT EXISTS tourist_spots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    region VARCHAR(20) NOT NULL CHECK (region IN ('Luzon', 'Visayas', 'Mindanao')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for tourist_spots table
CREATE INDEX IF NOT EXISTS idx_tourist_spots_region ON tourist_spots(region);
CREATE INDEX IF NOT EXISTS idx_tourist_spots_name ON tourist_spots(name);

-- Create price_breakdown table (referenced in server.js)
CREATE TABLE IF NOT EXISTS price_breakdown (
    id SERIAL PRIMARY KEY,
    spot_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_price_breakdown_spot_id FOREIGN KEY (spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE
);

-- Create indexes for price_breakdown table
CREATE INDEX IF NOT EXISTS idx_price_breakdown_spot_id ON price_breakdown(spot_id);
CREATE INDEX IF NOT EXISTS idx_price_breakdown_category ON price_breakdown(category);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tourist_spots_updated_at BEFORE UPDATE ON tourist_spots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_breakdown_updated_at BEFORE UPDATE ON price_breakdown FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert tourist spots data
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
('Mount Hamiguitan Range Wildlife Sanctuary', 'Mati City', 'Mindanao')
ON CONFLICT DO NOTHING;

-- Insert price breakdown data
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
(1, 'Fees', 'Tent Rental Fee', 400.00, 500.00, 'Per tent'),

-- Pacific View Deck (Aurora)
(2, 'Total', 'Average total of the whole stay', 9290.00, 17385.00, '2 overnight stays for 4 people'),
(2, 'Accommodation', 'Average cost of accommodation', 3000.00, 6000.00, ''),
(2, 'Transportation', 'Bus (Manila to Dingalan)', 1600.00, 2400.00, ''),
(2, 'Transportation', 'Jeepney (town proper to spot)', 200.00, 320.00, ''),
(2, 'Transportation', 'Tricycle/Motorcycle', 450.00, 625.00, ''),
(2, 'Food', 'Average Food Cost', 4000.00, 8000.00, ''),
(2, 'Fees', 'Lighthouse Entrance Fee', 10.00, 10.00, 'Per person'),
(2, 'Fees', 'Beach Entrance Fee', 30.00, 30.00, 'Per person'),

-- Masungi Georeserve (Tanay)
(3, 'Total', 'Average total of the whole stay', 14000.00, 16600.00, 'Includes transpo options'),
(3, 'Accommodation', 'Average cost of accommodation', 2500.00, 4000.00, 'Family room or 2 rooms'),
(3, 'Transportation', 'Private Car Fuel', 600.00, 1000.00, 'Round trip'),
(3, 'Transportation', 'Van Rental', 3200.00, 3600.00, 'Round trip for group'),
(3, 'Food', 'Average Food Cost', 1200.00, 2400.00, 'Trail snacks & meals'),
(3, 'Fees', 'Entrance Fee (4 people)', 7200.00, 7200.00, '2 adults, 2 children'),

-- Guisi Lighthouse (Guimaras)
(4, 'Total', 'Average total of the whole stay', 40000.00, 60000.00, ''),
(4, 'Accommodation', 'Average cost of accommodation', 2500.00, 4000.00, ''),
(4, 'Transportation', 'Airplane', 5200.00, 5200.00, 'One-way'),
(4, 'Transportation', 'Ferry', 260.00, 260.00, 'One-way'),
(4, 'Transportation', 'Van/Shuttle Bus', 1000.00, 1000.00, ''),
(4, 'Transportation', 'Jeepney', 160.00, 160.00, 'One-way'),
(4, 'Transportation', 'Motorcycle', 2000.00, 2000.00, ''),
(4, 'Food', 'Average Food Cost', 8000.00, 8000.00, ''),
(4, 'Fees', 'Lighthouse Entrance Fee', 10.00, 10.00, ''),
(4, 'Fees', 'Beach Entrance Fee', 30.00, 30.00, ''),

-- Linao Cave (Guiuan)
(5, 'Total', 'Average total of the whole stay', 22000.00, 60000.00, ''),
(5, 'Accommodation', 'Average cost of accommodation', 13000.00, 15000.00, ''),
(5, 'Transportation', 'Direct Bus', 1200.00, 2000.00, 'One-way'),
(5, 'Transportation', 'Airplane', 4000.00, 4000.00, 'One-way'),
(5, 'Transportation', 'Van/Bus', 1800.00, 1800.00, ''),
(5, 'Transportation', 'Multicab', 200.00, 200.00, 'One-way'),
(5, 'Transportation', 'Motorcycle', 1000.00, 1000.00, ''),
(5, 'Food', 'Average Food Cost', 8000.00, 8000.00, ''),
(5, 'Fees', 'Tour Guide Fee', 500.00, 500.00, 'Required for entry'),
(5, 'Fees', 'Entrance Fee', 15.00, 25.00, ''),

-- Nova Shell Museum (Bohol)
(6, 'Total', 'Average total of the whole stay', 32500.00, 50000.00, ''),
(6, 'Accommodation', 'Average cost of accommodation', 5500.00, 8000.00, ''),
(6, 'Transportation', 'Airplane', 16000.00, 32000.00, 'One-way'),
(6, 'Transportation', 'Bus', 300.00, 400.00, ''),
(6, 'Transportation', 'Van/Car Rental', 2800.00, 20000.00, ''),
(6, 'Transportation', 'Jeepney', 80.00, 120.00, ''),
(6, 'Transportation', 'Tricycle', 300.00, 600.00, ''),
(6, 'Transportation', 'Motorcycle Rental', 600.00, 1400.00, ''),
(6, 'Food', 'Average Food Cost', 9000.00, 9000.00, ''),
(6, 'Fees', 'Entrance Fee', 100.00, 100.00, 'Per person'),

-- Philippine Eagle Center (Davao)
(7, 'Total', 'Average total of the whole stay', 30600.00, 50200.00, ''),
(7, 'Accommodation', 'Average cost of accommodation', 2000.00, 4000.00, ''),
(7, 'Transportation', 'Airplane', 16000.00, 24000.00, 'One-way'),
(7, 'Transportation', 'Bus', 16000.00, 24000.00, 'One-way'),
(7, 'Transportation', 'Motorcycle', 1200.00, 2000.00, ''),
(7, 'Food', 'Average Food Cost', 7200.00, 12000.00, ''),
(7, 'Fees', 'Entrance Fee', 100.00, 300.00, 'Per person'),

-- Tinago Falls (Iligan)
(8, 'Total', 'Average total of the whole stay', 28400.00, 48800.00, ''),
(8, 'Accommodation', 'Average cost of accommodation', 2400.00, 4800.00, ''),
(8, 'Transportation', 'Airplane', 20000.00, 40000.00, ''),
(8, 'Transportation', 'Bus', 3200.00, 4800.00, ''),
(8, 'Transportation', 'Motorcycle', 2400.00, 4000.00, ''),
(8, 'Food', 'Average Food Cost', 7200.00, 12000.00, ''),
(8, 'Fees', 'Entrance Fee', 200.00, 200.00, 'Per person'),
(8, 'Fees', 'Additional Activity Fees', 50.00, 200.00, ''),

-- Mount Hamiguitan Range (Mati City)
(9, 'Total', 'Average total of the whole stay', 20000.00, 39000.00, 'Excludes airfare'),
(9, 'Accommodation', 'Average cost of accommodation', 2400.00, 4800.00, '₱600–₱1,200/night'),
(9, 'Transportation', 'Airplane (Manila–Davao)', 8000.00, 18000.00, 'Total for 4 people'),
(9, 'Transportation', 'Bus/Van (Davao–San Isidro)', 1200.00, 2000.00, 'Total for 4 people'),
(9, 'Transportation', 'Habal-habal (to trailhead)', 400.00, 800.00, 'Total for 4 people'),
(9, 'Food', 'Average Food Cost', 7200.00, 12000.00, ''),
(9, 'Fees', 'Tour Guide Fee', 200.00, 800.00, ''),
(9, 'Fees', 'Entrance Fee', 800.00, 800.00, '₱200/person ×4')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_breakdown ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Create policies for feedback table
CREATE POLICY "Users can view all verified feedback" ON feedback
    FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can insert their own feedback" ON feedback
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own feedback" ON feedback
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Create policies for price_breakdown table (public read access)
CREATE POLICY "Anyone can view price breakdown" ON price_breakdown
    FOR SELECT USING (true);

-- Create policies for tourist_spots table (public read access)
CREATE POLICY "Anyone can view tourist spots" ON tourist_spots
    FOR SELECT USING (true);

-- Note: Admin policies would need to be created based on your admin user identification logic