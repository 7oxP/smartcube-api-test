import { IResponse } from "../usecases/IResponse";

export interface IUserRepository {
    findByEmail(email: string): Promise<IResponse>
    store(username: string, email: string, password: string, is_verified: boolean): Promise<IResponse>
    findByVerificationCode(email: string, code: string): Promise<IResponse>
    updateVerificationStatus(email: string, status: boolean): Promise<IResponse>
}
