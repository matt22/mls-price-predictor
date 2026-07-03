CREATE EXTENSION IF NOT EXISTS postgis;

-- Listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rentcast_id VARCHAR(255) UNIQUE NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  list_price DECIMAL(15, 2) NOT NULL,
  beds INTEGER,
  baths DECIMAL(5, 2),
  sqft INTEGER,
  property_type VARCHAR(100),
  year_built INTEGER,
  listing_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index
CREATE INDEX idx_listings_geom ON listings USING GIST (ST_MakePoint(longitude, latitude)::geography);
CREATE INDEX idx_listings_city_state ON listings(city, state);
CREATE INDEX idx_listings_price ON listings(list_price);
CREATE INDEX idx_listings_beds_baths ON listings(beds, baths);

-- Predictions table
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  predicted_price DECIMAL(15, 2) NOT NULL,
  confidence DECIMAL(3, 2) NOT NULL,
  factors JSONB,
  interest_rate DECIMAL(5, 2),
  estimated_delisting BOOLEAN DEFAULT FALSE,
  delisting_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(listing_id)
);

CREATE INDEX idx_predictions_listing ON predictions(listing_id);
CREATE INDEX idx_predictions_confidence ON predictions(confidence);

-- Comps table (comparable listings for predictions)
CREATE TABLE comps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  comparable_listing_id UUID NOT NULL REFERENCES listings(id),
  distance_miles DECIMAL(10, 2),
  similarity_score DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comps_prediction ON comps(prediction_id);
