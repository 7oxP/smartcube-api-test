import { IResponse } from "../usecases/IResponse";


export interface IEdgeServerRepository {

    getMqttConfig(edgeServerId: number): Promise<IResponse>
    
    fetchEdge(userId: number): Promise<IResponse>

    fetchDevice(userId: number, edgeServerId: number): Promise<IResponse>

    storeEdge(
        userId: number,
        name: string,
        vendor: string,
        description: string,
        mqttUser: string,
        mqttPassword: string,
        mqttPubTopic: string,
        mqttSubTopic: string,
    ): Promise<IResponse>

    storeDevice(
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
    ): Promise<IResponse>

    updateDevice(
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
    ): Promise<IResponse>
}