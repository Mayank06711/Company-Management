class ApiResponse {
    statusCode: number; // HTTP status code of the response
    message: string; // Optional message describing the response
    data: any; // Data returned in the response
    success: boolean; // Indicates whether the request was successful (status code < 400)
    constructor(statusCode:number, data:any, message:string = "Success from server ApiResponse") {
        // Initialize properties of the ApiResponse instance
        this.statusCode = statusCode; // HTTP status code of the response
        this.message = message; // Optional message describing the response (default value provided)
        this.data = data; // Data returned in the response
        this.success = statusCode < 400; // Indicates whether the request was successful (status code < 400)
    }
}

export {
    ApiResponse,
}