// src/routes/utilisateurRoute.ts
import container from "../config";
import { Router } from "express";
import { UtilisateurController } from "../controllers/UtilisateurController";
import { CONTROLLER } from "../types";
import authMiddleware from "../middlewares/authMiddleware";

// Créer une instance du routeur
const utilisateurRoute: Router = Router();

setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const utilisateurController: UtilisateurController = container.get<UtilisateurController>(CONTROLLER.Utilisateur);

    // Définir les routes
    utilisateurRoute.get("/all", authMiddleware, utilisateurController.getAll.bind(utilisateurController));

    utilisateurRoute.get("/profil", authMiddleware, utilisateurController.profil.bind(utilisateurController));

    utilisateurRoute.post("/register", utilisateurController.create.bind(utilisateurController));

    utilisateurRoute.put("/update", authMiddleware, utilisateurController.update.bind(utilisateurController));

    utilisateurRoute.delete("/remove", authMiddleware, utilisateurController.remove.bind(utilisateurController));

    utilisateurRoute.get("/:id", authMiddleware, utilisateurController.getById.bind(utilisateurController));

}, 200);



export default utilisateurRoute;