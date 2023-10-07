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
}
