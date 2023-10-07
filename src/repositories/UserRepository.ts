import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import { IResponse } from "@/contracts/usecases/IResponse"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"
import UserEntity from "../entities/UserEntity"

class UserRepository implements IUserRepository {
  async findByEmail(email: String): Promise<IResponse> {
    try {
      const user = await UserEntity.findOne({ where: { email: email } })

      if (user !== null) {
        return new Response()
          .setStatus(true)
          .setStatusCode(OperationStatus.success)
          .setMessage("ok")
          .setData(user)
      }

      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoErrorModelNotFound)
        .setMessage("User not found")
        .setData({})
    } catch (error: any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage(error)
        .setData({})
    }
  }

  async store(
    username: string,
    email: string,
    password: string,
  ): Promise<IResponse> {
    try {
      const date = new Date().toISOString()

      const user = await UserEntity.create({
        username: username,
        email: email,
        password: password,
        is_verified: 0,
        created_at: date.slice(0,10)
      })

      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData(user)
    } catch (error: any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage(error)
        .setData({})
    }
  }
  findByVerificationCode(email: String, code: String): Promise<IResponse> {
    throw new Error("Method not implemented.")
  }
  updateVerificationStatus(email: String, status: boolean): Promise<IResponse> {
    throw new Error("Method not implemented.")
  }
}

export { UserRepository }

