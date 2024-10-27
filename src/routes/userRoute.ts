import userController from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import {roleMiddleware} from "../middlewares/roleMiddleware";
import {upload} from "../config/multer";

// Créer une instance du routeur
const userRoute: Router = Router();

setTimeout(() => {

    userRoute.post('/create-agent',authMiddleware , userController.createAgentOrAdmin.bind(userController));
    userRoute.post('/create-client', upload.fields([
        { name: "idCardFrontPhoto", maxCount: 1 },
        { name: "idCardBackPhoto", maxCount: 1 }
    ]),   userController.createClientByAgent.bind(userController));
    // Route pour récupérer un utilisateur par son ID
    userRoute.get('/:id', authMiddleware, userController.getUserById.bind(userController));

    // Route pour lister les utilisateurs avec un filtre optionnel par rôle
    userRoute.get('/', userController.listUsers.bind(userController));

    // Route pour supprimer un utilisateur
    userRoute.delete('/:id', authMiddleware,  userController.deleteUser.bind(userController));

    // Route pour traiter une demande de récupération des données utilisateur
    userRoute.get('/dmande/:id', authMiddleware, userController.DmandeParseData.bind(userController));

}, 200);

export default userRoute;