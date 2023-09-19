import { OperationStatus } from "../../constants/operations";
import { IAuthGuard } from "@/contracts/middleware/AuthGuard";
import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IResponse } from "@/contracts/usecases/IResponse";
import { Response } from "../../utils/Response";

const viewNotification = async function(
    authGuard: IAuthGuard, 
    notifRepo: INotificationRepositories, 
    notificationId: number): Promise<IResponse> {

    const notifResponse = await notifRepo.find(notificationId)

    if(notifResponse.isFailed()) return notifResponse

    if(notifResponse.getData().user_id != authGuard.getUserId()) {
        return notifResponse
        .setStatus(false)
        .setStatusCode(OperationStatus.unauthorizedAccess)
        .setMessage("unauthorized")
        .setData({})
    }

    return notifResponse
}

export { viewNotification };