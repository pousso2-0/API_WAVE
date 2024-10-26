import userController from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import {roleMiddleware} from "../middlewares/roleMiddleware";

// Créer une instance du routeur
const userRoute: Router = Router();

setTimeout(() => {

    userRoute.post('/create-agent',authMiddleware , userController.createAgentOrAdmin.bind(userController));
    userRoute.get('/dmande/:id', userController.DmandeParseData.bind(userController));


}, 200);


export default userRoute;