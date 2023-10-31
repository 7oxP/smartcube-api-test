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
                .setData(newNotif.dataValues)

        } catch (error: any) {
            
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async fetchAll(userId: number): Promise<IResponse> {
        try {
            let notifData = await NotificationEntity.findAll({ where: { user_id: userId } })
            // if (notifData == null) {
            //     return new Response()
            //         .setStatus(false)
            //         .setStatusCode(OperationStatus.repoErrorModelNotFound)
            //         .setMessage("model not found!")
            //         .setData({})
            // }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(notifData)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async find(id: number): Promise<IResponse> {
        try {
            let notifData = await NotificationEntity.findOne({ where: { id: id } })
            if (notifData == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("model not found!")
                    .setData({})
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(notifData.dataValues)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async delete(id: number): Promise<IResponse> {

        try {
            const res = await NotificationEntity.destroy({ where: { id: id } })

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData({})

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