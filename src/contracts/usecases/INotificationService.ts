import { IResponse } from "./IResponse";
import { IUploadedFile } from "../IFile";
import { IAuthGuard } from "../middleware/AuthGuard";

export interface INotificationService {
    storeNotification(authGuard: IAuthGuard, file: IUploadedFile, title: string, description: string): Promise<IResponse>
    viewNotification(authGuard: IAuthGuard, id: number): Promise<IResponse>
    fetchAllNotification(authGuard: IAuthGuard,): Promise<IResponse>
}