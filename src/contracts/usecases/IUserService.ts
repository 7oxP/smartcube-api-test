import { IResponse } from "./IResponse";
import { IAuthGuard } from "../middleware/AuthGuard";

export interface IUserService {
    getUserProfile(authGuard: IAuthGuard): Promise<IResponse>
}
