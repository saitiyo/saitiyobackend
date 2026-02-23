import { Request, Response } from "express";
import { Admin } from "../../db/models/models";
import bcrypt from 'bcryptjs'
import { generateJWT } from "../../utils/managejwt";




class AdminAuthController {

    public static async registeradmin(
        req:Request,
        res:Response
    ){

        try {

          const {email,password,firstName,lastName} = req.body 
      
          let response = await Admin.findOne({
            email: email,
          })

          /**
           * account already exists
           */

          if(response){

            res.json({
                isError:true,
                message:"Account already exists",
                payload:null
            })

            return
          }



          /**
           * hash password
           */

           
           let salt = await bcrypt.genSaltSync(10)
           let hash = await bcrypt.hashSync(password, salt)


           const newadmin = await Admin.create({
                firstName:firstName,
                lastName:lastName,
                email:email,
                passwordHash:hash
           })
           
          res.json({
            isError: false,
            message: "account created successfully",
            token:newadmin,
          })
            
        } catch (error) {

            //impliment logger later
            console.log("error",error)
            res.json(
                {
                    isError: true,
                    message: "Something has gone wrong..." + error,
                    token: null,
                }
      )
        }

    }
    public static async loginadmin(
        req:Request,
        res:Response
    ){

       try {

        const {email,password} = req.body 

        let response = await Admin.findOne({
            email: email,
        })

        /**
         * account does not exist
         */

        if(!response){

            res.status(400).json({
                isError:true,
                message:"Account does not exist",
                payload:null
            })

            return
          }



          /**
           * verify password
           */

          let isCorrect =  bcrypt.compareSync(
            password,
             response.passwordHash,
           )
  
           if(!isCorrect){
           res.status(400).json({
            isError:true,
            message:"Wrong password",
            payload:null
           })
           return
           }
          let _data = {
            id: response.id,
          }
    
          let token = await generateJWT(_data)
           
          res.status(200).json({
            isError: false,
            message: "operation successfull",
            payload: token,
          })
        
       } catch (error) {
        
       }

    }
}

export default AdminAuthController