import { IUserRepository } from "@/contracts/repositories/IUserRepository";
import { IResponse } from "@/contracts/usecases/IResponse";

class UserRepository implements IUserRepository {
    
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
    
}