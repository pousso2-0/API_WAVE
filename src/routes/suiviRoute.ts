// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { SuiviController } from "../controllers/SuiviController";
import { Router } from "express";
import { CONTROLLER } from "../types";


// Créer une instance du routeur
const suiviRoute: Router = Router();

setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const suiviController: SuiviController = container.get<SuiviController>(CONTROLLER.Suivi);


    // // Définir les routes
    suiviRoute.get("/flower", authMiddleware, suiviController.getFlowers.bind(suiviController));

    suiviRoute.get("/flower/:id", authMiddleware, suiviController.getFlowers.bind(suiviController));

    suiviRoute.get("/flowing", authMiddleware, suiviController.getFlowing.bind(suiviController));

    suiviRoute.get("/flowing/:id", authMiddleware, suiviController.getFlowing.bind(suiviController));

    suiviRoute.get("/flower/bloqued", authMiddleware, suiviController.userBloqued.bind(suiviController));

    suiviRoute.get("/flower/bloqued/:id", authMiddleware, suiviController.userBloqued.bind(suiviController));

    suiviRoute.get("/flowing/bloqued", authMiddleware, suiviController.bloquedUser.bind(suiviController));

    suiviRoute.get("/flowing/bloqued/:id", authMiddleware, suiviController.bloquedUser.bind(suiviController));

    suiviRoute.get("/:id", authMiddleware, suiviController.getById.bind(suiviController));

    suiviRoute.post("/flowing/:id", authMiddleware, suiviController.flowingUser.bind(suiviController));

    suiviRoute.post("/unbloqued/:id", authMiddleware, suiviController.unblocked.bind(suiviController));

    suiviRoute.delete("/unflower/:id", authMiddleware, suiviController.removeFlower.bind(suiviController));

    suiviRoute.delete("/unflowing/:id", authMiddleware, suiviController.bloqued.bind(suiviController));

}, 200);


export default suiviRoute;