import { IResponse } from "./IResponse";

export interface IStorageService {
    uploadFile(file: File): IResponse
    fetchFile(id: number): IResponse
    fetchAllFile(): Response
    deleteFile(fileUrl: string): IResponse
}