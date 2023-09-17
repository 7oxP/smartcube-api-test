import { IResponse } from "@/contracts/usecases/IResponse";
import { IStorageService } from "@/contracts/usecases/IStorageServices";
import { Response } from "../../utils/Response";
import { IUploadedFile } from "@/contracts/IFile";

export class StorageService implements IStorageService {
    
    uploadFile(file: IUploadedFile): IResponse {
        return new Response()
        .setStatus(true)
        .setStatusCode(1)
        .setMessage("ok")
        .setData({fileUrl: "https://google.apis/image1.jpg"}) //dummy url
    }

    fetchFile(id: number): IResponse {
        throw new Error("Method not implemented.");
    }

    fetchAllFile(): IResponse {
        throw new Error("Method not implemented.");
    }

    deleteFile(fileUrl: string): IResponse {
        throw new Error("Method not implemented.");
    }
}