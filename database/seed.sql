-- Seed Data for Cafes
INSERT INTO cafes (id, name, description, location) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Moonbucks', 'Starbucks Competitor', 'Tanjong Pagar'),
('661f9511-f30c-52e5-b827-557766551111', 'Robusta', 'Robusta Competitor', 'Tanjong Pagar'),
('772a0622-f41d-63f6-c938-668877662222', 'UnLuckin', 'Luckin Coffee Competitor', 'Orchard')
ON CONFLICT (id) DO NOTHING;

-- Seed Data for Employees
INSERT INTO employees (id, name, email_address, phone_number, gender) VALUES 
('UI0000001', 'Alice Lim', 'alice@gmail.com', '91112222', 'Female'),
('UI0000002', 'Bob Smith', 'bob@gmail.com', '82223333', 'Male'),
('UI0000003', 'Charlie A.', 'charlie@gmail.com', '93334444', 'Male'),
('UI0000004', 'David Koh', 'david@gmail.com', '84445555', 'Male'),
('UI0000005', 'Eve Low', 'eve@gmail.com', '95556666', 'Female')
ON CONFLICT (id) DO NOTHING;

-- Relationship Data (demonstrating tenure and counts)
INSERT INTO employee_cafe (employee_id, cafe_id, start_date) VALUES 
-- Moonbucks has 3 employees
('UI0000001', '550e8400-e29b-41d4-a716-446655440000', '2022-01-01'),
('UI0000002', '550e8400-e29b-41d4-a716-446655440000', '2023-06-01'),
('UI0000003', '550e8400-e29b-41d4-a716-446655440000', '2024-01-01'),
-- Robusta has 1 employee
('UI0000004', '661f9511-f30c-52e5-b827-557766551111', '2023-12-01')
-- Eve (UI0000005) is unassigned.
-- UnLuckin has 0 employees.
ON CONFLICT (employee_id) DO NOTHING;