class ApiResponse {

    constructor(
        public statusCode: number,
        public data: any,
        public message: string = "Success",
        public success: boolean = true
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = success;
    }

    static success(data: any, message: string = "Success") {
        return new ApiResponse(200, data, message);
    }

    static accepted(data: any, message: string = "Accepted") {
        return new ApiResponse(202, data, message);
    }

    static notFound(data: any, message: string = "Not Found") {
        return new ApiResponse(404, data, message, false);
    }



}
export default ApiResponse;