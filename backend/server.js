// server.js
const { initDatabase } = require('./config/database');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDatabase();
    console.log('📊 PostgreSQL database initialized successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API available at: http://localhost:${PORT}`);
      console.log(`💾 Database: PostgreSQL`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
