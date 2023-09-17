import { IUploadedFile } from "../IFile";
import { IResponse } from "./IResponse";

export interface IStorageService {
    uploadFile(file: IUploadedFile): IResponse
    fetchFile(id: number): IResponse
    fetchAllFile(): IResponse
    deleteFile(fileUrl: string): IResponse
}