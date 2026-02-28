import { NextFunction, Request, Response } from "express";
import { Country, Device, User, UserLocation } from "../../db/models/models";
import bcrypt from 'bcryptjs'
import { decodeJWT, generateJWT } from "../../utils/managejwt";
import axios from "axios";



const apiKey = process.env.TERMII_API_KEY
const termiiBaseUrl = process.env.TERMII_URL
const senderId = process.env.TERMII_SENDER_ID


class AuthController {
       
    public static getOTP = async (
        req: Request,
        res: Response,
        next: any
    ): Promise<any> => {
        try {
          
          const {mobileNumber,callingCode}:{mobileNumber:string,callingCode:string} = req.body 

          //for google team who review the app
          if(mobileNumber.trim() === "111111111"){
            res.status(200).json({
                isError:false,
                message:"OTP sent successfully",
                pin_id:"5592b908-c2cd-46b8-8c96-6c57559e3789"
             })

             return
          }

        
           //check if mobileNumber is starting with 0 if yes remove it
          const cleanMobileNumber = mobileNumber.startsWith('0') ? mobileNumber.substring(1) : mobileNumber;
          //strip (+) from the calling code for termii number format
          const _callingCode = callingCode.substring(1)
          const tel = `${_callingCode}${cleanMobileNumber}`
          const url = `${termiiBaseUrl}/api/sms/otp/send`



        //   logger.info("Sending OTP request to Termii", {
        //       tel,
        //       senderId
        //   });

          //call termii api endpoint
          const postData = {
            api_key :apiKey,
            message_type : "NUMERIC",
            to : tel,
            from :senderId,
            channel : "generic",
            pin_attempts :3,
            pin_time_to_live :15,
            pin_length :5,
            pin_placeholder : "< 1234 >",
            message_text : "Your Artbuk OTP is < 1234 >",
            pin_type : "NUMERIC"
         };



         const {data} = await axios.post(url,postData,{
            headers:{
                "Content-Type":'application/json'
            }
         })


        
        if(!data){
            //    logger.error("Failed to get response from Termii", {
            //       tel,
            //       error: "No data returned"
            //   });
              res.json({
                  isError:true,
                  message:"Something wrong has happend",
                  payload:null
              })
  
           return
        }


        //  logger.info("Successfully sent OTP", {
        //     tel,
        //     pinId: data.pinId
        // });

        //
        res.status(200).json({
           isError:false,
           message:"OTP sent successfully",
           pin_id:data.pinId
        })
  
  
        } catch (error) {

            // logger.error("Error in getOTP", {
            //     error: error instanceof Error ? error.message : "Unknown error",
            //     stack: error instanceof Error ? error.stack : undefined
            // });

            res.status(500).json(
                {
                        isError: true,
                        message: "Something has gone wrong",
                        payload: null,
                }
                )
            }
    }





