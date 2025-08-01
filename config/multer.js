import multer from 'multer';

const storage = multer.memoryStorage(); // Store file in memory
export default multer({ storage });
