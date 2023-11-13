import { OperationStatus } from "../../constants/operations"
import { IAuthGuard, UserRoles } from '../../contracts/middleware/AuthGuard';
import { IEdgeServerRepository } from '@/contracts/repositories/IEdgeServerRepository';
import { IEdgeServerService } from '@/contracts/usecases/IEdgeServerService'
import { IResponse } from '../../contracts/usecases/IResponse';
import { IJWTUtil } from '@/contracts/utils/IJWTUtil';
import { Response } from '../../utils/Response';
import { generateRandomString } from '../../utils/String';
import { IMQTTService } from "@/contracts/usecases/IMQTTService";

class EdgeServerService implements IEdgeServerService {

    private modelType = ["objectDetection",]
    private deviceType = ['camera']
    private deviceSourceType = ['usb', 'rtsp']

    private jwtUtil: IJWTUtil;
    private edgeServerRepo: IEdgeServerRepository
    private mqttService: IMQTTService

    constructor(
        jwtUtil: IJWTUtil,
        edgeServerRepo: IEdgeServerRepository,
        mqttService: IMQTTService) {
        this.jwtUtil = jwtUtil
        this.edgeServerRepo = edgeServerRepo
        this.mqttService = mqttService
    }

    async addEdgeServer(
        authGuard: IAuthGuard,
        name: string,
        vendor: string,
        description: string
    ): Promise<IResponse> {

        //1. validate
        // if(authGuard.getUserRole() != UserRoles.Admin) 
        //     return new Response()
        //         .setStatus(false)
        //         .setStatusCode(OperationStatus.unauthorizedAccess)
        //         .setMessage("unauthorized")

        //2. Generate MQTT Config
        const mqttConfig = this.generateEdgeServerConfig(authGuard).getData()

        //3. Store Config
        const res = await this.edgeServerRepo.storeEdge(
            authGuard.getUserId(),
            name,
            vendor,
            description,
            mqttConfig.mqttUser,
            mqttConfig.mqttPassword,
            mqttConfig.mqttPubTopic,
            mqttConfig.mqttSubTopic)

        if (res.isFailed()) return res

        //4. Generate Edge Server Access Token
        const edgeAccessTokenPayload = {
            userId: authGuard.getUserId(),
            email: authGuard.getUserEmail(),
            username: authGuard.getUsername(),
            edgeServerId: res.getData().id
        }

        const edgeAccessTokenRes = await this.jwtUtil.encode(edgeAccessTokenPayload, process.env.JWT_SECRET_KEY!, "0")
        if (edgeAccessTokenRes.isFailed()) return edgeAccessTokenRes

        return new Response()
            .setStatus(true)
            .setStatusCode(OperationStatus.success)
            .setMessage("ok")
            .setData({
                mqtt_user: mqttConfig.mqttUser,
                mqtt_password: mqttConfig.mqttPassword,
                mqtt_pub_topic: mqttConfig.mqttPubTopic,
                mqtt_sub_topic: mqttConfig.mqttSubTopic,
                egde_server_access_token: edgeAccessTokenRes.getData()
            })
    }

    async addDevice(
        authGuard: IAuthGuard,
        edgeServerId: number,
        vendorName: string,
        vendorNumber: string,
        type: string,
        sourceType: string,
        devSourceId: string,
        rtspSourceAddress: string,
        assignedModelType: number,
        assignedModelIndex: number,
        additionalInfo: any
    ): Promise<IResponse> {
        try {
            //1. validate input

            //2. create json config representation of device
            const deviceConfig = {
                type: type,
                usb_id: devSourceId,
                rtsp_address: rtspSourceAddress,
                source_type: sourceType,
                assigned_model_type: this.modelType[assignedModelType],
                assigned_model_index: assignedModelIndex,
                additional_info: additionalInfo
            }

            //3. fetch mqtt pub-sub topic from edge server config
            const mqttConfigRes = await this.edgeServerRepo.getMqttConfig(edgeServerId)
            if (mqttConfigRes.isFailed()) return mqttConfigRes

            //4. sync config to the edge server
            const syncConfigRes = await this.mqttService.publish(
                mqttConfigRes.getData().mqtt_sub_topic,
                deviceConfig
            )
            if (syncConfigRes.isFailed()) return syncConfigRes

            //5. send restart device instruction
            // const restartRes = await this.mqttService.publish(
            //     mqttConfigRes.getData().mqtt_sub_topic,
            //     "/restartDevice 1"
            // )
            // if (restartRes.isFailed()) return restartRes

            //6. save input
            const storeRes = await this.edgeServerRepo.storeDevice(
                edgeServerId,
                vendorName,
                vendorNumber,
                type,
                sourceType,
                devSourceId,
                rtspSourceAddress,
                assignedModelType,
                assignedModelIndex,
                additionalInfo
            )
            if (storeRes.isFailed()) return storeRes

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(storeRes.getData())

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.addDeviceError)
                .setMessage(error)
        }
    }

    async fetchEdgeServer(authGuard: IAuthGuard): Promise<IResponse> {
        return await this.edgeServerRepo.fetchEdge(authGuard.getUserId())
    }

    async fetchDevices(authGuard: IAuthGuard, edgeServerId: number): Promise<IResponse> {
        return await this.edgeServerRepo.fetchDevice(authGuard.getUserId(), edgeServerId)
    }

    updateDeviceConfig(): Promise<IResponse> {
        throw new Error('Method not implemented.');
    }

    restartDevice(processIndex: number): Promise<IResponse> {
        throw new Error('Method not implemented.');
    }

    generateEdgeServerConfig(authGuard: IAuthGuard): IResponse {
        return new Response()
            .setData({
                mqttUser: generateRandomString(6) + "-" + authGuard.getUserEmail(),
                mqttPassword: generateRandomString(12),
                mqttPubTopic: "pub-" + generateRandomString(6),
                mqttSubTopic: "sub-" + generateRandomString(6)
            })
    }
}

export { EdgeServerService }