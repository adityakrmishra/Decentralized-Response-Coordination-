import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  NODE_ENV
} = process.env;

const connectionURI = NODE_ENV === 'production' 
  ? `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`
  : `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 30000,
  socketTimeoutMS: 45000,
  authSource: 'admin',
  retryWrites: true,
  appName: 'disaster-response',
  ...(NODE_ENV === 'production' && {
    ssl: true,
    sslValidate: true,
    sslCA: `${__dirname}/rds-combined-ca-bundle.pem`
  })
};

class Database {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 5000;
  }

  async connect() {
    try {
      await mongoose.connect(connectionURI, connectionOptions);
      logger.info(`Connected to MongoDB (${NODE_ENV})`);
      
      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        if (this.retryCount < this.maxRetries) {
          logger.info(`Reconnecting... (Attempt ${this.retryCount + 1})`);
          setTimeout(() => this.connect(), this.retryDelay);
          this.retryCount++;
        }
      });

      if (NODE_ENV === 'development') {
        mongoose.set('debug', (collectionName, method, query, doc) => {
          logger.debug(`MongoDB: ${collectionName}.${method}`, {
            query,
            doc
          });
        });
      }

    } catch (error) {
      logger.error(`Database connection failed: ${error.message}`);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected');
    } catch (error) {
      logger.error(`Error disconnecting MongoDB: ${error.message}`);
    }
  }
}

export const database = new Database();
