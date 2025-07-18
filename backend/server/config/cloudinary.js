const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'literacy-platform',
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'pdf'],
    resource_type: 'auto'
  }
});

const upload = multer({ storage });

module.exports = upload;