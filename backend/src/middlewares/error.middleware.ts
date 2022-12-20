class HttpException extends Error {
  public status: number;
  public message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status || 500;
    this.message = message || "An Unknown error occurred";
  }

  UnAuthorizedError(status: number = 401, message: string) {
    return { status: status, message: message || "Unauthorized" };
  }
}

export { HttpException };
