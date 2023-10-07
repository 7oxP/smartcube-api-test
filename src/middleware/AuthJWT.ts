import { JWTUtil } from "@/utils/JWTUtil"
import { IJWTUtil } from "../contracts/utils/IJWTUtil"
import { IResponse } from "@/contracts/usecases/IResponse"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"


import { NextFunction, Request, Response as ExpressResponse } from "express"
import { decode } from "punycode"
const jwt = require("jsonwebtoken")

export class AuthJWT {
  private secretKey: string
  private jwtUtil: IJWTUtil

  constructor(secretKey: string, jwtUtil: IJWTUtil) {
    this.secretKey = secretKey
    this.jwtUtil = jwtUtil
  }
  authenticateToken = async (req: Request, res: ExpressResponse, next: NextFunction) => {
    const token = req.header("Authorization")

    console.log(token)

    if(!token){
      return res.json(
      new Response()
      .setStatus(false)
      .setStatusCode(OperationStatus.repoError)
      .setMessage("Unauthorized")
      .setData({})).status(401)
    }

    const decode = await this.jwtUtil.decode(token!, this.secretKey);
    (req as any).user = decode
    console.log('decode: ', decode.getData())
    next()

  }
}
