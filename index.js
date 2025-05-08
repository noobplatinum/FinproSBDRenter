const express = require('express');
const cors = require('cors');
require('dotenv').config();
const router = require('./routes/router'); 
const db = require('./db'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

db.pool.connect()
  .then(() => console.log('Connected to NeonDB'))
  .catch(err => console.error('Error connecting to NeonDB:', err));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to RenterIn API' });
});

app.get('/api/test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Database query error', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection fail',
      error: error.message 
    });
  }
});

app.use(router); 

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error!',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;