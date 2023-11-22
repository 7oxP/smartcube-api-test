import { IResponse } from "./IResponse";
import { IAuthGuard } from "../middleware/AuthGuard";
import { IUploadedFile } from "@/contracts/IFile"

export interface IUserService {
    getUserProfile(authGuard: IAuthGuard): Promise<IResponse>
    updateUserProfile(authGuard: IAuthGuard, file: IUploadedFile): Promise<IResponse>
}
