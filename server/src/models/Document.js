import { Schema, model } from 'mongoose';

const versionSchema = new Schema({
  version_number: {
    type: Number,
    required: true
  },
  file_path: {
    type: String,
    required: true
  },
  file_url: {
    type: String,
    required: true
  },
  uploaded_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upload_date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
});

const documentSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  department: {
    type: String,
    required: [true, 'Please add a department']
  },
  machine_id: {
    type: String,
    required: [true, 'Please add a machine ID']
  },  qrId: {
    type: String,
    unique: true,
    required: true
  },
  file_path: {
    type: String,
    required: [true, 'Please add a file path']
  },
  file_url: {
    type: String,
    required: [true, 'Please add a file URL']
  },
  file_type: {
    type: String,
    required: [true, 'Please add a file type']
  },
  file_size: {
    type: Number,
    required: [true, 'Please add a file size']
  },
  current_version: {
    type: Number,
    default: 1
  },
  versions: [versionSchema],
access_roles: [{
  type: String,
  enum: ['admin', 'supervisor', 'user'], // Changed from the original enum values
  default: ['user']
}],
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for QR code
documentSchema.virtual('qrCode', {
  ref: 'QRCode',
  localField: '_id',
  foreignField: 'document_id',
  justOne: true
});

export default model('Document', documentSchema);
