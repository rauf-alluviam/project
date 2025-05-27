import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import QRCode from '../models/QRCode.js';
import Document from '../models/Document.js';
import ScanLog from '../models/ScanLog.js';
import { toDataURL } from 'qrcode';

export const createQRCode = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.body.document_id);

  if (!document) {
    return next(new ErrorResponse('Document not found', 404));
  }

  // Check if QR code already exists for this document
  const existingQR = await QRCode.findOne({ document_id: req.body.document_id });
  if (existingQR) {
    return next(new ErrorResponse('QR code already exists for this document', 400));
  }

  // Generate unique QR ID
  const qr_id = `QR-${Math.random().toString(36).substr(2, 9)}`;

  // Create QR code
  const qrCode = await QRCode.create({
    qr_id,
    title: document.title,
    department: document.department,
    machine_id: document.machine_id,
    document_id: document._id,
    created_by: req.user.id
  });
  // Generate QR code image
  const qrImageUrl = await toDataURL(
    `${process.env.FRONTEND_URL}/view/${qr_id}`
  );

  res.status(201).json({
    success: true,
    data: {
      ...qrCode.toObject(),
      qrImage: qrImageUrl
    }
  });
});

export const getQRCode = asyncHandler(async (req, res, next) => {
  const qrCode = await QRCode.findOne({ qr_id: req.params.qr_id })
    .populate('document_id', 'title department machine_id')
    .populate('created_by', 'username email');

  if (!qrCode) {
    return next(new ErrorResponse('QR code not found', 404));
  }
  // Generate QR code image
  const qrImageUrl = await toDataURL(
    `${process.env.FRONTEND_URL}/view/${qrCode.qr_id}`
  );

  res.status(200).json({
    success: true,
    data: {
      ...qrCode.toObject(),
      qrImage: qrImageUrl
    }
  });
});

export const updateQRCode = asyncHandler(async (req, res, next) => {
  let qrCode = await QRCode.findOne({ qr_id: req.params.qr_id });

  if (!qrCode) {
    return next(new ErrorResponse('QR code not found', 404));
  }

  // Make sure user is owner or admin
  if (qrCode.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this QR code', 403));
  }

  qrCode = await QRCode.findOneAndUpdate(
    { qr_id: req.params.qr_id },
    { ...req.body, is_active: req.body.is_active ?? qrCode.is_active },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: qrCode
  });
});

export const deleteQRCode = asyncHandler(async (req, res, next) => {
  const qrCode = await QRCode.findOne({ qr_id: req.params.qr_id });

  if (!qrCode) {
    return next(new ErrorResponse('QR code not found', 404));
  }

  // Make sure user is owner or admin
  if (qrCode.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this QR code', 403));
  }

  await qrCode.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

export const viewDocumentByQR = asyncHandler(async (req, res, next) => {
  const qrCode = await QRCode.findOne({ qr_id: req.params.qr_id })
    .populate({
      path: 'document_id',
      select: 'title department machine_id file_path current_version versions'
    });

  if (!qrCode) {
    return next(new ErrorResponse('Invalid QR code', 404));
  }

  if (!qrCode.is_active) {
    return next(new ErrorResponse('This QR code has been deactivated', 400));
  }

  // Log the scan
  await ScanLog.create({
    qr_id: qrCode.qr_id,
    document_id: qrCode.document_id._id,
    scanned_by: req.user ? req.user.id : null,
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

  // Increment scan count
  await qrCode.incrementScanCount();

  res.status(200).json({
    success: true,
    data: qrCode.document_id
  });
});

export const getQRCodeStats = asyncHandler(async (req, res, next) => {
  const qrCode = await QRCode.findOne({ qr_id: req.params.qr_id });

  if (!qrCode) {
    return next(new ErrorResponse('QR code not found', 404));
  }

  // Get scan logs for the QR code
  const scanLogs = await ScanLog.find({ qr_id: req.params.qr_id })
    .sort('-scan_timestamp')
    .limit(100)
    .populate('scanned_by', 'username email role');

  // Calculate statistics
  const stats = {
    totalScans: qrCode.scan_count,
    lastScan: qrCode.last_scan,
    scansToday: scanLogs.filter(log => 
      new Date(log.scan_timestamp).toDateString() === new Date().toDateString()
    ).length,
    scansThisWeek: scanLogs.filter(log => 
      new Date(log.scan_timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    recentScans: scanLogs
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});
