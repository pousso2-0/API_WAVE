// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import { CONTROLLER } from "../types";
import { CommandeController } from "../controllers/CommandeController";
import { roleMiddleware } from "../middlewares/roleMiddleware";

// Créer une instance du routeur
const commandeRoute: Router = Router();
const roles:string[] = ['client', 'tailleur'];
setTimeout(() => {

    // Instancier le contrôleur avec le service résolu
    const commandeController: CommandeController = container.get<CommandeController>(CONTROLLER.Commande);
    // Routes pour les vendeurs et les tailleurs
    commandeRoute.get('/all', authMiddleware, roleMiddleware(roles), commandeController.getAll.bind(commandeController));
    commandeRoute.get('/:id', authMiddleware, roleMiddleware(roles), commandeController.getById.bind(commandeController));
    commandeRoute.post('/create', authMiddleware, roleMiddleware(roles), commandeController.create.bind(commandeController));
    commandeRoute.put('/update', authMiddleware, roleMiddleware(roles), commandeController.update.bind(commandeController));
    commandeRoute.patch('/:id/status', authMiddleware, roleMiddleware(roles), commandeController.changeStatus.bind(commandeController));
    commandeRoute.delete('/:id', authMiddleware, roleMiddleware(roles), commandeController.remove.bind(commandeController));
    
    // Routes spécifiques pour les clients (si nécessaire)
    commandeRoute.get('/client/:id', authMiddleware, roleMiddleware(roles), commandeController.forUser.bind(commandeController)); // Pour récupérer les commandes spécifiques d'un client

}, 200);


export default commandeRoute;