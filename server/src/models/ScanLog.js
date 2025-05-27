import { Schema, model } from 'mongoose';

const scanLogSchema = new Schema({
  qr_id: {
    type: String,
    required: true,
    index: true
  },
  document_id: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  scanned_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scan_timestamp: {
    type: Date,
    default: Date.now
  },
  ip_address: {
    type: String,
    required: true
  },
  user_agent: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  error_message: {
    type: String
  }
});

// Index for reporting and analytics
scanLogSchema.index({ scan_timestamp: -1 });
scanLogSchema.index({ document_id: 1, scan_timestamp: -1 });
scanLogSchema.index({ scanned_by: 1, scan_timestamp: -1 });

export default model('ScanLog', scanLogSchema);
