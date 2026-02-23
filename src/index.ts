import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

import app from "./server"


const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
    console.error("DATABASE_URL is not defined in environment variables");
    process.exit(1);
}       


mongoose.connect( DATABASE_URL).then(() => {
    console.log("MongoDB connected");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

const PORT:any = process.env.PORT || 8080

app.listen(PORT,'0.0.0.0',()=>{
    console.log(`sever running on port ${PORT}`)
})