import { OperationStatus } from "../../constants/operations";
import { IAuthGuard } from "@/contracts/middleware/AuthGuard";
import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IResponse } from "@/contracts/usecases/IResponse";
import { Response } from "../../utils/Response";

const viewNotification = async function(
    authGuard: IAuthGuard, 
    notifRepo: INotificationRepositories, 
    notificationId: number): Promise<IResponse> {

    const notifData = await notifRepo.find(notificationId)

    if(notifData.getData().user_id != authGuard.getUserId()) {
        return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.unauthorizedAccess)
        .setMessage("unauthorized")
        .setData({})
    }

    return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData(notifData)
}

export { viewNotification };