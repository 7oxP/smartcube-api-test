// import dotenv  from 'dotenv'
import { IUploadedFile } from './contracts/IFile';
import { StorageService } from './usecases/storage/StorageService'
import fs from 'fs'

// dotenv.config()

const storage = new StorageService()
// storage.deleteFile('gs://smartcube-0101/testFiles.txt')

const fileName = 'nama-file.txt';
const fileType = 'text/plain';

const filePath = process.cwd() + '/src/testFiles.txt';
const buffer = fs.readFileSync(filePath);

const file: IUploadedFile = {
  buffer: buffer,
  originalname: fileName,
  mimetype: fileType, 
};


storage.uploadFile(file)

// console.log(file)
