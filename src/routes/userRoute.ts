import userController from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import {roleMiddleware} from "../middlewares/roleMiddleware";

// Créer une instance du routeur
const userRoute: Router = Router();

setTimeout(() => {

    userRoute.post('/create-agent',authMiddleware, roleMiddleware(['ADMIN']) , userController.createAgent.bind(userController));

}, 200);


export default userRoute;