const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/routes/amasha-authroutes'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'auth-service OK' }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});