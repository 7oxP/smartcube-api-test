import { IResponse } from "@/contracts/IResponse";

export class Response implements IResponse {

    status: boolean = false;
    statusCode: number = 0;
    message: string = '';
    data: any;

    getStatus(): boolean {
       return this.status
    }

    getStatusCode(): number {
        return this.statusCode
    }

    getMessage(): string {
        return this.message
    }
    
    getData() {
        return this.data
    }

    setStatus(status: boolean): void {
        this.status = status
    }

    setStatusCode(statusCode: number): void {
        this.statusCode = statusCode
    }

    setMessage(message: string): void {
        this.message = message
    }

    setData(data: any): void {
        this.data = data
    }

}