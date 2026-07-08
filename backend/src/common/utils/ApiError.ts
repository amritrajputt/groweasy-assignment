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
  
}

export default ApiError;
