import { IResponse } from "../usecases/IResponse"

export interface IHashUtil {
    hash(payload: string): Promise<IResponse>
    compare(hashedPayload: string, payload: string): Promise<IResponse>
}
