-- Users Table
-- Stores user account information, including their plan and associated clinic/hospital.
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, not plain text
    plan ENUM('Free', 'Clinica', 'Hospital') NOT NULL,
    organization_name VARCHAR(255), -- Can store either clinic or hospital name
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients Table
-- Stores demographic information for each patient.
CREATE TABLE Patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('Masculino', 'Femenino', 'Otro') NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vitals Table
-- Stores vital sign records for each patient.
CREATE TABLE Vitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    date DATETIME NOT NULL,
    hr INT, -- Heart Rate
    bp VARCHAR(50), -- Blood Pressure
    temp DECIMAL(4, 1), -- Temperature
    rr INT, -- Respiratory Rate
    provider VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE
);

-- Medications Table
-- Stores medication prescriptions for each patient.
CREATE TABLE Medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    prescribed_date DATE NOT NULL,
    prescribing_provider VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE
);

-- Appointments Table
-- Stores scheduled appointments for each patient.
CREATE TABLE Appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    date DATETIME NOT NULL,
    reason TEXT,
    status ENUM('Programada', 'Completada', 'Cancelada') NOT NULL,
    visit_provider VARCHAR(255),
    billing_provider VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE
);

-- Procedures Table
-- Stores medical procedures performed on each patient.
CREATE TABLE Procedures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    notes TEXT,
    performing_provider VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE
);

-- PatientNotes Table
-- Stores consultation notes, including AI-generated transcriptions and summaries.
CREATE TABLE PatientNotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    date DATETIME NOT NULL,
    provider VARCHAR(255),
    transcription LONGTEXT,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE
);

-- User_Patients Table (Many-to-Many Relationship)
-- Links users to the patients they have access to, essential for multi-user plans.
CREATE TABLE User_Patients (
    user_id INT NOT NULL,
    patient_id INT NOT NULL,
    PRIMARY KEY (user_id, patient_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE
);
