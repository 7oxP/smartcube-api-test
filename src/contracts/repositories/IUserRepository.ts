import { IResponse } from "../usecases/IResponse";

export interface IUserRepository {
    findByEmail(email: String): Promise<IResponse>
    store(email: String, password: String): Promise<IResponse>
    findByVerificationCode(email: String, code: String): Promise<IResponse>
    updateVerificationStatus(email: String, status: boolean): Promise<IResponse>
}