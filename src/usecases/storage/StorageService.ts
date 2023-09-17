import { IResponse } from "@/contracts/usecases/IResponse";
import { IStorageService } from "@/contracts/usecases/IStorageServices";
import { Response } from "../../utils/Response";
import { IUploadedFile } from "@/contracts/IFile";
import { Storage } from "@google-cloud/storage";

export class StorageService implements IStorageService {
  uploadFile(file: IUploadedFile): IResponse {

    const path = require("path");
    const keyFilename = "src/studied-union-399214-f9386348b285.json";
    const bucketName = "smartcube-0101";
    const filePath = "src/testFiles.txt";
    const destFileName = path.basename(filePath);

    const storage = new Storage({ keyFilename });

    async function uploadingFile() {
      const options = {
        destination: destFileName,
      };

      await storage.bucket(bucketName).upload(filePath, options);

      console.log(`${destFileName} uploaded to ${bucketName}`);
    }

    uploadingFile().catch(console.error);

    return new Response()
      .setStatus(true)
      .setStatusCode(1)
      .setMessage("ok")
      .setData({ fileName: destFileName, bucketName: bucketName });
  }

  deleteFile(fileUrl: string): IResponse {
    const { Storage } = require("@google-cloud/storage");

    const bucketData = fileUrl.split("/");

    const bucketName = bucketData[2];
    const fileName = bucketData[3];
    const keyFilename = "src/studied-union-399214-f9386348b285.json";

    const storage = new Storage({ keyFilename });

    async function deleteFile() {
      await storage.bucket(bucketName).file(fileName).delete();

      console.log(`${fileUrl} deleted`);
    }

    deleteFile().catch(console.error);

    return new Response()
      .setStatus(true)
      .setStatusCode(1)
      .setMessage("ok")
      .setData({ fileName: fileName, bucketName: bucketName });
  }
}
