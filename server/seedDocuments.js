import mongoose from 'mongoose';
import Document from './src/models/Document.js';
import User from './src/models/User.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/qrlocker');

async function seedDocuments() {
  try {
    // Get a user to use as created_by
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please run seedUsers.js first.');
      process.exit(1);
    }

    // Clear existing documents
    await Document.deleteMany({});
    console.log('Cleared existing documents');

    const testDocuments = [
      {
        title: 'Employee Handbook',
        description: 'Company policies and procedures for all employees',
        department: 'HR',
        machine_id: 'MACHINE-001',
        file_path: '/uploads/documents/employee-handbook.pdf',
        file_url: '/uploads/documents/employee-handbook.pdf',
        file_type: '.pdf',
        file_size: 1024000,
        current_version: 1,
        access_roles: ['admin', 'supervisor', 'user'],
        created_by: adminUser._id,
        versions: [
          {
            version_number: 1,
            file_path: '/uploads/documents/employee-handbook.pdf',
            file_url: '/uploads/documents/employee-handbook.pdf',
            uploaded_by: adminUser._id,
            notes: 'Initial version of employee handbook'
          }
        ]
      },
      {
        title: 'Safety Procedures',
        description: 'Workplace safety guidelines and emergency procedures',
        department: 'Safety',
        machine_id: 'MACHINE-002',
        file_path: '/uploads/documents/safety-procedures.pdf',
        file_url: '/uploads/documents/safety-procedures.pdf',
        file_type: '.pdf',
        file_size: 800000,
        current_version: 1,
        access_roles: ['admin', 'supervisor', 'user'],
        created_by: adminUser._id,
        versions: [
          {
            version_number: 1,
            file_path: '/uploads/documents/safety-procedures.pdf',
            file_url: '/uploads/documents/safety-procedures.pdf',
            uploaded_by: adminUser._id,
            notes: 'Updated safety procedures for 2025'
          }
        ]
      }
    ];

    // Create test documents
    for (const docData of testDocuments) {
      const document = await Document.create(docData);
      console.log(`Created document: ${document.title}`);
    }

    console.log('Test documents created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test documents:', error);
    process.exit(1);
  }
}

seedDocuments();
