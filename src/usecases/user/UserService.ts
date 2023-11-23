import { IUserService } from "@/contracts/usecases/IUserService"
import { IResponse } from "@/contracts/usecases/IResponse"
import { IAuthGuard, UserRoles } from "@/contracts/middleware/AuthGuard"
import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import { getUserProfile } from "./GetUserProfile"
import { getUserGroupStatus } from "./GetUserGroupStatus"
import { addUserGroup } from "./AddUserGroup"

class UserService implements IUserService {
    userRepo: IUserRepository

    constructor(userRepo: IUserRepository) {
        this.userRepo = userRepo
    }

    async getUserProfile(authGuard: IAuthGuard): Promise<IResponse> {
        return getUserProfile(authGuard, this.userRepo)
    }

    async getUserGroupStatus(authGuard: IAuthGuard, edgeServerId: number): Promise<IResponse> {
        return getUserGroupStatus(this.userRepo, authGuard, edgeServerId)
    }

    async addUserGroup(authGuard: IAuthGuard, edgeServerId: number, roleId: UserRoles): Promise<IResponse> {
        return addUserGroup(this.userRepo, authGuard.getUserId(), edgeServerId, roleId) 
    }
}

export { UserService }

