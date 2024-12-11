const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path'); 
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const caCertPath = './DigiCertTLSECCP384RootG5.crt.pem';

// Connect to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(caCertPath), // Load the CA certificate
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit();
  }
  console.log('Connected to the database.');
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Serve the index.html file
});
// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(query, [email, password], (err, results) => {
    if (err) {
     
      return res.status(500).send({ message: 'Server error' });
    }
    if (results.length > 0) {
      res.send({ message: 'Login successful!' });
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  });
});
app.get('*',(req,res)=>{
    res.send({
        status:'ok'
    })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
