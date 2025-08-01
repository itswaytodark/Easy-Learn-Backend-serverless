import express from 'express'
import { forgotPassword, login, logout, register, resetPassword, sendverifyOtp, verifyEmail } from '../controllers/authController.js'
import { userAuth } from '../middelware/userAuth.js'

const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/send-verify-otp',userAuth, sendverifyOtp)
authRouter.post('/verify-email',userAuth, verifyEmail)

authRouter.post('/reset-email', forgotPassword)
authRouter.post('/reset-password/:token', resetPassword)

export default authRouter