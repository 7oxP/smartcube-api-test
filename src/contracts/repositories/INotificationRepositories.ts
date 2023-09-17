import { IResponse } from "../usecases/IResponse";

export interface INotificationRepositories {
    storeNotification(userId: number, title: string, description: string, imageUrl: string): Promise<IResponse>
}