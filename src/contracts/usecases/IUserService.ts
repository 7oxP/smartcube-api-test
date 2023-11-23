import { IResponse } from "./IResponse";
import { IAuthGuard, UserRoles } from "../middleware/AuthGuard";

export interface IUserService {
    getUserProfile(authGuard: IAuthGuard): Promise<IResponse>
    getUserGroupStatus(authGuard: IAuthGuard, edgeServerId: number): Promise<IResponse>
    addUserGroup(authGuard: IAuthGuard, edgeServerId: number, roleId: UserRoles): Promise<IResponse>
}
