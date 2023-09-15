import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { INotificationService } from "@/contracts/usecases/INotificationService";
import { IResponse } from "@/contracts/usecases/IResponse";
import { storeNotification } from "./StoreNotification";

class NotificationService implements INotificationService {

    notifRepo: INotificationRepositories

    constructor(notifRepo: INotificationRepositories) {
        this.notifRepo = notifRepo;
    }

    storeNotification(file: File, title: string, description: string): IResponse {
        return storeNotification(this.notifRepo)
    }

    viewNotification(id: number): IResponse {
        throw new Error("Method not implemented.");
    }

    fetchAllNotification(): IResponse {
        throw new Error("Method not implemented.");
    }
    
}