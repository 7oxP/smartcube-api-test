import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { ICloudMessagingService } from "@/contracts/usecases/ICloudMessagingService";
import { IStorageService } from "@/contracts/usecases/IStorageServices";
import { IResponse } from "@/contracts/usecases/IResponse";
import { Response } from "../../utils/Response";
import { IUploadedFile } from "@/contracts/IFile";
import { OperationStatus } from "../../constants/operations";
import { IAuthGuard } from "@/contracts/middleware/AuthGuard";
import { IUserRepository } from "@/contracts/repositories/IUserRepository";
import UserEntity from "@/entities/UserEntity";

const storeNotification = async function (
    authGuard: IAuthGuard,
    notifRepo: INotificationRepositories,
    userRepo: IUserRepository,
    cloudMessageService: ICloudMessagingService,
    cloudStorageService: IStorageService,
    file: IUploadedFile, 
    title: string, 
    description: string
): Promise<IResponse> {

    const userResponse = await userRepo.findByEmail(authGuard.getUserEmail())
    if(!userResponse.getStatus()) {
        return userResponse
    }

    //1. upload file to cloud storage    
    let uploadResponse = await cloudStorageService.uploadFile(file)
    if(uploadResponse.isFailed()) {
        uploadResponse.setStatusCode(OperationStatus.cloudStorageError)
        return uploadResponse
    }

    //2. save data to repo
    let storeResponse = await notifRepo.storeNotification(authGuard.getUserId(), title, description, uploadResponse.getData().fileUrl)
    if(storeResponse.isFailed()) {
        storeResponse.setStatusCode(OperationStatus.repoError)
        return storeResponse
    }
    
    //3. Fetch User Group to get the fcm registration token
    const usersGroup = await userRepo.fetchUserByGroup(authGuard.getUserId(), 1000)
    const fcmRegistrationTokens = usersGroup.getData()?.map((user: UserEntity) => user.dataValues.fcm_registration_token)

    //4. broadcast notification to registered devices
    cloudMessageService.sendNotification(fcmRegistrationTokens, title, description, uploadResponse.getData().fileUrl)

    return new Response()
        .setStatus(true)
        .setStatusCode(1)
        .setMessage("ok")
        .setData(storeResponse.getData())
}

export { storeNotification };
