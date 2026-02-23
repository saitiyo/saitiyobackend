
import app from "./server"

const PORT:any = process.env.PORT || 8080

app.listen(PORT,'0.0.0.0',()=>{
    console.log(`sever running on port ${PORT}`)
})