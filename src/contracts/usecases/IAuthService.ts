import { IResponse } from "./IResponse";

export interface IAuthService {
    login(email: String, password: String): Promise<IResponse>
    signUp(email: String, password: String, cPassword: String, phoneNumber: String): Promise<IResponse>
    resetPasswordRequest(email: String): Promise<IResponse>
    resetPassword(resetToken: String, password: String, cPassword: String): Promise<IResponse>
}