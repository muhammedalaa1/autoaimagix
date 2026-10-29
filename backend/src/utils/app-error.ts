/**
 * An expected, client-facing error. Anything thrown that is NOT an AppError
 * is treated as a bug and reported as a generic 500 without internal details.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Authentication required") {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have permission to perform this action") {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Resource not found") {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message: string) {
    return new AppError(409, "CONFLICT", message);
  }

  static badGateway(message = "Upstream service failed") {
    return new AppError(502, "BAD_GATEWAY", message);
  }

  static gatewayTimeout(message = "Upstream service timed out") {
    return new AppError(504, "GATEWAY_TIMEOUT", message);
  }
}
