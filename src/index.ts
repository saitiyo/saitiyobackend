
import app from "./server"

const PORT = process.env.PORT || 8080

app.listen(PORT,()=>{
    console.log(`sever running on port ${PORT}`)
})