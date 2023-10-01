import { IResponse } from "./IResponse";

export interface IEmailService {
    sendEmail(title: String, subject: String, body: String): Promise<IResponse>
}