// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import { CONTROLLER } from "../types";
import { NotificationController } from "../controllers/NotificationController";

// Créer une instance du routeur
const notificationRoute: Router = Router();

setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const notificationController: NotificationController = container.get<NotificationController>(CONTROLLER.Notification);

}, 200);


export default notificationRoute;