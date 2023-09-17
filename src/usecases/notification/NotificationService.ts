import { INotificationService } from "@/contracts/usecases/INotificationService";
import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IResponse } from "@/contracts/usecases/IResponse";
import { storeNotification } from "./StoreNotification";
import { ICloudMessagingService } from "@/contracts/usecases/ICloudMessagingService";
import { IStorageService } from "@/contracts/usecases/IStorageServices";
import { IUploadedFile } from "@/contracts/IFile";
import { IAuthGuard } from "@/contracts/middleware/AuthGuard";

class NotificationService implements INotificationService {

    notifRepo: INotificationRepositories
    cloudMessageService: ICloudMessagingService
    cloudStorageService: IStorageService

    constructor(
        notifRepo: INotificationRepositories, 
        cloudMessageService: ICloudMessagingService,
        cloudStorageService: IStorageService
    ) {
        this.notifRepo = notifRepo;
        this.cloudMessageService = cloudMessageService;
        this.cloudStorageService = cloudStorageService
    }

    storeNotification(authGuard: IAuthGuard, file: IUploadedFile, title: string, description: string): Promise<IResponse> {
        return storeNotification(
            authGuard,
            this.notifRepo, 
            this.cloudMessageService, 
            this.cloudStorageService,
            file,
            title,
            description
            )
    }

    viewNotification(authGuard: IAuthGuard, id: number): IResponse {
        throw new Error("Method not implemented.");
    }

    fetchAllNotification(authGuard: IAuthGuard,): IResponse {
        throw new Error("Method not implemented.");
    }
    
}

export { NotificationService }