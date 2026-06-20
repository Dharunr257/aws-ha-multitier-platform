CREATE DATABASE IF NOT EXISTS aws_dashboard;
USE aws_dashboard;

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  manager VARCHAR(100) NOT NULL,
  budget DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  department_id INT,
  salary DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Seed departments
INSERT INTO departments (name, manager, budget) VALUES
('Cloud Architecture', 'Jane Doe', 1500000.00),
('DevOps Engineering', 'John Smith', 1200000.00),
('Database Operations', 'Alice Johnson', 950000.00),
('Security & Compliance', 'Bob Williams', 800000.00),
('Systems Engineering', 'Sarah Davis', 1100000.00)
ON DUPLICATE KEY UPDATE budget=budget;

-- Seed employees
INSERT INTO employees (name, email, department_id, salary, status) VALUES
('Alex Rivera', 'alex.rivera@example.com', 1, 125000.00, 'Active'),
('Brittany Chen', 'brittany.chen@example.com', 1, 130000.00, 'Active'),
('Charlie Kumar', 'charlie.kumar@example.com', 2, 115000.00, 'Active'),
('Diana Prince', 'diana.prince@example.com', 2, 140000.00, 'Active'),
('Ethan Hunt', 'ethan.hunt@example.com', 3, 110000.00, 'Active'),
('Fiona Gallagher', 'fiona.gallagher@example.com', 3, 95000.00, 'Active'),
('George Green', 'george.green@example.com', 4, 105000.00, 'Active'),
('Hannah Abbott', 'hannah.abbott@example.com', 4, 98000.00, 'Active'),
('Ian Malcolm', 'ian.malcolm@example.com', 5, 120000.00, 'Active'),
('Julia Roberts', 'julia.roberts@example.com', 5, 118000.00, 'Active'),
('Kevin Bacon', 'kevin.bacon@example.com', 1, 110000.00, 'Active'),
('Laura Croft', 'laura.croft@example.com', 2, 135000.00, 'Active'),
('Marcus Aurelius', 'marcus.aurelius@example.com', 3, 125000.00, 'Active'),
('Natalie Portman', 'natalie.portman@example.com', 4, 112000.00, 'Active'),
('Oliver Queen', 'oliver.queen@example.com', 5, 105000.00, 'Active'),
('Penelope Cruz', 'penelope.cruz@example.com', 1, 115000.00, 'Inactive'),
('Quentin Tarantino', 'quentin.tarantino@example.com', 2, 122000.00, 'Active'),
('Rachel Green', 'rachel.green@example.com', 3, 90000.00, 'Active'),
('Steve Rogers', 'steve.rogers@example.com', 4, 130000.00, 'Active'),
('Tony Stark', 'tony.stark@example.com', 5, 250000.00, 'Active')
ON DUPLICATE KEY UPDATE salary=salary;
