import mongoose from "mongoose";
import {MONGODB_URI} from './envConfig.js'

const connectDb = async() => {

    mongoose.connection.on('connected' , () => {
        console.log('Database Connected')
    })
    
    await mongoose.connect(MONGODB_URI)
}

export default connectDb