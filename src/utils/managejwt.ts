import jwt from "jsonwebtoken"

export const generateJWT = async (userInfo: object) => {
  const secrete = process.env.ACCESS_TOKEN_SECRET
  if(!secrete){
    //send email to dev team
     return
  }
  const token = await jwt.sign(userInfo,secrete)
  return token
}

export const decodeJWT = async (token: string | any) => {
  const secrete = process.env.ACCESS_TOKEN_SECRET
  if(!secrete){
     return
  }
  return await jwt.verify(token,secrete)
}
