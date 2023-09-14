export interface IResponse {
    status: boolean,
    statusCode: number,
    message: string,
    data: any,
    
    getStatus(): boolean
    getStatusCode(): number
    getMessage(): string
    getData(): any

    setStatus(status: boolean): void
    setStatusCode(statusCode: number): void
    setMessage(message: string): void
    setData(data: any): void
    
}