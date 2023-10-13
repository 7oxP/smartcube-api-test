import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import { IResponse } from "@/contracts/usecases/IResponse"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"
import UserEntity from "../entities/UserEntity"
import { format } from 'date-fns'

class UserRepository implements IUserRepository {

  date = new Date()
  formattedTime = format(this.date, 'yyyy-MM-dd HH:mm:ss')

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
    code: string
  ): Promise<IResponse> {
    try {

      const user = await UserEntity.create({
        username: username,
        email: email,
        password: password,
        is_verified: 0,
        verification_code: code,
        created_at: this.formattedTime,
      })

      user.setDataValue('password',null)
      // user.setDataValue('verification_code',null)


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
  async findByVerificationCode(
    email: String,
    code: String
  ): Promise<IResponse> {
    try {
      const user = await UserEntity.findOne({
        where: { email: email, verification_code: code },
      })

      if (user !== null) {
        user.setDataValue('password', null)
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
  async updateVerificationStatus(
    email: String,
    status: boolean
  ): Promise<IResponse> {
    try {
      const updateUser = await UserEntity.update(
        { is_verified: status, verification_code: null, updated_at: this.formattedTime },
        { where: { email: email } }
      )


      if (updateUser[0] === 0) {
        throw new Error("Update Gagal, Email tidak valid")
      }

      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData(updateUser)
    } catch (error: any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage(error)
        .setData({})
    }
  }

  async storeResetToken(email: string, resetToken: string): Promise<IResponse>{
    try {

      const updateUser = await UserEntity.update(
        { reset_token: resetToken, updated_at: this.formattedTime},
        { where: { email: email } }
      )

      if (updateUser[0] === 0) {
        throw new Error("Update Gagal, Email tidak valid")
      }

      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData("")
    } catch (error: any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage(error)
        .setData({})
    }
  }
  
  async updatePassword(password: string, resetToken: string): Promise<IResponse>{
    try {
      const email = await UserEntity.findOne({where: {reset_token: resetToken}})

      if (!email) {
        return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage("Token invalid")
        .setData({})
      }

      const updateUser = await UserEntity.update(
        { password: password, reset_token: null, updated_at: this.formattedTime },
        { where: { email: email?.getDataValue('email') } }
      )

      if (updateUser[0] === 0) {
        throw new Error("Update Gagal, Email tidak valid")
      }
      console.log(this.formattedTime)
      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData(updateUser)
    } catch (error: any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage(error)
        .setData({})
    }
  }
}

export { UserRepository }

