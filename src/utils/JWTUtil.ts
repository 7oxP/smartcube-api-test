import { IJWTUtil } from "@/contracts/utils/IJWTUtil"; 

export class JWTUtil implements IJWTUtil {

    encode(payload: JSON, secretKey: String): String {
        throw new Error("Method not implemented.");
    }
    decode(token: String, secretKey: String): JSON {
        throw new Error("Method not implemented.");
    }
}