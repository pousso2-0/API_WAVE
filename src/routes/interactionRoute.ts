// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import { CONTROLLER } from "../types";
import { InteractionController } from "../controllers/InteractionController";

// Créer une instance du routeur
const interactionRoute: Router = Router();

setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const interactionController: InteractionController = container.get<InteractionController>(CONTROLLER.Interaction);

    interactionRoute.get("/all", authMiddleware, interactionController.getAll.bind(interactionController));

    interactionRoute.get("/:id", authMiddleware, interactionController.getById.bind(interactionController));

    interactionRoute.post("/create", authMiddleware, interactionController.create.bind(interactionController));

    interactionRoute.put("/:id", authMiddleware, interactionController.update.bind(interactionController));

    interactionRoute.delete("/:id", authMiddleware, interactionController.remove.bind(interactionController));

}, 200);


export default interactionRoute;