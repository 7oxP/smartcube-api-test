import { IResponse } from "./IResponse";

export interface INotificationService {
    storeNotification(file: File, title: string, description: string): IResponse
    viewNotification(id: number): IResponse
    fetchAllNotification(): IResponse
}