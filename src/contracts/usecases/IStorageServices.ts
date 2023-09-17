import { IUploadedFile } from "../IFile";
import { IResponse } from "./IResponse";

export interface IStorageService {
    uploadFile(file: IUploadedFile): IResponse
    deleteFile(fileUrl: string): IResponse
}
