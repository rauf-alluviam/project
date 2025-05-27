import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import storageConfig from '../config/storage.js';
const { storageService } = storageConfig;

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { filePath } = req.params;

  try {
    if (process.env.STORAGE_TYPE === 's3') {
      // For S3, generate a signed URL
      const signedUrl = await storageService.getSignedUrl(filePath);
      res.json({
        success: true,
        url: signedUrl
      });
    } else {
      // For local storage, stream the file
      const fileStream = await storageService.getFileStream(filePath);
      
      // Set headers
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=${path.basename(filePath)}`);
      
      // Stream the file
      fileStream.pipe(res);
    }
  } catch (error) {
    return next(new ErrorResponse(`Error accessing file: ${error.message}`, 404));
  }
});

export const streamFile = asyncHandler(async (req, res, next) => {
  const { filePath } = req.params;

  try {
    if (process.env.STORAGE_TYPE === 's3') {
      // For S3, generate a signed URL with content-type
      const signedUrl = await storageService.getSignedUrl(filePath);
      res.json({
        success: true,
        url: signedUrl
      });
    } else {
      // For local storage, stream the file with content-type
      const fileStream = await storageService.getFileStream(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      // Set appropriate content type
      const contentTypes = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain'
      };
      
      res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
      fileStream.pipe(res);
    }
  } catch (error) {
    return next(new ErrorResponse(`Error streaming file: ${error.message}`, 404));
  }
});
