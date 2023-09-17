// import dotenv  from 'dotenv'
import { IUploadedFile } from './contracts/IFile';
import { StorageService } from './usecases/storage/StorageService'
// dotenv.config()

const storage = new StorageService()
storage.deleteFile('gs://smartcube-0101/testFiles.txt')

const fileData = 'Ini adalah data file yang ingin Anda simpan dalam buffer.';
const fileName = 'nama-file.txt';
const fileType = 'text/plain';


const file: IUploadedFile = {
  buffer: Buffer.from(fileData),
  originalname: fileName,
  mimetype: fileType, 
};

storage.uploadFile(file)

console.log(file)
