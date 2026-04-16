const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/patients', require('./src/routes/amasha-patientRoutes'));

app.get('/health', (req, res) => res.json({ status: 'patient-service OK' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Patient service running on port ${PORT}`));