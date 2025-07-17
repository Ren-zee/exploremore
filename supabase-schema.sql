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
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_feedback_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for feedback table
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_verified ON feedback(is_verified);

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
CREATE TRIGGER update_price_breakdown_updated_at BEFORE UPDATE ON price_breakdown FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for price_breakdown (optional)
INSERT INTO price_breakdown (spot_id, category, label, price_min, price_max, notes) VALUES
(1, 'Transportation', 'Bus Fare', 500.00, 800.00, 'From Manila to Baguio'),
(1, 'Accommodation', 'Budget Hotel', 1500.00, 3000.00, 'Per night'),
(1, 'Food', 'Local Restaurant', 200.00, 500.00, 'Per meal'),
(2, 'Transportation', 'Flight', 3000.00, 8000.00, 'From Manila to Palawan'),
(2, 'Accommodation', 'Resort', 3000.00, 10000.00, 'Per night'),
(2, 'Food', 'Seafood Restaurant', 500.00, 1500.00, 'Per meal')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
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

-- Note: Admin policies would need to be created based on your admin user identification logic
