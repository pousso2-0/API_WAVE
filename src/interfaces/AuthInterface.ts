import { Request } from "express";

export interface IRequestAuth extends Request {
    user: IJwtPayload; 
}

export interface IJwtPayload {
    userId: string; 
    role: string;
}

export interface HashServiceInterface {
    hash(password: string): Promise<string>;
    compare(password: string, hashedPassword: string): Promise<boolean>;
}
