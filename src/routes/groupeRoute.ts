// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import { CONTROLLER } from "../types";
import { GroupeController } from "../controllers/GroupeController";


// Créer une instance du routeur
const groupeRoute: Router = Router();


setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const groupeController: GroupeController = container.get<GroupeController>(CONTROLLER.Groupe);

    groupeRoute.get("/all", authMiddleware, groupeController.getAll.bind(groupeController));

    groupeRoute.get("/:id", authMiddleware, groupeController.getById.bind(groupeController));

    groupeRoute.get("/user", authMiddleware, groupeController.getAllForUser.bind(groupeController));
    
    groupeRoute.get("/member/:id", authMiddleware, groupeController.members.bind(groupeController));

    groupeRoute.post("/create", authMiddleware, groupeController.create.bind(groupeController));
    
    groupeRoute.post("/add-member", authMiddleware, groupeController.addMember.bind(groupeController));

    groupeRoute.put("/:id", authMiddleware, groupeController.update.bind(groupeController));

    groupeRoute.delete("/:id", authMiddleware, groupeController.remove.bind(groupeController));
    
    groupeRoute.delete("/member/remove", authMiddleware, groupeController.removeMember.bind(groupeController));

}, 200);


export default groupeRoute;