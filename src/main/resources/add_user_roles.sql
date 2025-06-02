-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'USER';

-- Update the column to be NOT NULL after adding default values
UPDATE users SET role = 'USER' WHERE role IS NULL;
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- Create an admin user (password is 'admin123' hashed with BCrypt)
-- You should change this password in production
INSERT INTO users (email, password, role) 
VALUES ('admin@admin.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN')
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';
