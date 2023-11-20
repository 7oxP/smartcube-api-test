import { IUserService } from "@/contracts/usecases/IUserService"
import { IResponse } from "@/contracts/usecases/IResponse"
import { IAuthGuard } from "@/contracts/middleware/AuthGuard"
import { Response } from "../../utils/Response"
import { OperationStatus } from "../../constants/operations"
import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import { IJWTUtil } from "@/contracts/utils/IJWTUtil"
import { IHashUtil } from "@/contracts/utils/IHashUtil"

const dotenv = require("dotenv")

dotenv.config()

const getUserProfile = async function (
    authGuard: IAuthGuard,
    userRepo: IUserRepository
): Promise<IResponse> {
    const userData = await userRepo.findByEmail(authGuard.getUserEmail())

    if (userData.isFailed()) {
        userData.setStatusCode(OperationStatus.authUnverified)
        return userData
    }

    const userProfile = {
        "name": userData.getData().getDataValue("username"),
        "username": userData.getData().getDataValue("username"),
        "user_email": userData.getData().getDataValue("email"),
        "user_location":"Indonesia"
    }

    userData.setData(userProfile)
    return userData
}

export { getUserProfile }

