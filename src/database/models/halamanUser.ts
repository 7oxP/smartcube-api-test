import express, { Request, Response } from "express"

const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

dotenv.config()

const app = express()

app.get("/user", (req: Request, res: Response) => {
    res.send('Halo, selamat datang')
  })


app.listen(5000, () => {
    console.log("Server berjalan di http://localhost:5000")
  })
