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

        try {
            //0. validate request
            const result = await checkSchema({
                // image: { notEmpty: true,  },
                title: { notEmpty: true, },
                description: { notEmpty: true, }
            }).run(req);

            for (const validation of result) {
                if (!validation.isEmpty()) {
                    return res.json((new Response())
                        .setStatus(false)
                        .setStatusCode(OperationStatus.fieldValidationError)
                        .setMessage(`${validation.array()[0].msg} on field ${validation.context.fields[0]}`)
                    )
                }
            }

            //temporary validate image files
            if (req.files == null && req.files == undefined) {
                return res.json((new Response())
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(`invalid on field image`)
                )
            }

            const file = req.files!.image as UploadedFile

            if (!(['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype))) {
                return res.json((new Response())
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(`invalid on field image`)
                )
            }

            //1. extract jwt
            const userData = (req as any).user


            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getEdgeServerId)

            //3. parsing file multipart/form-data

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

            if (notifResponse.isFailed()) {
                return res.json(notifResponse).status(400)
            }

            return res.json(notifResponse).status(200)

        } catch (error: any) {
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }


    }

    async fetchAllNotificationHandler(req: ExpressRequest, res: ExpressResponse) {

        try {
            //1. extract jwt
            const userData = (req as any).user
            // console.log('user data:',userData.getData().userId)
            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getEdgeServerId)
            console.log(authGuard)
            const fetchResponse = await this.notificationService.fetchAllNotification(authGuard)
            
            //3. execute
            if (fetchResponse.isFailed()) {
                return res.json(fetchResponse).status(400)
            }
    
            return res.json(fetchResponse).status(200)
        } catch (error:any) {
            console.log(error)
            return res.json({error: error})
        }


    }

    async viewNotificationHandler(req: ExpressRequest, res: ExpressResponse) {

        //0. validate request
        const result = await checkSchema({
            id: { notEmpty: true, isNumeric: true },
        }, ['params']).run(req);

        for (const validation of result) {
            if (!validation.isEmpty()) {
                return res.json((new Response())
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(`${validation.array()[0].msg} on param ${validation.context.fields[0]}`)
                )
            }
        }

        const notifId = parseInt(req.params.id)

        //1. extract jwt
        const userData = (req as any).user

        //2. build authGuard
        const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getEdgeServerId)

        //3. execute
        const viewResponse = await this.notificationService.viewNotification(authGuard, notifId)

        if (viewResponse.isFailed()) {
            return res.json(viewResponse).status(400)
        }

        return res.json(viewResponse).status(200)
    }

    async deleteNotificationHandler(req: ExpressRequest, res: ExpressResponse) {

        //0. validate request
        const result = await checkSchema({
            id: { notEmpty: true, isNumeric: true },
        }, ['params']).run(req);

        for (const validation of result) {
            if (!validation.isEmpty()) {
                return res.json((new Response())
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(`${validation.array()[0].msg} on param ${validation.context.fields[0]}`)
                )
            }
        }

        const notifId = parseInt(req.params.id)

        //1. extract jwt
        const userData = (req as any).user

        //2. build authGuard
        const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getEdgeServerId)

        //3. execute
        const deleteResponse = await this.notificationService.deleteNotification(authGuard, notifId)

        if (deleteResponse.isFailed()) {
            return res.json(deleteResponse).status(400)
        }

        return res.json(deleteResponse).status(200)
    }
}

export { NotificationHandlers }
