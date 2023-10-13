import { IAuthService } from "@/contracts/usecases/IAuthService"
import { IResponse } from "@/contracts/usecases/IResponse"
import { Response } from "../../utils/Response"
import { OperationStatus } from "../../constants/operations"
import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import { IJWTUtil } from "@/contracts/utils/IJWTUtil"
import { IHashUtil } from "@/contracts/utils/IHashUtil"
import { INotificationService } from "@/contracts/usecases/INotificationService"

const dotenv = require("dotenv")

dotenv.config()

export class AuthService implements IAuthService {
  userRepo: IUserRepository
  jwtUtil: IJWTUtil
  hashUtil: IHashUtil
  notificationService: INotificationService

  constructor(
    userRepo: IUserRepository,
    jwtUtil: IJWTUtil,
    hashUtil: IHashUtil,
    notificationService: INotificationService
  ) {
    this.userRepo = userRepo
    this.jwtUtil = jwtUtil
    this.hashUtil = hashUtil
    this.notificationService = notificationService
  }
  async login(email: string, password: string): Promise<IResponse> {
    const secretKey = process.env.JWT_SECRET_KEY || ""

    try {
      const user = await this.userRepo.findByEmail(email)
      console.log("status", user.getStatus())


      if (!user.getStatus()) {
        user.setMessage("Invalid Credential")
        user.setData(undefined)
        return user
      }
      
      const compare = await this.hashUtil.compare(password, user.getData().getDataValue('password'))
      console.log('compare', compare)
      if (!compare.getStatus()) {
        compare.setMessage("Invalid Credential")
        return compare
      }
      
      const payload = {
        userId: user.getData().getDataValue("id"),
        email: user.getData().getDataValue("email"),
        username: user.getData().getDataValue("username"),
        password: user.getData().getDataValue("password"),
      }

      const generatedToken = await this.jwtUtil.encode(payload, secretKey, "5m")
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
      const user = await this.userRepo.findByEmail(email)

      if (user.getStatus()) {
        return new Response()
          .setStatus(false)
          .setStatusCode(OperationStatus.repoError)
          .setMessage("Email already exist")
          .setData({})
      }

      if (password !== cPassword) {
        return new Response()
          .setStatus(false)
          .setStatusCode(OperationStatus.repoError)
          .setMessage("Password is not the same")
          .setData({})
      }

      const hashPassword = await this.hashUtil.hash(password)

      // const passwordInDB = await this.userRepo.findByEmail(email)

      // console.log(hashPassword.getData())
      // console.log(passwordInDB.getData())

      // const comparePassword = await this.hashUtil.compare(password, passwordInDB.getData().password)

      // console.log('hashed',hashPassword.data)
      // console.log('compared',comparePassword.data)

      const verificationCode = await this.jwtUtil.encode(
        {
          username: username,
          email: email,
          password: hashPassword.data,
        },
        process.env.VERIFICATION_SECRET_KEY!,
        "5m"
      )
      const storeUser = await this.userRepo.store(
        username,
        email,
        hashPassword.data,
        verificationCode.getData()
      )

      const sendVerificationCode =
        this.notificationService.sendSignUpVerificationCode(
          "gxpgrwvup@internetkeno.com",
          verificationCode.getData()
        )
      console.log("verification:", sendVerificationCode)

      // console.log(storeUser.getStatus)
      if (storeUser.getStatus() === false) {
        return storeUser
      }
      return storeUser

    } catch (error) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage("error")
        .setData({})
    }
  }

  async checkVerificationCode(
    email: string,
    verification_code: string
  ): Promise<IResponse> {
    try {
      const checkVerification = await this.userRepo.findByVerificationCode(
        email,
        verification_code
      )

      if (checkVerification.getStatus() === false) {
        checkVerification.setMessage("Invalid Code!")
        return checkVerification
      }

      const setVerified = await this.userRepo.updateVerificationStatus(
        email,
        Boolean(1)
      )

      if (setVerified.getStatus() === false) {
        return setVerified
      }

      const getUpdatedUser = await this.userRepo.findByEmail(email)

      return getUpdatedUser
    } catch (error:any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage(error)
        .setData({})
    }
  }

  async resetPasswordRequest(email: string): Promise<IResponse> {
    try {
      const user = await this.userRepo.findByEmail(email)
      if (!user.getStatus()) {
        user.setMessage("Email does not exist!")
        return user
      }

      const resetToken = await this.jwtUtil.encode(
        { email: email },
        process.env.RESET_TOKEN_SECRET_KEY!,
        "5m"
      )
        
      const setToken = await this.userRepo.storeResetToken(
        email,
        resetToken.getData()
      )

      if (!setToken) {
        return new Response()
          .setStatus(false)
          .setStatusCode(OperationStatus.repoError)
          .setMessage("Gagal update")
          .setData({})
      }

      const sendEmail = this.notificationService.sendResetPasswordToken(
        "gxpgrwvup@internetkeno.com",
        resetToken.getData()
      )

      return sendEmail
    } catch (error) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage("error")
        .setData({})
    }
  }
  async resetPassword(
    resetToken: string,
    password: string,
    cPassword: string
  ): Promise<IResponse> {
    try {
      if (password !== cPassword) {
        return new Response()
          .setStatus(false)
          .setStatusCode(OperationStatus.fieldValidationError)
          .setMessage("Password tidak sama!")
          .setData({})
      }

      const hashedPassword = await this.hashUtil.hash(password)

      const updatePassword = await this.userRepo.updatePassword(hashedPassword.getData(), resetToken)

      if (updatePassword.getStatus() === false) {
        return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage(updatePassword.getMessage())
        .setData({})
      }

      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("success")
        .setData({})
    } catch (error) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage("error")
        .setData({})
    }
    // throw new Error("Method not implemented.")
  }
}

