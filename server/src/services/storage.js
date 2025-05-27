import pkg from 'aws-sdk';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { join, extname, basename, dirname } from 'path';
import { memoryStorage, diskStorage } from 'multer';
import { randomBytes } from 'crypto';

const { S3 } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Setup and store your config/s3 client
let storageConfig = {};
let s3 = null;
let uploadDir = null;

export function initStorage(config) {
  storageConfig = config;
  uploadDir = join(__dirname, '../../uploads/documents');

  if (config.storageType === 's3') {
    s3 = new S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region
    });
  }
}

export function getMulterStorage() {
  if (storageConfig.storageType === 's3') {
    return memoryStorage();
  } else {
    return diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = randomBytes(16).toString('hex');
        cb(null, `${Date.now()}-${uniqueSuffix}${extname(file.originalname)}`);
      }
    });
  }
}

export function getMulterConfig() {
  return {
    storage: getMulterStorage(),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const ext = extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  };
}

export async function saveFile(file) {
  try {
    if (storageConfig.storageType === 's3') {
      const key = `documents/${Date.now()}-${randomBytes(16).toString('hex')}${extname(file.originalname)}`;

      await s3.upload({
        Bucket: storageConfig.aws.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      }).promise();

      return {
        path: key,
        url: `https://${storageConfig.aws.bucket}.s3.amazonaws.com/${key}`
      };
    } else {
      return {
        path: file.path,
        url: `/uploads/documents/${basename(file.path)}`
      };
    }
  } catch (error) {
    throw new Error(`Failed to save file: ${error.message}`);
  }
}

export async function deleteFile(filePath) {
  try {
    if (storageConfig.storageType === 's3') {
      await s3.deleteObject({
        Bucket: storageConfig.aws.bucket,
        Key: filePath
      }).promise();
    } else {
      await fs.unlink(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

export async function getFileStream(filePath) {
  try {
    if (storageConfig.storageType === 's3') {
      const params = {
        Bucket: storageConfig.aws.bucket,
        Key: filePath
      };
      return s3.getObject(params).createReadStream();
    } else {
      return fs.createReadStream(filePath);
    }
  } catch (error) {
    throw new Error(`Failed to get file stream: ${error.message}`);
  }
}

export async function getSignedUrl(filePath, expiresIn = 3600) {
  if (storageConfig.storageType !== 's3') {
    throw new Error('Signed URLs are only available for S3 storage');
  }

  try {
    const params = {
      Bucket: storageConfig.aws.bucket,
      Key: filePath,
      Expires: expiresIn
    };
    return await s3.getSignedUrlPromise('getObject', params);
  } catch (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}
