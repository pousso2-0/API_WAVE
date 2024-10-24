// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import { CONTROLLER } from "../types";
import { CommentaireController } from "../controllers/CommentaireController";

// Créer une instance du routeur
const commentaireRoute: Router = Router();

setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const commentaireController: CommentaireController = container.get<CommentaireController>(CONTROLLER.Commentaire);

    commentaireRoute.get("/all", authMiddleware, commentaireController.getAll.bind(commentaireController));

    commentaireRoute.get("/:id", authMiddleware, commentaireController.getById.bind(commentaireController));

    // commentaireRoute.get("/test", authMiddleware, commentaireController.getAllForUser.bind(commentaireController));

    commentaireRoute.get("/publication/:id", authMiddleware, commentaireController.getAllFromPublication.bind(commentaireController));

    commentaireRoute.post("/create", authMiddleware, commentaireController.create.bind(commentaireController));

    commentaireRoute.put("/:id", authMiddleware, commentaireController.update.bind(commentaireController));

    commentaireRoute.delete("/:id", authMiddleware, commentaireController.remove.bind(commentaireController));

}, 200);


export default commentaireRoute;