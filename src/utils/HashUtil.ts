import { IHashUtil } from "@/contracts/utils/IHashUtil";

class HashUtil implements IHashUtil {
    hash(payload: String): String {
        throw new Error("Method not implemented.");
    }
    compare(hashedPayload: String, payload: String): boolean {
        throw new Error("Method not implemented.");
    }
}