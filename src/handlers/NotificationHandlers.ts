import { INotificationService } from "@/contracts/usecases/INotificationService"
import { AuthGuard } from "../middleware/AuthGuard"
import { UserRoles } from '../contracts/middleware/AuthGuard'
import { IUploadedFile } from "@/contracts/IFile"
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { UploadedFile } from "express-fileupload"
import { checkSchema } from "express-validator"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"

class NotificationHandlers {

    private notificationService: INotificationService;

    constructor(notificationService: INotificationService) {
        this.notificationService = notificationService
    }

    async storeNotificationHandler(req: ExpressRequest, res: ExpressResponse) {

        //0. validate request
        const result = await checkSchema({
            // image: { notEmpty: true,  },
            title: { notEmpty: true, },
            description: { notEmpty: true, }
        }).run(req);

        for(const validation of result) {
            if(!validation.isEmpty()) {
                return res.json((new Response())
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(`${validation.array()[0].msg} on field ${validation.context.fields[0]}`)
                )
            }
        }

        //1. extract jwt
    
        //2. build authGuard
        const authGuard = new AuthGuard(1, "ppi-dev@gmail.com", "ppi dev", UserRoles.Admin)
    
        //3. parsing file multipart/form-data
        const file = req.files!.image as UploadedFile

        const uploadedFile: IUploadedFile = {
            buffer: file.data,
            originalname: file.name,
            mimetype: file.mimetype
        }
            
        //4. execute
        const notifResponse = await this.notificationService.storeNotification(
            authGuard, 
            uploadedFile, 
            req.body.title, 
            req.body.description)

        if(notifResponse.isFailed()) {
            return res.json(notifResponse).status(400)
        }

        return res.json(notifResponse).status(200)
    
    }
}

export { NotificationHandlers }
