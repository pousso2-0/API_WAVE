import { Router } from "express";
import transactionController from "../controllers/transactionController";
import authMiddleware from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";



const transactionRoute:Router = Router();

transactionRoute.get("/all", authMiddleware, roleMiddleware(["admin"]), transactionController.getAll.bind(transactionController));

transactionRoute.get("/user/:id/all", authMiddleware, roleMiddleware(["admin", "client"]), transactionController.getAllByUser.bind(transactionController));

transactionRoute.get("/wallet/:id/all", authMiddleware, transactionController.getAllByWallet.bind(transactionController));


export default transactionRoute;