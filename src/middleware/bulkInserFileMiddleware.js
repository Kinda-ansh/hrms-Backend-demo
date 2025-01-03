const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, '../uploads')); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});


// Filter for file types (CSV and Excel only)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format. Please upload CSV or Excel files only.'), false);
    }
};

// Initialize multer
const upload = multer({ storage, fileFilter });

module.exports = upload;
