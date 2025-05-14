-- Extension untuk UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Account
CREATE TABLE account (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    location TEXT,
    age INTEGER,
    gender TEXT,
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    points INTEGER DEFAULT 0,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property
CREATE TABLE property (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    size INTEGER,
    price_per_night NUMERIC(10, 2) NOT NULL,
    rating_avg NUMERIC(2, 1) DEFAULT 0.0,
    category TEXT,  
    owner_id UUID REFERENCES account(id) ON DELETE SET NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facilities
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES property(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    condition TEXT CHECK (condition IN ('berfungsi', 'rusak', 'maintenance')) NOT NULL
);

-- Transaction
CREATE TABLE transaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES account(id) ON DELETE CASCADE,
    property_id UUID REFERENCES property(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    payment_method TEXT,
    payment_status TEXT CHECK (payment_status IN ('paid', 'unpaid', 'failed')) DEFAULT 'unpaid',
    total_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rating / Reviews
CREATE TABLE rating (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES account(id) ON DELETE CASCADE,
    property_id UUID REFERENCES property(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, property_id) 
);

-- Images
CREATE TABLE image (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES property(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT,
    is_thumbnail BOOLEAN DEFAULT FALSE
);
