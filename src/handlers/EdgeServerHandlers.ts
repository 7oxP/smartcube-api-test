import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { checkSchema } from 'express-validator'
import { Response } from "../utils/Response"
import { OperationStatus } from '@/constants/operations'
import { AuthGuard } from '@/middleware/AuthGuard'
import { IEdgeServerService } from '@/contracts/usecases/IEdgeServerService'
import { UserRoles } from '@/contracts/middleware/AuthGuard'

export class EdgeServerHandlers {

    private edgeServerService: IEdgeServerService

    constructor(
        edgeServerService: IEdgeServerService
    ) {
        this.edgeServerService = edgeServerService
    }

    async addEdgeServer(req: ExpressRequest, res: ExpressResponse) {

        try {
            //0. validate request
            const result = await checkSchema({
                name: { notEmpty: true, },
                vendor: { notEmpty: true, },
                description: { notEmpty: true, }
            }).run(req);

            for (const validation of result) {
                if (!validation.isEmpty()) {
                    res.status(400)
                    return res.json((new Response())
                        .setStatus(false)
                        .setStatusCode(OperationStatus.fieldValidationError)
                        .setMessage(`${validation.array()[0].msg} on field ${validation.context.fields[0]}`)
                    )
                }
            }

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke service 
            const newEdgeRes = await this.edgeServerService.addEdgeServer(
                authGuard,
                req.body.name,
                req.body.vendor,
                req.body.description,
            )

            if (newEdgeRes.isFailed()) {
                res.status(400)
                return res.json(newEdgeRes)
            }

            return res.json(newEdgeRes).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async addEdgeDevice(req: ExpressRequest, res: ExpressResponse) {
        try {
            //0. validate request
            const result = await checkSchema({
                edge_server_id: { notEmpty: true, },
                vendor_name: { notEmpty: true, },
                vendor_number: { notEmpty: true, },
                type: { notEmpty: true, },
                source_type: { notEmpty: true, },
                dev_source_id: { notEmpty: true, },
                rtsp_source_address: { notEmpty: true, },
                assigned_model_type: { notEmpty: true, },
                assigned_model_index: { notEmpty: true, },
                additional_info: { notEmpty: true, },
            }).run(req);

            for (const validation of result) {
                if (!validation.isEmpty()) {
                    res.status(400)
                    return res.json((new Response())
                        .setStatus(false)
                        .setStatusCode(OperationStatus.fieldValidationError)
                        .setMessage(`${validation.array()[0].msg} on field ${validation.context.fields[0]}`)
                    )
                }
            }

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke service
            const addDeviceResp = await this.edgeServerService.addDevice(
                authGuard,
                req.body.edge_server_id,
                req.body.vendor_name,
                req.body.vendor_number,
                req.body.type,
                req.body.source_type,
                req.body.dev_source_id,
                req.body.rtsp_source_address,
                req.body.assigned_model_type,
                req.body.assigned_model_index,
                req.body.additional_info,
            )

            if (addDeviceResp.isFailed()) {
                res.status(400)
                return res.json(addDeviceResp)
            }

            return res.json(addDeviceResp).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async fetchEdgeServers(req: ExpressRequest, res: ExpressResponse) {
        try {

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke service
            const fetchResp = await this.edgeServerService.fetchEdgeServer(authGuard)

            if (fetchResp.isFailed()) {
                res.status(400)
                return res.json(fetchResp)
            }

            return res.json(fetchResp).status(200)

        } catch (error: any) {
            res.status(400)
            return res.json((new Response())
                .setStatus(false)
                .setStatusCode(OperationStatus.fieldValidationError)
                .setMessage(error)
            )
        }
    }

    async fetchEdgeDevices(req: ExpressRequest, res: ExpressResponse) {
        try {
            //0. validate request
            const result = await checkSchema({
                edge_server_id: { notEmpty: true, isNumeric: true },
            }, ['params']).run(req);

            for (const validation of result) {
                if (!validation.isEmpty()) {
                    res.status(400)
                    return res.json((new Response())
                        .setStatus(false)
                        .setStatusCode(OperationStatus.fieldValidationError)
                        .setMessage(`${validation.array()[0].msg} on param ${validation.context.fields[0]}`)
                    )
                }
            }

            //1. extract jwt
            const userData = (req as any).user

            //2. build authGuard
            const authGuard = new AuthGuard(userData.getData().userId, userData.getData().email, userData.getData().username, UserRoles.Admin, userData.getData().edgeServerId)

            //3. invoke service
            const edgeServerId = parseInt(req.params.edge_server_id)
            const fetchResp = await this.edgeServerService.fetchDevices(authGuard, edgeServerId)

            if (fetchResp.isFailed()) {
                res.status(400)
                return res.json(fetchResp)
            }

            return res.json(fetchResp).status(200)

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