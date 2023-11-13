import { OperationStatus } from "../constants/operations"
import { UserRoles } from "../contracts/middleware/AuthGuard";
import { IEdgeServerRepository } from "@/contracts/repositories/IEdgeServerRepository";
import { IResponse } from "@/contracts/usecases/IResponse";
import EdgeServerEntity from "../entities/EdgeServer";
import UserGroupEntity from "../entities/UserGroup";
import { Response } from "../utils/Response";
import DeviceEntity from "../entities/DeviceEntity";
import { Op } from "sequelize";
import { db } from "../entities/BaseEntity";


class EdgeServerRepository implements IEdgeServerRepository {

    async getMqttConfig(edgeServerId: number): Promise<IResponse> {
        try {
            const data = await EdgeServerEntity.findOne({
                where: { id: edgeServerId },
                attributes: ['id', 'mqtt_sub_topic', 'mqtt_pub_topic']
            })

            if (data == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("model not found!")
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(data?.dataValues)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async fetchEdge(userId: number): Promise<IResponse> {
        try {
            const res = await EdgeServerEntity.findAll(
                {
                    attributes: ["id", "name", "vendor"],
                    where: {
                        "$user_groups.user_id$": { [Op.eq]: userId }
                    },
                    include: {
                        model: UserGroupEntity,
                        required: true,
                        as: "user_groups",
                        attributes: []
                    }
                }
            )

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(res)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async fetchDevice(userId: number, edgeServerId: number): Promise<IResponse> {
        try {
            const res = await EdgeServerEntity.findAll(
                {
                    where: {
                        id: edgeServerId,
                    },
                    include: [
                        {
                            model: DeviceEntity,
                            as: "devices",
                            // required: true,
                        },
                        {
                            model: UserGroupEntity,
                            where: {
                                user_id: userId
                            },
                            required: true,
                            as: "user_groups",
                            attributes: []
                        }
                    ],
                }
            )

            res.map((val, i, data) => {
                return data[i] = val.dataValues
            })

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(res)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }

    }

    async storeEdge(
        userId: number,
        name: string,
        vendor: string,
        description: string,
        mqttUser: string,
        mqttPassword: string,
        mqttPubTopic: string,
        mqttSubTopic: string): Promise<IResponse> {

        try {
            const edgeServer = await EdgeServerEntity.create({
                name: name,
                vendor: vendor,
                description: description,
                mqtt_user: mqttUser,
                mqtt_password: mqttPassword,
                mqtt_pub_topic: mqttPubTopic,
                mqtt_sub_topic: mqttSubTopic,
            })

            const userGroup = await UserGroupEntity.create({
                user_id: userId,
                edge_server_id: edgeServer.getDataValue('id'),
                role_id: UserRoles.Admin
            })

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(edgeServer.dataValues)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async storeDevice(
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
            const deviceRes = await DeviceEntity.create({
                vendor_name: vendorName,
                vendor_number: vendorNumber,
                type: type,
                source_type: sourceType,
                dev_source_id: devSourceId,
                rtsp_source_address: rtspSourceAddress,
                assigned_model_type: assignedModelType,
                assigned_model_index: assignedModelIndex,
                additional_info: additionalInfo,
            })

            db.getConnection().query(`INSERT INTO devices_edge_servers (edge_server_id, device_id) VALUES (${edgeServerId}, ${deviceRes.getDataValue('id')})`)

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(deviceRes.dataValues)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }
}

export { EdgeServerRepository }