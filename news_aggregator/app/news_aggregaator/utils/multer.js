const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Define storage strategy with security improvements
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure 'uploads' folder exists
  },
  filename: function (req, file, cb) {
    // Generate random filename to prevent directory traversal attacks
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomName}${ext}`);
  }
});

// Enhanced file filter with security checks
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  // Allowed extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check both MIME type and extension
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`), false);
  }
};

// Configure multer with file size limits and security options
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 5 * 1024 * 1024, // 5MB default
    files: 1 // Limit to one file per upload
  }
});

module.exports = upload;
