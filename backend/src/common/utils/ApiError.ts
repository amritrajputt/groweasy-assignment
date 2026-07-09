class ApiError extends Error {
  public success: boolean = false;

  constructor(
    public statusCode: number,
    public message: string = "Something went wrong",
    public errors: any[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string = "Bad Request", errors: any[] = []) {
    return new ApiError(400, message, errors);
  }

  static notFound(message: string = "Not Found") {
    return new ApiError(404, message);
  }

  static internalServer(message: string = "Internal Server Error") {
    return new ApiError(500, message);
  }
}

export default ApiError;
