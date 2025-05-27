import { Schema, model } from 'mongoose';

const qrCodeSchema = new Schema({
  qr_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  department: {
    type: String,
    required: [true, 'Please add a department']
  },
  machine_id: {
    type: String,
    required: [true, 'Please add a machine ID']
  },
  document_id: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scan_count: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_scan: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for scan logs
qrCodeSchema.virtual('scanLogs', {
  ref: 'ScanLog',
  localField: 'qr_id',
  foreignField: 'qr_id'
});

// Increment scan count when QR is scanned
qrCodeSchema.methods.incrementScanCount = async function() {
  this.scan_count += 1;
  this.last_scan = Date.now();
  await this.save();
};

// Index for optimizing scans
qrCodeSchema.index({ qr_id: 1, is_active: 1 });

export default model('QRCode', qrCodeSchema);
