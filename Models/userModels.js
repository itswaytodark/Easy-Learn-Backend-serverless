import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: {type:String, required:true, set: (v) => v.trim().toUpperCase()},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    isAccountVerified: {type:Boolean, default:false},

    verifyOtp:{type:String,default:''},
    verifyOtpExpireAt:{type:Number,default:0}

})

const userModel = mongoose.model('User' , userSchema)

export default userModel