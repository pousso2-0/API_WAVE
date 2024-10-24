// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import { CONTROLLER } from "../types";
import { RapportController } from "../controllers/RapportController";

// Créer une instance du routeur
const rapportRoute: Router = Router();

setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const rapportController: RapportController = container.get<RapportController>(CONTROLLER.Rapport);

    // Définir les routes
    rapportRoute.get("/all", authMiddleware, rapportController.getAll.bind(rapportController));
    
    rapportRoute.get("/receive", authMiddleware, rapportController.getUser.bind(rapportController));
    
    rapportRoute.get("/send", authMiddleware, rapportController.getUserSend.bind(rapportController));
    
    rapportRoute.get("/publication/:id", authMiddleware, rapportController.getPost.bind(rapportController));
    
    rapportRoute.get("/commentaire/:id", authMiddleware, rapportController.getComment.bind(rapportController));
    
    rapportRoute.post("/create", authMiddleware, rapportController.create.bind(rapportController));
    
    rapportRoute.delete("/:id", authMiddleware, rapportController.remove.bind(rapportController));
    
    rapportRoute.get("/:id", authMiddleware, rapportController.getById.bind(rapportController));

}, 200);


export default rapportRoute;