   public static verifyOTP = async ( 
        req: Request,
        res: Response,
        next: NextFunction): Promise<any> => {
        try {
    
            const {
                mobileNumber,
                callingCode,
                pin_id,
                pin,
                lat,
                long,
                ip,
                timeZone,
                deviceId,
                fingurePrint,
                manufacturer,
                brand,
                isEmulator,
                installOdavoltVersion,
                updatedOdavoltVersion,
                isIOS,
                isAndroid,
                carrier,
                isTablet

            } = req.body 

            const url = `${termiiBaseUrl}/api/sms/otp/verify`
         
            const postData = {
                api_key:apiKey,
                pin_id:pin_id.trim(),
                pin:pin.trim()
            }


            //check if country is supported or not
            const country = await Country.findOne({
                    callingCode:callingCode.trim()
            })

            

            if(!country){
                res.status(400).json({
                    message:"Country is not supported",
                })

                return
            }

            //make a call to the termii api when it is not the google play team

            const dummyOTPs = ["00000","11111"]

            if(!dummyOTPs.includes(pin.trim()) && mobileNumber === "111111111"){
                const {data} = await axios.post(url,postData,{
                    headers:{
                        "Content-Type":'application/json'
                    }
                 })
        
        
                
                if(!data){
                    
                      res.json({
                          isError:true,
                          message:"Error verifying your number",
                          payload:null
                      })
          
                   return
                }
    
                if(data.verified === false){
                    res.json({
                        isError:true,
                        message:"Invalid Token",
                        payload:null
                    })

                    return
                }
    
            }
          
         
           

            //check if user with this phone number already exists
            let  user = null

            /**
             * Determine whether user already exists.
             * Existing users don't go through the full registration auth cycle
             */
            let isNewUser = false

            user = await User.findOne({
                    mobileNumber:mobileNumber
            })

            
            if(!user){

                //create user
                user = await User.create({
                        mobileNumber:mobileNumber,
                        countryId:country.id,   
                })

                isNewUser = true

                //Add user location
                await UserLocation.create({
                        userId:user.id,
                        lat:lat,
                        long:long,
                        ip
                })

            }


            /**
             * Manage user devices
             */

            //check if user device with this fingure print already exists

            const userDevice = await Device.findOne({
                where:{
                    userId:user.id,
                    fingurePrint
                }
            })


            //If it doesnt exist add
            if(!userDevice){

                await Device.create({
                        userId:user.id,
                        brand,
                        ip,
                        timeZone,
                        deviceId,
                        fingurePrint,
                        manufacturer,
                        isEmulator,
                        installOdavoltVersion,
                        updatedOdavoltVersion,
                        isIOS,
                        isAndroid,
                        carrier,
                        isTablet
                })
            }
            
          
            /**
             * Generate jwt token
             */

            const userInfo = {
                id:user.id
            }
            const token = await generateJWT(userInfo)

            if(!token){
                res.status(500).json({
                    message:"Something has gone wrong"
                }) 

                return
            }
    

             console.log("is new user:", isNewUser ? "yes":"no")

              res.status(200).json({
                  message:"verified",
                  token:token,
                  isNewUser:isNewUser,
                  user:user
              })


              } catch (error) {

                  res.status(500).json(
                  {
                      message: "Something has gone wrong",
                      token: null,
                  }
             )}
      }



       public static updateUser = async ( 
        req: Request,
        res: Response,
        next: NextFunction): Promise<any> => {
        try {
    
            const {
                legalFirstName,
                legalLastName,
                email,
                phoneNumber,
                countryId,  
                userId,
            } = req.body 

            console.log("updating user:", userId)

           const filter = { _id: userId };
           const update = {
               legalFirstName,
               legalLastName,
               email,
               phoneNumber,
               countryId
           };

            const account = await User.updateOne(filter, update)
  
          
            res.status(200).json({
                  isError:false,
                  message:"User updated successfully",
                  payload: account.modifiedCount > 0 ? true : false
              })
    
    
              } catch (error) {
                 console.log(error)
                  res.status(500).json(
                  {
                      isError: true,
                      message: "Failed to update user",
                      payload: null,
                  }
             )}
      }


      public static getUserByToken = async ( 
        req: Request,
        res: Response,
        next: NextFunction): Promise<any> => {
        try {

            //get token from headers and decode
            const bearer = req.header("Authorization")
            console.log("bearer:", bearer)
            if(!bearer){
                res.status(400).json({
                    isSuccess:false,
                    message:"Not Authorized"
                })

                return 
            }
            
            const token = bearer.split(' ')[1]
          

            console.log("token:", token)

             const {artistId}:any = await decodeJWT(token)
             
        
           
            const user = await User.findOne({
                where:{
                    id:artistId
                },
                include:{
                    artistAccount:true
                }
            })

            if(!user){
                res.json({
                    isError:true,
                    message:"Failed to get user",
                    payload:null
                })

                return
             }

              res.json({
                  isError:false,
                  message:"Operation successful",
                  payload:user
              })
    
    
              } catch (error) {
                 console.log(error)
                  res.json(
                  {
                      isError: true,
                      msg: "Something has gone wrong",
                      token: null,
                  }
             )}
      }


}

export default AuthController