export class BaseException extends Error {
    constructor(
      public message: string,
      public statusCode: number,
      public errors?: any[]
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class BadRequestException extends BaseException {
    constructor(message = 'Bad Request', errors?: any[]) {
      super(message, 400, errors);
    }
  }
  
  export class UnauthorizedException extends BaseException {
    constructor(message = 'Unauthorized', errors?: any[]) {
      super(message, 401, errors);
    }
  }
  
  export class ForbiddenException extends BaseException {
    constructor(message = 'Forbidden', errors?: any[]) {
      super(message, 403, errors);
    }
  }
  
  export class NotFoundException extends BaseException {
    constructor(message = 'Not Found', errors?: any[]) {
      super(message, 404, errors);
    }
  }
  
  export class ConflictException extends BaseException {
    constructor(message = 'Conflict', errors?: any[]) {
      super(message, 409, errors);
    }
  }
  
  export class InternalServerErrorException extends BaseException {
    constructor(message = 'Internal Server Error', errors?: any[]) {
      super(message, 500, errors);
    }
  }