import { Request, Response } from "express";

export default abstract class Controller {
    async trycatch(callback: CallableFunction, res: Response) {
        try {
            await callback();
        } catch (error) {
            res.status(500).json({ message: "Une erreur interne", error: (error as Error).message, data: null });
        }
    }
    
    async getById<T>(req: Request, res: Response): Promise<T | null> {
        return new Promise(() => null,);
    }
}