import { IResponse } from "../usecases/IResponse";

export interface INotificationRepositories {
    storeNotification(userId: number, title: string, description: string, imageUrl: string): Promise<IResponse>
    find(id: number): Promise<IResponse>
    delete(id: number): Promise<IResponse>
}