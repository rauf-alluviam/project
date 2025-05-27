// filepath: /home/jeeyaa/Downloads/project/backend/src/controllers/logs.js
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import ScanLog from '../models/ScanLog.js';
import Document from '../models/Document.js';
import QRCode from '../models/QRCode.js';

// Example of how to use ScanLog model methods:
// await ScanLog.find()
// await ScanLog.countDocuments()
// await ScanLog.aggregate()

export const getScanLogs = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Filter by role and department
  if (req.user.role !== 'admin') {
    if (req.user.role === 'supervisor') {
      // Get all documents in supervisor's department
      const departmentDocs = await Document.find({ department: req.user.department }).select('_id');
      const docIds = departmentDocs.map(doc => doc._id);
      reqQuery.document_id = { $in: docIds };
    } else {
      // Regular users can only see their own scans
      reqQuery.scanned_by = req.user._id;
    }
  }
  
  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = ScanLog.find(JSON.parse(queryStr));

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
    query = query.sort('-scan_timestamp');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await ScanLog.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Populate with document and user info
  query = query.populate([
    {
      path: 'document_id',
      select: 'title department machine_id'
    },
    {
      path: 'scanned_by',
      select: 'username email role department'
    }
  ]);

  // Execute query
  const logs = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: logs.length,
    pagination,
    data: logs
  });
});

// Make sure this export is available to the routes
export const getScanAnalytics = asyncHandler(async (req, res, next) => {
  // Updated function to fix module import issue
  let matchStage = {};

  // Filter by role and department
  if (req.user.role !== 'admin') {
    if (req.user.role === 'supervisor') {
      const departmentDocs = await Document.find({ department: req.user.department }).select('_id');
      const docIds = departmentDocs.map(doc => doc._id);
      matchStage.document_id = { $in: docIds };
    } else {
      matchStage.scanned_by = req.user._id;
    }
  }

  // Time range filter
  const timeRange = req.query.timeRange || '7d'; // Default to last 7 days
  const now = new Date();
  let startDate;

  switch (timeRange) {
    case '24h':
      startDate = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
  }

  matchStage.scan_timestamp = { $gte: startDate };

  // Get analytics
  const analytics = await Promise.all([
    // Total scans
    ScanLog.countDocuments(matchStage),

    // Scans by department
    ScanLog.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'documents',
          localField: 'document_id',
          foreignField: '_id',
          as: 'document'
        }
      },
      { $unwind: '$document' },
      {
        $group: {
          _id: '$document.department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]),

    // Scans by document
    ScanLog.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'documents',
          localField: 'document_id',
          foreignField: '_id',
          as: 'document'
        }
      },
      { $unwind: '$document' },
      {
        $group: {
          _id: {
            document_id: '$document_id',
            title: '$document.title'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),

    // Scans by hour (last 24 hours)
    ScanLog.aggregate([
      {
        $match: {
          ...matchStage,
          scan_timestamp: { $gte: new Date(now - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $hour: '$scan_timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ])
  ]);

  const [totalScans, scansByDepartment, topDocuments, scansByHour] = analytics;

  res.status(200).json({
    success: true,
    data: {
      totalScans,
      scansByDepartment,
      topDocuments,
      scansByHour,
      timeRange
    }
  });
});
