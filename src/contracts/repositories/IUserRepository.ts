import { IResponse } from "../usecases/IResponse";

export interface IUserRepository {
    findByEmail(email: string): Promise<IResponse>
    findByEmailNoPassword(email: string): Promise<IResponse>
    store(username: string, email: string, password: string, code: string): Promise<IResponse>
    findByVerificationCode(email: string, code: string): Promise<IResponse>
    updateVerificationStatus(email: string, status: boolean): Promise<IResponse>
    fetchUserByGroup(userId: number, edgeServerId: number): Promise<IResponse>
    storeResetToken(email: string, resetToken: string): Promise<IResponse>
    updatePassword(password: string, resetToken: string): Promise<IResponse>
}
