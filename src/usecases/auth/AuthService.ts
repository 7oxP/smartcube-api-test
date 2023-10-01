import { IAuthService } from "@/contracts/usecases/IAuthService";
import { IResponse } from "@/contracts/usecases/IResponse";

export class AuthService implements IAuthService {

    login(email: String, password: String): Promise<IResponse> {
        throw new Error("Method not implemented.");
    }
    signUp(email: String, password: String, cPassword: String, phoneNumber: String): Promise<IResponse> {
        throw new Error("Method not implemented.");
    }
    resetPasswordRequest(email: String): Promise<IResponse> {
        throw new Error("Method not implemented.");
    }
    resetPassword(resetToken: String, password: String, cPassword: String): Promise<IResponse> {
        throw new Error("Method not implemented.");
    }
    
}