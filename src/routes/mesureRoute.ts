// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import { CONTROLLER } from "../types";
import { MesureController } from "../controllers/MesureController";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { Request, Response } from "express";

// Créer une instance du routeur
const mesureRoute: Router = Router();

const roles: string[] = ['tailleur', 'vendeur'];

setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const mesureController: MesureController = container.get<MesureController>(CONTROLLER.Mesure);

    mesureRoute.get("/all", authMiddleware, roleMiddleware(roles), mesureController.getAll.bind(mesureController));

    mesureRoute.get("/:id", authMiddleware, roleMiddleware(roles), mesureController.getById.bind(mesureController));

    // mesureRoute.get("/user", authMiddleware, roleMiddleware(roles), mesureController.getAllForUser.bind(mesureController));

    mesureRoute.post("/", authMiddleware, roleMiddleware(roles), mesureController.getAll.bind(mesureController));

    mesureRoute.put("/:id", authMiddleware, roleMiddleware(roles), mesureController.update.bind(mesureController));

    mesureRoute.delete("/:id", authMiddleware, roleMiddleware(roles), mesureController.remove.bind(mesureController));

}, 200);


export default mesureRoute;