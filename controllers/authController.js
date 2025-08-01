import userModel from "../Models/userModels.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { BASE_URL, JWT_SECRET, NODE_ENV } from "../config/envConfig.js"
import {sendMail} from '../config/Nodemailer.js'

export const register = async (req, res) => {

    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing Details' })
    }

    try {
        const existingUser = await userModel.findOne({ email })

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User Already Exist' })
        }

        const hashPassword = await bcrypt.hash(password,10)

        const dbUser = new userModel({name, email, password:hashPassword})
        await dbUser.save()

        const token = jwt.sign({id: dbUser._id} , JWT_SECRET, {expiresIn:'7d'})

        res.cookie('token', token , {
            httpOnly: true,
            secure: NODE_ENV === 'production' ,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000

        })

        // WELOCME EMAIL
        await sendMail(
            dbUser.email,
            `Welcome to EasyLearn! 🚀`, // Subject
            `Hi ${dbUser.name},\n\nWelcome to EasyLearn! We're excited to have you on board.\nStart learning and sharing your knowledge today.\n\nWatch this quick intro: https://www.youtube.com/watch?v=WfmaLgt0328&list=RDWfmaLgt0328&start_radio=1`, // Text
            `
    <div style="font-family: Arial, sans-serif; padding: 10px;">
        <h2>Welcome to EasyLearn, ${dbUser.name}! 🚀</h2>
        <p>We're excited to have you on board.<br/>
        Start learning and sharing your knowledge today.</p>
        <p>
            <a href="https://www.youtube.com/watch?v=WfmaLgt0328&list=RDWfmaLgt0328&start_radio=1" 
               style="display:inline-block;padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
               Watch Introduction Video
            </a>
        </p>
    </div>
    `
);


        return res.status(201).json({success:true , message: 'User Created'})
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }

}

export const login = async(req,res) => {
    
    const {email , password} = req.body

    if(!email || !password)
    {
        return res.status(400).json({ success: false,
        message: 'Email and Password are required' })
    }

    try{
        const user = await userModel.findOne({email})

        if(!user){
        return res.status(400).json({ success: false, message: 'Invalid Email' })
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
        return res.status(400).json({ success: false, message: 'Invalid Password' })
        }

        const userData = {
            name: user.name,
            email: user.email,
            
        };

        const token = jwt.sign({id: user._id } , JWT_SECRET, {expiresIn:'7d'})

        res.cookie('token', token , {
            httpOnly: true,
            secure: NODE_ENV === 'production' ,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000

        })

        return res.status(201).json({success:true , message: 'Login Successfull' , user:userData})


    }
    catch(error){
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const logout = async(req,res) => {
    try{
        res.clearCookie('token' , {
            httpOnly: true,
            secure: NODE_ENV === 'production' ,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(201).json({success:true , message: 'Logged Out'})
    }
    catch{
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const sendverifyOtp = async(req,res) => {
    try{

        const userId = req.user.id

        const user = await userModel.findById(userId)

        // console.log("Looking for userId:", req.user)
        // console.log("User found:", user)
        // console.log(userId)
        
        if(user.isAccountVerified){
        return res.status(200).json({success:true , message: 'Account is Already Verified'})
        }

       const otp = String(Math.floor(1000 + Math.random() * 9000))

       user.verifyOtp = otp
       user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

       await user.save()

       await sendMail(
           user.email,
           `VERIFY ACCOUNT OTP Code 🔐`,

           // Text version (fallback)
           `Hi ${user.name},
            Your OTP is: ${otp}
            Please do not share it with anyone.
            Thanks,
            The EasyLearn Team`,

           // HTML version
`<div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; color: #333;">
        <h2 style="color: #4CAF50;">VERIFY ACCOUNT OTP Code 🔐</h2>
        <p>Hi ${user.name},</p>
        <p>Your OTP is:</p>
        <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">${otp}</p>
       <br/>
        Please do not share it with anyone for security reasons.</p>
        <p style="margin-top:20px;">Thanks,<br/>The EasyLearn Team</p>
    </div>`);

        return res.status(201).json({success:true , message: 'Verification OTP Sent on Email'})

    }
    catch(error)
    {
        return res.status(500).json({ success: false, message: error.message })
    }
}


export const verifyEmail = async(req,res) => {

    const userId = req.user.id 
    const { otp } = req.body

    if(!otp){

        return res.status(400).json({ success: false, message: 'OTP is required' })
    }

    try{

        const user = await userModel.findById(userId)

        if(!user){
        return res.status(400).json({ success: false, message: 'User Not Found' })
        }

        if(user.verifyOtpExpireAt < Date.now()){
         return res.status(400).json({ success: false, message: 'Expired OTP' })
        }

        if (user.verifyOtp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' })
        }

        user.isAccountVerified = true
        user.verifyOtp = ''
        user.verifyOtpExpireAt = 0

      await user.save()

        return res.status(201).json({success:true , message: 'EMAIL Verified Successfully'})
    }
    catch(error)
    {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const forgotPassword = async(req,res) =>  {
7
    const {email} = req.body

    try{
        const user = await userModel.findOne({email})

        if(!user){
        return res.status(400).json({ success: false, message: 'EMAIL Not Found' })
        }

        const token = jwt.sign({id:user._id}, JWT_SECRET , {expiresIn:'10m'} )

        const resetLink = `${BASE_URL + '/reset-password/' + token }`

        await sendMail(
            user.email,
            "Reset Your Password 🔐",
            '',
            `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; margin: 25px , 25px; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>This link is valid for 15 minutes.</p>
      <p>If you didn't request this, feel free to ignore it.</p>
    </div>`);

    res.status(201).json({success:true , message: 'Reset link sent to your email.'})
    }
    catch(error){
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const resetPassword = async(req,res) => {

    const {token} = req.params
    const {newPassword} = req.body
    

    try{
        const tokenDecode = jwt.verify(token , JWT_SECRET)

        const hashPassword = await bcrypt.hash(newPassword , 10)

        const user = await userModel.findOneAndUpdate({_id: tokenDecode.id},{password: hashPassword})

        if(!user)
        {
            return res.status(400).json({ message: "User not found" });
        }

       res.clearCookie('token', {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

        return res.status(200).json({ success: true, message: 'Password changed!'})

    }
    catch(error){
        return res.status(500).json({ success: false, message: error.message })
    }

}