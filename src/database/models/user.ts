// import express, { NextFunction, Request, Response } from "express"
// import bodyParser from "body-parser"
// import UserEntity from "../../entities/UserEntity"
// import { JWTUtil } from "../../utils/JWTUtil"
// import { AuthJWT } from "../../middleware/AuthJWT"
// import { UserRepository } from "../../repositories/UserRepository"
// import { AuthService } from "../../usecases/auth/AuthService"


// const jwt = require("jsonwebtoken")
// const dotenv = require("dotenv")

// dotenv.config()

// const app = express()

// // const User = require("../../entities/UserEntity")
// // console.log(User)
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())

// const secretKey = process.env.JWT_SECRET_KEY || ''

// app.get("/register", (req: Request, res: Response) => {
//   res.send(`
//     <form method="post" action="/register">
//       <input type="text" name="email" placeholder="Email" /><br />
//       <input type="password" name="password" placeholder="Password" /><br />
//       <button type="submit">register</button>
//     </form>
//   `)
// })

// app.post("/register", async (req: Request, res: Response) => {
//   const { email, password } = req.body

//   try {
//     const isExist = await new UserRepository().findByEmail(email)

//     console.log(isExist.getStatus())
//     if (!isExist.getStatus()) {
//       const storeData = await new UserRepository().store(email, password)
//       return res.json({ message: "Berhasil register!", data: storeData })
//     }



//     res.json({message:'Email telah terdaftar!'})

//   } catch (error) {
//     console.error("Error:", error)
//     res.status(500).json({ error: "Internal Server Error" })
//   }

// })


// app.get("/login", (req: Request, res: Response) => {
//   res.send(`
//     <form method="post" action="/login">
//       <input type="text" name="email" placeholder="Email" /><br />
//       <input type="password" name="password" placeholder="Password" /><br />
//       <button type="submit">Login</button>
//     </form>
//   `)
// })

// app.post("/login", async (req: Request, res: Response) => {
//   const jwtAuth = new AuthService()
//   const { email, password } = req.body

//   try {
    
//     const login = jwtAuth.login(email, password)
//     console.log((await login).getData().token)

//     res.json({message: (await login).getMessage(), data: (await login).getData()})

//   } catch (error) {
//     console.error("Error:", error)
//     res.status(500).json({ error: "Internal Server Error" })
//   }
// })

// const authenticateToken = new AuthJWT(secretKey).authenticateToken

// app.get("/user", authenticateToken, (req: Request, res: Response) => {
//   console.log(req.header('Authorization'))
//   res.send('Halo, selamat datang')
// })

// // User.sequelize.sync().then(() => {
// app.listen(3000, () => {
//   console.log("Server berjalan di http://localhost:3000")
// })
// // })

