import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/envConfig.js'

 export const userAuth = async(req,res,next) => {

    const {token} =  req.cookies

    if(!token){
     return res.status(400).json({success: false, message: 'Not Authorized , Login Again.'})
    }

    try{

        const tokenDecode = jwt.verify(token, JWT_SECRET)
        // console.log(tokenDecode)


        if (tokenDecode){

           req.user =  { id: tokenDecode.id} 
           
        }
        else
        {
         return res.status(400).json({ success: false, message: 'Not Authorized , Login Again' })   
        }

        next()
    }
    catch(error)
    {
     return res.status(500).json({ success: false, message: error.message })  
    }

}