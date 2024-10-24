// multer.ts
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';
import multer from 'multer';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
        folder: 'some-folder-name',
        allowedFormats: ['png', 'jpg', 'jpeg', 'mp4', 'AVI'], // Exemple de format autorisé
        public_id: (req, file) => 'computed-filename-using-request',
    },
});

const upload = multer({ storage: storage });

export default upload;

