require('dotenv').config();
const express = require('express');
const app = express();

// Start worker
require('./src/workers/notificationWorker');

app.use(express.json());

// Routes
const notificationRoutes = require('./src/routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Notification Service Running 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});