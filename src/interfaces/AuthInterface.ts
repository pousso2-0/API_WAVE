import { Request } from "express";

export interface IRequestAuth extends Request {
    user: IJwtPayload; 
}

export interface IJwtPayload {
    userId: string; 
}