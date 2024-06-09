const multer = require('multer');

// Set up multer storage
const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        // Specify the destination where files should be stored
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // Specify how files should be named
        cb(null, file.originalname)
    }
});

// Create multer instance with the specified storage options
const upload = multer({ storage: storage });

// Export multer middleware for use in Express routes
module.exports = upload;