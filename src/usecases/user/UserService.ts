import { IUserService } from "@/contracts/usecases/IUserService"
import { IResponse } from "@/contracts/usecases/IResponse"
import { IAuthGuard } from "@/contracts/middleware/AuthGuard"
import { Response } from "../../utils/Response"
import { OperationStatus } from "../../constants/operations"
import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import { IJWTUtil } from "@/contracts/utils/IJWTUtil"
import { IHashUtil } from "@/contracts/utils/IHashUtil"
import { getUserProfile } from "./GetUserProfile"

class UserService implements IUserService {
    userRepo: IUserRepository

    constructor(userRepo: IUserRepository) {
        this.userRepo = userRepo
    }

    async getUserProfile(authGuard: IAuthGuard): Promise<IResponse> {
        return getUserProfile(authGuard, this.userRepo)
    }
}

export { UserService }

