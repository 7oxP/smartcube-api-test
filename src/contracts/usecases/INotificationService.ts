import { IResponse } from "./IResponse";
import { File } from "buffer";

export interface INotificationService {
    storeNotification(file: File, title: string, description: string): IResponse
    viewNotification(id: number): IResponse
    fetchAllNotification(): IResponse
}