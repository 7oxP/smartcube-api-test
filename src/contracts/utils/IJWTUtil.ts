export interface IJWTUtil {
    encode(payload: JSON, secretKey: String): String
    decode(token: String, secretKey: String): JSON
}

