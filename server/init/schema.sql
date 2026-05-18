-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  location VARCHAR(255),
  salary VARCHAR(100),
  company_id INTEGER,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  profession VARCHAR(255),
  location VARCHAR(255),
  rate VARCHAR(100),
  image_url VARCHAR(500),
  bio TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table (optional, for future use)
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(500),
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_candidates_profession ON candidates(profession);
CREATE INDEX IF NOT EXISTS idx_candidates_location ON candidates(location);

-- Insert sample data for testing
INSERT INTO jobs (title, description, category, location, salary, company_id) VALUES
('Senior Developer', 'We are looking for an experienced developer', 'Developer', 'Saudi Arabia', '$5000-$7000', 1),
('Web Designer', 'Creative web design position', 'Web Designer', 'Qatar', '$3000-$5000', 1),
('Business Analyst', 'Analyze business requirements', 'Business Analyst', 'Jordan', '$4000-$6000', 2)
ON CONFLICT DO NOTHING;

INSERT INTO candidates (name, profession, location, rate, image_url) VALUES
('Wanda Smith', 'Charted Accountant', 'New York', '$20/Day', 'images/candidates/pic1.jpg'),
('Peter Hawkins', 'Medical Professed', 'New York', '$7/Hour', 'images/candidates/pic2.jpg'),
('Ralph Johnson', 'Bank Manger', 'New York', '$180/Day', 'images/candidates/pic3.jpg')
ON CONFLICT DO NOTHING;
