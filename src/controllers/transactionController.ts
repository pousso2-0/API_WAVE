import { Request, Response } from "express"
import Controller from "./controller"


export default new class transactionController extends Controller {


    getAll(req: Request, res: Response) {
        return this.trycatch(async ()=>{


        }, res)
    }
}
