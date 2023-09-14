import { INotificationService } from "@/contracts/INotificationService";
import { IResponse } from "@/contracts/IResponse";

class NotificationService implements INotificationService {
    storeNotification(file: File, title: string, description: string): IResponse {
        throw new Error("Method not implemented.");
    }
    viewNotification(id: number): IResponse {
        throw new Error("Method not implemented.");
    }
    fetchAllNotification(): IResponse {
        throw new Error("Method not implemented.");
    }
    
}