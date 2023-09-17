import { OperationStatus } from "../../constants/operations";
import { IAuthGuard } from "@/contracts/middleware/AuthGuard";
import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IResponse } from "@/contracts/usecases/IResponse";

const deleteNotification = async function (
    authGuard: IAuthGuard,
    notifRepo: INotificationRepositories,
    notificationId: number
): Promise<IResponse> {

    //1. fetch data
    const notifResponse = await notifRepo.find(notificationId)
    if(notifResponse.isFailed()) {
        return notifResponse
    }

    //2. check ownership
    if(notifResponse.getData().user_id != authGuard.getUserId()) {
        return notifResponse
            .setStatus(false)
            .setStatusCode(OperationStatus.unauthorizedAccess)
            .setMessage("unauthorized")
            .setData({})
    }
    
    //3. delete if user owns it
    return await notifRepo.delete(notificationId)
}

export { deleteNotification };