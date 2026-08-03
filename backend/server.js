require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Listen
    app.listen(PORT, () => {
      console.log(`\n🚀 Wallet Pay API Server`);
      console.log(`   ├─ Port:        ${PORT}`);
      console.log(`   ├─ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   ├─ Frontend:    ${process.env.FRONTEND_URL}`);
      console.log(`   └─ Health:      http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('💀 Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
