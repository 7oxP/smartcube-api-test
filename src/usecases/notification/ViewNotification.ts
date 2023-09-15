import { INotificationRepositories } from "@/contracts/repositories/INotificationRepositories";
import { IResponse } from "@/contracts/usecases/IResponse";
import { Response } from "@/utils/Response";

const viewNotification = function(notifRepo: INotificationRepositories): IResponse {
    
    let x = 10 + 5

    return new Response()
        .setStatus(true)
        .setStatusCode(1)
        .setMessage("ok")
        .setData(x)
}

export { viewNotification };