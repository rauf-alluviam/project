import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Document from '../models/Document.js';
import QRCode from '../models/QRCode.js';
import storageService from '../config/storage.js';
const { upload, saveFile, deleteFile } = storageService;
import { toDataURL } from 'qrcode';

import { extname } from 'path';

// Example of how to use Document model methods:
// await Document.find();
// await Document.countDocuments();
// await Document.findById(id);
// await Document.create(data);
// await Document.findByIdAndUpdate(id, data);

export const getDocuments = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Filter by user role and department
  if (req.user.role !== 'admin') {
    if (req.user.role === 'supervisor') {
      reqQuery.department = req.user.department;
    } else {
      reqQuery.$or = [
        { created_by: req.user._id },
        { access_roles: req.user.role }
      ];
    }
  }

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  // Finding resource
  query = Document.find(JSON.parse(queryStr));

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Document.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Populate
  query = query.populate([
    { path: 'created_by', select: 'username email' },
    { path: 'qrCode', select: 'qr_id scan_count' }
  ]);

  // Execute query
  const documents = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: documents.length,
    pagination,
    data: documents
  });
});

export const getDocument = asyncHandler(async (req, res, next) => {  const document = await Document.findById(req.params.id).populate([
    { path: 'created_by', select: 'username email' },
    { path: 'qrCode', select: 'qr_id scan_count' },
    { path: 'versions.uploaded_by', select: 'username email' }
  ]);

  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
  }

  // Make sure user has access to document
  if (req.user.role !== 'admin' && 
      document.created_by.toString() !== req.user.id && 
      !document.access_roles.includes(req.user.role)) {
    return next(new ErrorResponse(`Not authorized to access this document`, 403));
  }

  res.status(200).json({
    success: true,
    data: document
  });
});

export const createDocument = asyncHandler(async (req, res, next) => {
  // Ensure req.body exists and req.user is available
  if (!req.user || !req.user.id) {
    return next(new ErrorResponse('User authentication required', 401));
  }

  // Ensure req.body exists
  if (!req.body) {
    req.body = {};
  }

  req.body.created_by = req.user.id;

  upload.single('file')(req, res, async (err) => {
    if (err) {
      return next(new ErrorResponse(`Problem with file upload: ${err.message}`, 400));
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }    try {
      // Save file using storage service
      const savedFile = await storageService.saveFile(req.file);
        // Generate unique QR ID that will be shared between Document and QRCode models
      const qr_id = `QR-${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare document object with all required fields
      const documentData = {
        ...req.body,
        qrId: qr_id, // Use the same QR ID for both models
        file_path: savedFile.path,
        file_url: savedFile.url,
        file_type: extname(req.file.originalname).toLowerCase(),
        file_size: req.file.size,
        versions: [{
          version_number: 1,
          file_path: savedFile.path,
          file_url: savedFile.url,
          uploaded_by: req.user.id,
          notes: 'Initial version'
        }]
      };
        // Log document data before creation
      console.log('Creating document with data:', {
        title: documentData.title,
        department: documentData.department,
        machine_id: documentData.machine_id,
        created_by: documentData.created_by,
        qrId: documentData.qrId
      });
        const document = await Document.create(documentData);

      // Log the created document
      console.log('Document created successfully:', {
        id: document._id,
        title: document.title,
        qrId: document.qrId
      });

      // Automatically create QR code for the document using the same QR ID
      try {
        // Create QR code record with the same qr_id as document.qrId
        const qrCode = await QRCode.create({
          qr_id: qr_id, // Same ID as document.qrId
          title: document.title,
          department: document.department,
          machine_id: document.machine_id,
          document_id: document._id,
          created_by: req.user.id
        });

        console.log('QR code created successfully:', {
          qr_id: qrCode.qr_id,
          document_id: document._id,
          document_qrId: document.qrId
        });        // Generate QR code image URL
        const qrImageUrl = await toDataURL(
          `${process.env.FRONTEND_URL}/view/${qr_id}`
        );

        // Return document with QR code information
        res.status(201).json({
          success: true,
          data: {
            ...document.toObject(),
            qrCode: {
              ...qrCode.toObject(),
              qrImage: qrImageUrl
            }
          }
        });
      } catch (qrError) {
        console.error('Error creating QR code:', qrError);
        // Document was created successfully, but QR code failed
        // Return document without QR code rather than failing completely
        res.status(201).json({
          success: true,
          data: document,
          warning: 'Document created but QR code generation failed'
        });
      }
    } catch (error) {
      return next(new ErrorResponse(`Error saving document: ${error.message}`, 500));
    }
  });
});

export const updateDocument = asyncHandler(async (req, res, next) => {
  let document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is document owner or admin
  if (document.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update this document`, 403));
  }
  // Only update metadata, not the file itself
  document = await Document.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
      department: req.body.department,
      machine_id: req.body.machine_id,
      access_roles: req.body.access_roles
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: document
  });
});

export const deleteDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is document owner or admin
  if (document.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to delete this document`, 403));
  }

  // Delete all version files
  for (const version of document.versions) {
    try {
      await storageService.deleteFile(version.file_path);
    } catch (err) {
      console.error(`Error deleting file: ${version.file_path}`, err);
    }
  }
  await document.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

export const uploadVersion = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is document owner or admin/supervisor
  if (document.created_by.toString() !== req.user.id && !['admin', 'supervisor'].includes(req.user.role)) {
    return next(new ErrorResponse(`Not authorized to update this document`, 403));
  }

  upload.single('file')(req, res, async (err) => {
    if (err) {
      return next(new ErrorResponse(`Problem with file upload: ${err.message}`, 400));
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    try {
      // Save file using storage service
      const savedFile = await storageService.saveFile(req.file);

      // Create new version
      const newVersion = {
        version_number: document.current_version + 1,
        file_path: savedFile.path,
        file_url: savedFile.url,
        uploaded_by: req.user.id,
        notes: req.body.notes || `Version ${document.current_version + 1}`
      };

      // Add new version to versions array
      document.versions.push(newVersion);
      document.current_version += 1;
      document.file_path = savedFile.path;
      document.file_url = savedFile.url;
      document.file_size = req.file.size;

      await document.save();

      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      return next(new ErrorResponse(`Error uploading version: ${error.message}`, 500));
    }
  });
});

export const getVersions = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id)
    .populate('versions.uploaded_by', 'username email');

  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
  }

  // Make sure user has access to document
  if (req.user.role !== 'admin' && 
      document.created_by.toString() !== req.user.id && 
      !document.access_roles.includes(req.user.role)) {
    return next(new ErrorResponse(`Not authorized to access this document`, 403));
  }

  res.status(200).json({
    success: true,
    count: document.versions.length,
    data: document.versions
  });
});
