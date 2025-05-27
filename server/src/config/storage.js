import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import {
  initStorage,
  getMulterConfig,
  saveFile,
  deleteFile,
  getSignedUrl,
  getFileStream
} from '../services/storage.js';

// Storage configuration
const storageConfig = {
  storageType: process.env.STORAGE_TYPE || 'local',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET_NAME
  }
};

// Initialize the storage module
initStorage(storageConfig);

// Setup multer with the configured storage
const upload = multer(getMulterConfig());

export default {
  upload,
  saveFile,
  deleteFile,
  getSignedUrl,
  getFileStream
};
