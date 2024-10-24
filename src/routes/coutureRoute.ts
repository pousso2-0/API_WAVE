// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import { CONTROLLER } from "../types";
import { CoutureController } from "../controllers/CoutureController";
import { roleMiddleware } from "../middlewares/roleMiddleware";

// Créer une instance du routeur
const coutureRoute: Router = Router();

const roles: string[] = ["tailleur"];

setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const coutureController: CoutureController = container.get<CoutureController>(CONTROLLER.Couture);

    coutureRoute.get("/all", authMiddleware, roleMiddleware(roles), coutureController.getAll.bind(coutureController));

    coutureRoute.get("/:id", authMiddleware, roleMiddleware(roles), coutureController.getById.bind(coutureController));

    // coutureRoute.get("/user", authMiddleware, roleMiddleware(roles), coutureController.getAllForUser.bind(coutureController));

    coutureRoute.post("/create", authMiddleware, roleMiddleware(roles), coutureController.create.bind(coutureController));

    coutureRoute.put("/:id", authMiddleware, roleMiddleware(roles), coutureController.update.bind(coutureController));

    coutureRoute.delete("/:id", authMiddleware, roleMiddleware(roles), coutureController.remove.bind(coutureController));

}, 200);


export default coutureRoute;