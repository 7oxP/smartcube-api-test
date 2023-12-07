import { IUserService } from "@/contracts/usecases/IUserService"
import { AuthGuard } from "../middleware/AuthGuard"
import { UserRoles } from "../contracts/middleware/AuthGuard"
import { IUploadedFile } from "@/contracts/IFile"
import { Request as ExpressRequest, Response as ExpressResponse } from "express"
import { UploadedFile } from "express-fileupload"
import { checkSchema } from "express-validator"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"

class UserHandlers {
    private userService: IUserService

    constructor(userService: IUserService) {
        this.userService = userService
    }

    async getUserProfile(req: ExpressRequest, res: ExpressResponse) {
        try {
            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(
                userData.getData().userId,
                userData.getData().email,
                userData.getData().username,
                UserRoles.Admin,
                userData.getData().edgeServerId
            )

            const fetchResponse = await this.userService.getUserProfile(authGuard)

            //3. execute
            if (fetchResponse.isFailed()) {
                res.status(400)
                return res.json(fetchResponse)
            }

            return res.json(fetchResponse).status(200)
        } catch (error: any) {
            res.status(400)
            return res.json({ error: error })
        }
    }

    async updateUserProfile(req: ExpressRequest, res: ExpressResponse) {
        try {
            //temporary validate image files
            if (req.files == null && req.files == undefined) {
                res.status(400)
                return res.json((new Response())
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(`invalid on field image`)
                )
            }

            const file = req.files!.avatar as UploadedFile

            if (!(['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype))) {
                console.log("error image png")
                res.status(400)
                return res.json((new Response())
                    .setStatus(false)
                    .setStatusCode(OperationStatus.fieldValidationError)
                    .setMessage(`invalid on field image`)
                )
            }

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. parsing file multipart/form-data

            const uploadedFile: IUploadedFile = {
                buffer: file.data,
                originalname: file.name,
                mimetype: file.mimetype
            }

            //4. execute
            const updateResponse = await this.userService.updateUserProfile(
                authGuard,
                uploadedFile)

            if (updateResponse.isFailed()) {
                res.status(400)
                return res.json(updateResponse)
            }

            return res.json(updateResponse).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }
}

export { UserHandlers }
