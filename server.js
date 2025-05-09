require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Simple in-memory session for admin auth
let adminSession = false;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true
    }
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
    // Create table if it doesn't exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS signups (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fullName VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            subject VARCHAR(50) NOT NULL,
            additionalInfo TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err);
            return;
        }
        console.log('Database table ready');
    });
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        adminSession = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Incorrect password' });
    }
});

// Admin logout endpoint
app.post('/api/admin/logout', (req, res) => {
    adminSession = false;
    res.json({ success: true });
});

// Protected API to get all signups
app.get('/api/admin/signups', (req, res) => {
    if (!adminSession) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    db.query('SELECT * FROM signups ORDER BY createdAt DESC', (err, results) => {
        if (err) {
            console.error('Error fetching signups:', err);
            return res.status(500).json({ error: 'Error fetching signups' });
        }
        res.json(results);
    });
});

// API Endpoint to handle form submission
app.post('/api/signup', (req, res) => {
    console.log('Received form submission:', req.body);
    
    const {
        fullName,
        email,
        phone,
        subject,
        message
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !subject) {
        console.error('Missing required fields:', { fullName, email, phone, subject });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO signups 
        (fullName, email, phone, subject, additionalInfo)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [fullName, email, phone, subject, message],
        (err, results) => {
            if (err) {
                console.error('Error saving signup:', err);
                return res.status(500).json({ error: 'Error saving signup' });
            }
            console.log('Signup saved successfully:', results);
            res.status(201).json({ 
                message: 'Signup successful',
                id: results.insertId 
            });
        }
    );
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 