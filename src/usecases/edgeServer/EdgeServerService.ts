import { OperationStatus } from "../../constants/operations"
import { IAuthGuard, UserRoles } from '../../contracts/middleware/AuthGuard';
import { IEdgeServerRepository } from '@/contracts/repositories/IEdgeServerRepository';
import { IEdgeServerService } from '@/contracts/usecases/IEdgeServerService'
import { IResponse } from '../../contracts/usecases/IResponse';
import { IJWTUtil } from '@/contracts/utils/IJWTUtil';
import { Response } from '../../utils/Response';
import { generateRandomString } from '../../utils/String';
import { IMQTTService } from "@/contracts/usecases/IMQTTService";
import DeviceEntity from "@/entities/DeviceEntity";

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

        const edgeAccessTokenRes = await this.jwtUtil.encode(edgeAccessTokenPayload, process.env.JWT_SECRET_KEY!, "168h")
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
            if (!this.deviceType.includes(type)) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.addDeviceError)
                    .setMessage("invalid device type")
            }

            if (!this.deviceSourceType.includes(sourceType)) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.addDeviceError)
                    .setMessage("invalid device source type")
            }

            //3. fetch mqtt pub-sub topic from edge server config
            const mqttConfigRes = await this.edgeServerRepo.getMqttConfig(edgeServerId)
            if (mqttConfigRes.isFailed()) return mqttConfigRes

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

            //4. sync config to the edge server
            const syncConfigRes = await this.mqttService.publish(
                mqttConfigRes.getData().mqtt_pub_topic,
                `/syncEdgeConfig`
            )
            if (syncConfigRes.isFailed()) return syncConfigRes

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

    async fetchDevicesConfig(authGuard: IAuthGuard): Promise<IResponse> {
        try {
            if (authGuard.getEdgeServerId() == 0 || authGuard.getEdgeServerId() == undefined) {
                return new Response()
                    .setMessage("it seems you're trying to fetch devices config using user token")
                    .setStatusCode(OperationStatus.invalidEdgeToken)
                    .setStatus(false)
            }

            const devicesResp = await this.edgeServerRepo.fetchDevice(
                authGuard.getUserId(),
                authGuard.getEdgeServerId()
            )

            if (devicesResp.isFailed()) return devicesResp

            const devices: DeviceEntity[] = (devicesResp.getData() != null ? devicesResp.getData().devices : [])

            const devicesConfig: {
                type: any;
                usb_id: any;
                rtsp_address: any;
                source_type: any;
                assigned_model_type: string;
                assigned_model_index: any;
                additional_info: any;
            }[] = []

            devices.forEach((device) => {
                devicesConfig.push({
                    type: device.getDataValue('type'),
                    usb_id: device.getDataValue('dev_source_id'),
                    rtsp_address: device.getDataValue('rtsp_source_address'),
                    source_type: device.getDataValue('source_type'),
                    assigned_model_type: this.modelType[device.getDataValue('assigned_model_type')],
                    assigned_model_index: device.getDataValue('assigned_model_index'),
                    additional_info: device.getDataValue('additional_info')
                })
            })

            return devicesResp
                .setData(devicesConfig)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.generateEdgeDeviceConfigError)
                .setMessage(`generate edge devices config error ${error}`)
        }

    }

    async updateDeviceConfig(
        authGuard: IAuthGuard,
        edgeServerId: number,
        deviceId: number,
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
            if (!this.deviceType.includes(type)) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.updateDeviceError)
                    .setMessage("invalid device type")
            }

            if (!this.deviceSourceType.includes(sourceType)) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.updateDeviceError)
                    .setMessage("invalid device source type")
            }
            
            //3. fetch mqtt pub-sub topic from edge server config
            const mqttConfigRes = await this.edgeServerRepo.getMqttConfig(edgeServerId)
            if (mqttConfigRes.isFailed()) return mqttConfigRes

            //2. save input
            const storeRes = await this.edgeServerRepo.updateDevice(
                deviceId,
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

            //4. sync config to the edge server
            const syncConfigRes = await this.mqttService.publish(
                mqttConfigRes.getData().mqtt_sub_topic,
                `/syncEdgeConfig`
            )
            if (syncConfigRes.isFailed()) return syncConfigRes

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(storeRes.getData())
                
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.updateDeviceError)
                .setMessage(error)
        }
    }

    async restartDevice(authGuard: IAuthGuard, processIndex: number, edgeServerId: number): Promise<IResponse> {

        try {
            const mqttConfigRes = await this.edgeServerRepo.getMqttConfig(edgeServerId)
            if (mqttConfigRes.isFailed()) return mqttConfigRes

            const restartRes = await this.mqttService.publish(
                mqttConfigRes.getData().mqtt_pub_topic,
                `/restartDevice ${processIndex}`
            )

            return restartRes
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.deviceRestartError)
                .setMessage(`error restarting device ${error}`)
        }

    }

    async startDevice(authGuard: IAuthGuard, processIndex: number, edgeServerId: number): Promise<IResponse> {

        try {
            const mqttConfigRes = await this.edgeServerRepo.getMqttConfig(edgeServerId)
            if (mqttConfigRes.isFailed()) return mqttConfigRes

            const restartRes = await this.mqttService.publish(
                mqttConfigRes.getData().mqtt_pub_topic,
                `/startDevice ${processIndex}`
            )

            return restartRes
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.deviceRestartError)
                .setMessage(`error starting device: ${error}`)
        }
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