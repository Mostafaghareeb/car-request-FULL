import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const db = new Database('trips.db');
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    destination TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// Initialize admin account
const initAdmin = async () => {
  const adminExists = db.prepare('SELECT * FROM admins WHERE username = ?').get('sasa');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('0115643', 10);
    db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('sasa', hashedPassword);
  }
};

initAdmin().catch(console.error);

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Login route
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    
    if (!admin) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Protected routes
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  try {
    const stats = {
      totalBookings: db.prepare('SELECT COUNT(*) as count FROM trips').get().count,
      activeTrips: db.prepare("SELECT COUNT(*) as count FROM trips WHERE status = 'active'").get().count,
      completedTrips: db.prepare("SELECT COUNT(*) as count FROM trips WHERE status = 'completed'").get().count,
      bookingTrends: [],
    };

    // Get booking trends for the last 7 days
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const start = startOfDay(date);
      const end = endOfDay(date);
      
      const count = db.prepare(`
        SELECT COUNT(*) as count 
        FROM trips 
        WHERE createdAt BETWEEN datetime(?) AND datetime(?)
      `).get(start.toISOString(), end.toISOString()).count;

      trends.push({
        date: format(date, 'MMM dd'),
        bookings: count,
      });
    }

    stats.bookingTrends = trends;
    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Other routes...
app.get('/api/trips', (req, res) => {
  try {
    const trips = db.prepare(`
      SELECT * FROM trips 
      ORDER BY createdAt DESC 
      LIMIT 10
    `).all();
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/trips', (req, res) => {
  const { name, phone, startDate, endDate, destination } = req.body;
  
  try {
    const result = db.prepare(`
      INSERT INTO trips (name, phone, startDate, endDate, destination)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, phone, startDate, endDate, destination);
    
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/trips/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('UPDATE trips SET status = ? WHERE id = ?')
      .run('cancelled', req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error cancelling trip:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});