import { IAuthService } from "@/contracts/usecases/IAuthService"
import { Request as ExpressRequest, Response as ExpressResponse } from "express"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"

export class AuthHandlers {
  private authService: IAuthService

  constructor(authService: IAuthService) {
    this.authService = authService
  }

  async loginHandler(req: ExpressRequest, res: ExpressResponse) {
    try {
      const loginResponse = await this.authService.login(
        req.body.email,
        req.body.password
      )
      console.log(loginResponse)
      return res.json(loginResponse).status(200)
    } catch (error: any) {
      return res
        .json(
          new Response()
            .setStatus(false)
            .setStatusCode(OperationStatus.fieldValidationError)
            .setMessage(error)
        )
        .status(400)
    }
  }

  async signUpHandler(req: ExpressRequest, res: ExpressResponse) {
    try {
      const signUpResponse = await this.authService.signUp(
        req.body.username,
        req.body.email,
        req.body.password,
        req.body.cPassword
      )
      console.log(signUpResponse)
      return res.json(signUpResponse).status(200)
    } catch (error: any) {
      return res
        .json(
          new Response()
            .setStatus(false)
            .setStatusCode(OperationStatus.fieldValidationError)
            .setMessage(error)
        )
        .status(400)
    }
  }

  async verificationHandler(req: ExpressRequest, res: ExpressResponse) {
    try {
      const verification = await this.authService.checkVerificationCode(
        req.body.email,
        req.body.verificationCode
      )
      console.log(verification)
      return res.json(verification).status(200)
    } catch (error: any) {
      return res
        .json(
          new Response()
            .setStatus(false)
            .setStatusCode(OperationStatus.fieldValidationError)
            .setMessage(error)
        )
        .status(400)
    }
  }

  async resetPasswordReq(req: ExpressRequest, res: ExpressResponse) {
    try {
      const resetRequest = await this.authService.resetPasswordRequest(
        req.body.email
      )
      console.log(resetRequest)
      return res.json(resetRequest).status(200)
    } catch (error: any) {
      return res
        .json(
          new Response()
            .setStatus(false)
            .setStatusCode(OperationStatus.fieldValidationError)
            .setMessage(error)
        )
        .status(400)
    }
  }

  async resetPassword(req: ExpressRequest, res: ExpressResponse) {
    try {
      const reset = await this.authService.resetPassword(
        req.header("Authorization")!,
        req.body.password,
        req.body.cPassword
      )
      console.log('reset',reset)
      return res.json(reset).status(200)
    } catch (error: any) {
      return res
        .json(
          new Response()
            .setStatus(false)
            .setStatusCode(OperationStatus.fieldValidationError)
            .setMessage(error)
        )
        .status(400)
    }
  }
}

