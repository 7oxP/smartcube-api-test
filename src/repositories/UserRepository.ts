import { UserRoles } from "../contracts/middleware/AuthGuard";
import { IUserRepository } from "@/contracts/repositories/IUserRepository";
import { IResponse } from "@/contracts/usecases/IResponse";
import { Response } from "../utils/Response";
import { OperationStatus } from "../constants/operations";
import UserEntity from "../entities/UserEntity";
import UserGroupEntity from "../entities/UserGroup";
import { Sequelize } from "sequelize";

export class UserRepository implements IUserRepository {

    findByEmail(email: String): Promise<IResponse> {
        throw new Error("Method not implemented.");
    }
    store(email: String, password: String): Promise<IResponse> {
        throw new Error("Method not implemented.");
    }
    findByVerificationCode(email: String, code: String): Promise<IResponse> {
        throw new Error("Method not implemented.");
    }
    updateVerificationStatus(email: String, status: boolean): Promise<IResponse> {
        throw new Error("Method not implemented.");
    }

    async fetchUserByGroup(userId: number, deviceId: number): Promise<IResponse> {
        
        try {
            
            const userGroupData = await UserGroupEntity.findOne({ 
                where: { 
                    user_id: userId, 
                    device_id: deviceId,
                    role_id: UserRoles.Admin
                } 
            })

            const users = await UserEntity.findAll(
                {
                    include: {
                        model: UserGroupEntity,
                        attributes: ['user_id', 'role_id', 'device_id'],
                        where: {
                            device_id: userGroupData?.dataValues.device_id
                        }
                    }
                }
            )

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(users)
            
        } catch (error: any) {
            return new Response()
            .setStatus(false)
            .setStatusCode(OperationStatus.repoError)
            .setMessage(error)
        }
    }
}