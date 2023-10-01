export interface IHashUtil {
    hash(payload: String): String
    compare(hashedPayload: String, payload: String): boolean
}