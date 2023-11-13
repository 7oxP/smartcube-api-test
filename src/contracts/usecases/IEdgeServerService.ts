import "@/utils/Response"
import { IResponse } from "./IResponse"
import { IAuthGuard } from "../middleware/AuthGuard"

export interface IEdgeServerService {
    addEdgeServer(
        authGuard: IAuthGuard,
        name: string,
        vendor: string,
        description: string,
    ): Promise<IResponse>

    addDevice(
        authGuard: IAuthGuard,
        edgeServerID: number,
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
    
    fetchEdgeServer(
        authGuard: IAuthGuard,
    ): Promise<IResponse>
    fetchDevices(authGuard: IAuthGuard, edgeServerId: number): Promise<IResponse>
    updateDeviceConfig(): Promise<IResponse>
    restartDevice(processIndex: number): Promise<IResponse>
    generateEdgeServerConfig(authGuard: IAuthGuard): IResponse
}