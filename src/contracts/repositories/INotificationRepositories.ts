import { IResponse } from "../usecases/IResponse";

export interface INotificationRepositories {
    storeNotification(userId: number, edgeServerId: number, title: string, description: string, imageUrl: string): Promise<IResponse>
    fetchAll(userId: number): Promise<IResponse>
    find(id: number): Promise<IResponse>
    delete(id: number): Promise<IResponse>
}