import { IResponse } from "@/contracts/IResponse";
import { IStorageService } from "@/contracts/IStorageServices";

class StorageService implements IStorageService {
    uploadFile(file: File): IResponse {
        throw new Error("Method not implemented.");
    }
    fetchFile(id: number): IResponse {
        throw new Error("Method not implemented.");
    }
    fetchAllFile(): Response {
        throw new Error("Method not implemented.");
    }
    deleteFile(fileUrl: string): IResponse {
        throw new Error("Method not implemented.");
    }
}