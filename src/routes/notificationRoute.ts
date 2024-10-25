import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import notificationController from "../controllers/notificationController";

const notificationRoute = Router()

notificationRoute.post("/signup-confirmation", notificationController.notifySignUpWithConfirmationCode);
notificationRoute.post("/send-money", authMiddleware, notificationController.notifySendMoneyToContact);
notificationRoute.post("/deposit", notificationController.notifyDepositAtAgency);
notificationRoute.post("/withdraw", notificationController.notifyWithdrawFromAgency);

export default notificationRoute;
