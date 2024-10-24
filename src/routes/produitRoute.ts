// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { ProduitController } from "../controllers/ProduitController";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { Router } from "express";
import { CONTROLLER } from "../types";

// Créer une instance du routeur
const produitRoute: Router = Router();

setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const produitController: ProduitController = container.get<ProduitController>(CONTROLLER.Produit);

    const roles: string[] = ['tailleur', 'vendeur'];

    produitRoute.get("/all", authMiddleware, produitController.getAll.bind(produitController));

    produitRoute.get("/user", authMiddleware, roleMiddleware(roles), produitController.getAllForUser.bind(produitController));

    produitRoute.get("/:id", authMiddleware, produitController.getById.bind(produitController));

    produitRoute.post("/create", authMiddleware, roleMiddleware(roles), produitController.create.bind(produitController));

    produitRoute.put("/update/:id", authMiddleware, roleMiddleware(roles), produitController.update.bind(produitController));

    produitRoute.delete("/:id", authMiddleware, roleMiddleware(roles), produitController.remove.bind(produitController));

}, 200);


export default produitRoute;