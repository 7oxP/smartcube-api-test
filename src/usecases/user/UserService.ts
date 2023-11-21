import { IUserService } from "@/contracts/usecases/IUserService"
import { IResponse } from "@/contracts/usecases/IResponse"
import { IAuthGuard } from "@/contracts/middleware/AuthGuard"
import { IUploadedFile } from "@/contracts/IFile"
import { IStorageService } from "@/contracts/usecases/IStorageServices";
import { Response } from "../../utils/Response"
import { OperationStatus } from "../../constants/operations"
import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import { IJWTUtil } from "@/contracts/utils/IJWTUtil"
import { IHashUtil } from "@/contracts/utils/IHashUtil"
import { getUserProfile } from "./GetUserProfile"
import { updateUserProfile } from "./UpdateUserProfile"

class UserService implements IUserService {
    userRepo: IUserRepository
    storageService: IStorageService

    constructor(userRepo: IUserRepository, storageService: IStorageService) {
        this.userRepo = userRepo
        this.storageService = storageService
    }

    async getUserProfile(authGuard: IAuthGuard): Promise<IResponse> {
        return getUserProfile(authGuard, this.userRepo)
    }

    async updateUserProfile(authGuard: IAuthGuard, file: IUploadedFile): Promise<IResponse> {
        return updateUserProfile(authGuard, this.userRepo, this.storageService, file)
    }
}

export { UserService }

