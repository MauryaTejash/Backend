import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'


const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}))

//to receive file in json format with limit
app.use(express.json({limit: "10kb"}))

// to recieve file from url
app.use(express.urlencoded({extended:true,limit:"10kb"}))

//to recieve file from pdf or images
app.use(express.static("public"))

app.use(cookieParser())

export default app