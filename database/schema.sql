-- 1. Create Cafe Table
CREATE TABLE IF NOT EXISTS cafes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(256) NOT NULL,
    location VARCHAR(255) NOT NULL,
    logo BYTEA -- Optional
);

-- 2. Create Employee Table
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(9) PRIMARY KEY, -- UIXXXXXXX
    name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(8) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')) NOT NULL,
    CONSTRAINT chk_employee_id CHECK (id ~ '^UI[A-Z0-9]{7}$'),
    CONSTRAINT chk_phone_number CHECK (phone_number ~ '^[89][0-9]{7}$')
);

-- 3. Create Junction Table
CREATE TABLE IF NOT EXISTS employee_cafe (
    employee_id VARCHAR(9) PRIMARY KEY,
    cafe_id UUID NOT NULL,
    start_date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
);