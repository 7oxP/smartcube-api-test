import { IResponse } from "./IResponse";
import { File } from "buffer";

export interface IStorageService {
    uploadFile(file: File): IResponse
    fetchFile(id: number): IResponse
    fetchAllFile(): Response
    deleteFile(fileUrl: string): IResponse
}