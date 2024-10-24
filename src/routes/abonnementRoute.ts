// src/routes/abonnementRoute.ts
import container from "../config/";
import abonnementMiddleware from "../middlewares/abonnemntMiddleware";
import authMiddleware from "../middlewares/authMiddleware";
import { AbonnementController } from "../controllers/AbonnementController";
import { Router } from "express";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { CONTROLLER } from "../types";

// Créer une instance du routeur
const abonnementRoute: Router = Router();

const roles: string[] = ['tailleur', 'vendeur'];

setTimeout(() => {
    // Instancier le contrôleur avec le service résolu
    const abonnementController: AbonnementController = container.get<AbonnementController>(CONTROLLER.Abonnement);


    // Définir les routes
    abonnementRoute.get("/all", authMiddleware, roleMiddleware(roles), abonnementController.getAll.bind(abonnementController));

    abonnementRoute.get("/user", authMiddleware, roleMiddleware(roles), abonnementController.getAllUser.bind(abonnementController));

    abonnementRoute.get("/:id", authMiddleware, roleMiddleware(roles), abonnementController.getById.bind(abonnementController));

    abonnementRoute.post("/create", authMiddleware, roleMiddleware(roles), abonnementMiddleware, abonnementController.create.bind(abonnementController));

    abonnementRoute.delete("/:id", authMiddleware, roleMiddleware(roles),abonnementController.remove.bind(abonnementController));

}, 200);

export default abonnementRoute;