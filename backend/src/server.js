import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"

import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js"

const app = express();
dotenv.config();

const __dirname=path.resolve()

const PORT = process.env.PORT || 4000

app.use(cors({
    origin: "http://localhost:5173",
    credentials:true, // allow frontend to send cookies
}))
app.use(express.json());
app.use(cookieParser())

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat",chatRoutes)

if (process.env.NODE_ENV == "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend/dist/index.html"))
    })
}

app.listen(PORT,"0.0.0.0", () => {
    console.log('Server is running on port', PORT);
    connectDB();
}) 