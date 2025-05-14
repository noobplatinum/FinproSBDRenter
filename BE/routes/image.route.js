const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.cont');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

router.get('/', imageController.getAll);

router.get('/:id', imageController.getById);

router.get('/property/:propertyId', imageController.getByPropertyId);

router.get('/property/:propertyId/thumbnail', imageController.getThumbnailByPropertyId);

router.post('/upload', upload.single('image'), imageController.upload);

router.post('/upload/multiple', upload.array('images', 10), imageController.uploadMultiple);

router.put('/:id/thumbnail', imageController.setAsThumbnail);

router.delete('/:id', imageController.delete);

module.exports = router;