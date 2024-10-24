// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { PublicationController } from "../controllers/PublicationController";
import { Router } from "express";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { CONTROLLER } from "../types";

// Créer une instance du routeur
const publicationRoute: Router = Router();

setTimeout(() => {


    // Instancier le contrôleur avec le service résolu
    const publicationController: PublicationController = container.get<PublicationController>(CONTROLLER.Publication);

    const roles: string[] = ['tailleur', 'vendeur'];

    // Définir les routes
    publicationRoute.get("/posts/all", authMiddleware,   publicationController.getAllPost.bind(publicationController));

    publicationRoute.get("/posts/user", authMiddleware, roleMiddleware(roles), publicationController.getAllPostUser.bind(publicationController));

    publicationRoute.get("/:id", authMiddleware, publicationController.getById.bind(publicationController));

    publicationRoute.get("/status/all", authMiddleware, publicationController.getAllStatus.bind(publicationController));

    publicationRoute.get("/status/user", authMiddleware, roleMiddleware(roles), publicationController.getAllStatusUser.bind(publicationController));

    publicationRoute.post("/posts/create", authMiddleware, roleMiddleware(roles), publicationController.createPosts.bind(publicationController));

    publicationRoute.post("/status/create", authMiddleware, roleMiddleware(roles), publicationController.createStatus.bind(publicationController));

    publicationRoute.put("/posts/update/:id", authMiddleware, roleMiddleware(roles), publicationController.updatePosts.bind(publicationController));

    publicationRoute.delete("/:id", authMiddleware, roleMiddleware(roles), publicationController.remove.bind(publicationController));

}, 200);


export default publicationRoute;
