-- Database schema for NotasMed EHR

-- Users Table
-- Stores user login information and their roles/plans.
CREATE TABLE `users` (
  `id` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `plan` ENUM('Free', 'Clinica', 'Hospital', 'Medico', 'Admin') NOT NULL,
  `clinic_name` VARCHAR(255),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_unique` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clinics Table
-- Stores information about different clinics or hospitals.
CREATE TABLE `clinics` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255),
  `phone` VARCHAR(255),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Patients Table
-- Stores the core demographic and identifying information for each patient.
CREATE TABLE `patients` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `dob` DATE NOT NULL,
  `gender` ENUM('Masculino', 'Femenino', 'Otro') NOT NULL,
  `address` VARCHAR(255),
  `phone` VARCHAR(255),
  `email` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vitals Table
-- Stores vital sign readings for each patient.
CREATE TABLE `vitals` (
  `id` VARCHAR(255) NOT NULL,
  `patient_id` VARCHAR(255) NOT NULL,
  `date` DATETIME NOT NULL,
  `hr` INT,
  `bp` VARCHAR(255),
  `temp` DECIMAL(4,1),
  `rr` INT,
  `provider` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Medications Table
-- Stores medication prescriptions for each patient.
CREATE TABLE `medications` (
  `id` VARCHAR(255) NOT NULL,
  `patient_id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(255),
  `frequency` VARCHAR(255),
  `prescribed_date` DATE NOT NULL,
  `prescribing_provider` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Appointments Table
-- Stores scheduled and past appointments for each patient.
CREATE TABLE `appointments` (
  `id` VARCHAR(255) NOT NULL,
  `patient_id` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `reason` VARCHAR(255),
  `status` ENUM('Programada', 'Completada', 'Cancelada') NOT NULL,
  `visit_provider` VARCHAR(255),
  `billing_provider` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Procedures Table
-- Stores medical procedures performed on each patient.
CREATE TABLE `procedures` (
  `id` VARCHAR(255) NOT NULL,
  `patient_id` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `notes` TEXT,
  `performing_provider` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Patient Notes Table
-- Stores consultation notes, including AI-generated transcriptions and summaries.
CREATE TABLE `patient_notes` (
  `id` VARCHAR(255) NOT NULL,
  `patient_id` VARCHAR(255) NOT NULL,
  `date` DATETIME NOT NULL,
  `provider` VARCHAR(255),
  `transcription` TEXT,
  `summary` TEXT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
