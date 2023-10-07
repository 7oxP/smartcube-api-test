import { IAuthService } from "@/contracts/usecases/IAuthService"
import { IResponse } from "@/contracts/usecases/IResponse"
import { UserRepository } from "../../repositories/UserRepository"
import { Response } from "../../utils/Response"
import { OperationStatus } from "../../constants/operations"
import { JWTUtil } from "../../utils/JWTUtil"
import { AuthJWT } from "../../middleware/AuthJWT"
import { HashUtil } from "../../utils/HashUtil"

const dotenv = require("dotenv")

dotenv.config()

export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<IResponse> {
    const secretKey = process.env.JWT_SECRET_KEY || ""

    try {
      const user = await new UserRepository().findByEmail(email)
      console.log("status", user.getStatus())

      if (
        !user.getStatus() ||
        user.getData().getDataValue("password") != password
      ) {
        return new Response()
          .setStatus(false)
          .setStatusCode(OperationStatus.repoErrorModelNotFound)
          .setMessage("User not found")
          .setData({ error: "User not found" })
      }

      const payload = {
        userId: user.getData().getDataValue("id"),
        email: user.getData().getDataValue("email"),
        username: user.getData().getDataValue("username"),
        password: user.getData().getDataValue("password"),
      }

      const generatedToken = await new JWTUtil().encode(payload, secretKey)
      //   const verify = new JWTUtil().decode(secretKey)

      console.log(generatedToken.getData())

      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData({ accessToken: generatedToken.getData() })
    } catch (error: any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage(error)
        .setData({})
    }
  }
  async signUp(
    username: string,
    email: string,
    password: string,
    cPassword: string
  ): Promise<IResponse> {
    try {
      const user = await new UserRepository().findByEmail(email)
      console.log("status", user.getStatus())

      if (user.getStatus()) {
        return new Response()
          .setStatus(false)
          .setStatusCode(OperationStatus.repoError)
          .setMessage("Email already exist")
          .setData({ error: "Email already exist" })
      }

      if (password !== cPassword) {
        return new Response()
          .setStatus(false)
          .setStatusCode(OperationStatus.repoError)
          .setMessage("Password is not the same")
          .setData({ error: "Password is not the same" })
      }

      const hashPassword = await new HashUtil().hash(password)

      const passwordInDB = await new UserRepository().findByEmail(email)

      const comparePassword = await new HashUtil().compare(passwordInDB.getData().password, password)

      console.log('hashed',hashPassword.data)
      console.log('compared',comparePassword.data)


      const storeUser = await new UserRepository().store(
        username,
        email,
        hashPassword.data,
      )

      return new Response()
          .setStatus(true)
          .setStatusCode(OperationStatus.success)
          .setMessage("success")
          .setData({ data: storeUser})

    } catch (error) {
      return new Response()
          .setStatus(false)
          .setStatusCode(OperationStatus.repoError)
          .setMessage("error")
          .setData({ error: error })
    }
  }
  resetPasswordRequest(email: string): Promise<IResponse> {
    throw new Error("Method not implemented.")
  }
  resetPassword(
    resetToken: string,
    password: string,
    cPassword: string
  ): Promise<IResponse> {
    throw new Error("Method not implemented.")
  }
}

