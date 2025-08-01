// envConfig.js

import dotenv from 'dotenv';
dotenv.config(); 

export const MONGODB_URI = process.env.MONGODB_URI;

export const JWT_SECRET = process.env.JWT_SECRET


// for cookies
export const NODE_ENV = process.env.NODE_ENV


// for nodemailer
export const SENDER_EMAIL = process.env.SENDER_EMAIL

export const PASSWORD = process.env.PASSWORD

export const BASE_URL = process.env.BASE_URL

//Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
export const CLOUDINARY_API_KEY    = process.env.CLOUDINARY_API_KEY
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET