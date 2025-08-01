import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import connectDb from './config/MongoDb.js'
import authRouter from './routes/authRoutes.js'
import blogRouter from './routes/blogroutes.js'


const PORT = process.env.PORT || 4000
connectDb()

const app = express()

app.use(cors({origin: 'http://localhost:5173' ,credentials:true}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


//Api Routes
app.use('/api/auth',authRouter)
app.use('/api/blogs',blogRouter)



app.listen(PORT, () => {
    console.log(`server is started on ${PORT}`)
})