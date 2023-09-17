import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IResponse } from "@/contracts/usecases/IResponse";
import { Response } from "../utils/Response";
import { OperationStatus } from "../constants/operations";
import NotificationEntity from '../entities/NotificationEntity'

class NotificationRepository implements INotificationRepositories {
    
    async storeNotification(userId: number, title: string, description: string, imageUrl: string): Promise<IResponse> {

        try {
            const newNotif = await NotificationEntity.create({
                user_id: userId,
                title: title,
                image: imageUrl,
                description: description,
                is_viewed: false,
                created_at: new Date()
            })

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(newNotif)

        } catch (error: any) {

            return new Response()
            .setStatus(false)
            .setStatusCode(OperationStatus.repoError)
            .setMessage(error)
            .setData({})
        }
    }
}

export { NotificationRepository }