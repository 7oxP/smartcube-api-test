import { IResponse } from "@/contracts/usecases/IResponse";

export class Response implements IResponse {

    private status: boolean = false;
    private statusCode: number = 0;
    private message: string = '';
    private data: any;

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

    setStatus(status: boolean): IResponse {
        this.status = status
        return this
    }

    setStatusCode(statusCode: number): IResponse {
        this.statusCode = statusCode
        return this
    }

    setMessage(message: string): IResponse {
        this.message = message
        return this
    }

    setData(data: any): IResponse {
        this.data = data
        return this 
    }  

}