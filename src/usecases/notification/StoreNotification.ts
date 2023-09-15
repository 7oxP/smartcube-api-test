import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IResponse } from "@/contracts/usecases/IResponse";
import { Response } from "@/utils/Response";

const storeNotification = function(notifRepo: INotificationRepositories): IResponse {
    
    return new Response()
        .setStatus(true)
        .setStatusCode(1)
        .setMessage("ok")
        .setData({})
}

export { storeNotification };