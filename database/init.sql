-- PetCareX Database Initialization Script
-- This script will create the database and initial tables

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PetCareX')
BEGIN
    CREATE DATABASE PetCareX;
END
GO

-- Switch to the PetCareX database
USE PetCareX;
GO

-- Example: Create Users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Username NVARCHAR(100) NOT NULL UNIQUE,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(200),
        PhoneNumber NVARCHAR(20),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Example: Create Pets table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Pets')
BEGIN
    CREATE TABLE Pets (
        Id INT PRIMARY KEY IDENTITY(1,1),
        UserId INT NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Species NVARCHAR(50) NOT NULL,
        Breed NVARCHAR(100),
        DateOfBirth DATE,
        Gender NVARCHAR(10),
        ImageUrl NVARCHAR(500),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
END
GO

-- Example: Create Appointments table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Appointments')
BEGIN
    CREATE TABLE Appointments (
        Id INT PRIMARY KEY IDENTITY(1,1),
        PetId INT NOT NULL,
        AppointmentDate DATETIME2 NOT NULL,
        ServiceType NVARCHAR(100) NOT NULL,
        Status NVARCHAR(50) DEFAULT 'Scheduled',
        Notes NVARCHAR(MAX),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (PetId) REFERENCES Pets(Id) ON DELETE CASCADE
    );
END
GO

-- Add indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Pets_UserId')
BEGIN
    CREATE INDEX IX_Pets_UserId ON Pets(UserId);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Appointments_PetId')
BEGIN
    CREATE INDEX IX_Appointments_PetId ON Appointments(PetId);
END
GO

-- Insert sample data (optional)
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'admin')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, FullName, PhoneNumber)
    VALUES ('admin', 'admin@petcarex.com', 'hashed_password_here', 'Administrator', '0123456789');
END
GO

PRINT 'Database initialization completed successfully!';
GO
