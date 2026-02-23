import express from "express"
import cors from "cors"
import authRouter from "./services/auth/auth.router"
import adminAuthRouter from "./services/admin/admin.auth.router"



const app = express()
const apiPrefix = "/api"

// cors middleware
app.use(cors())

//middleware to parse json body
app.use(express.json())

//url encoding
app.use(`${apiPrefix}/admin`,adminAuthRouter)
app.use(`${apiPrefix}/auth`, authRouter)


export default app