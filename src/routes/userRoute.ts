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
    userRoute.get('/',authMiddleware, userController.listUsers.bind(userController));

    // Route pour supprimer un utilisateur
    userRoute.delete('/:id', authMiddleware,  userController.deleteUser.bind(userController));

    // Route pour traiter une demande de récupération des données utilisateur
    userRoute.get('/dmande/:id', authMiddleware, userController.DmandeParseData.bind(userController));

    // Route pour mettre à jour un utilisateur
    userRoute.patch('/:id', authMiddleware, upload.fields([{ name: "photo", maxCount: 1}]) ,userController.updateUser.bind(userController));
    // Route pour récupérer les informations d'un utilisateur connecté
   userRoute.get('/me/moi', authMiddleware, userController.getCurrentUser.bind(userController));

}, 200);


export default userRoute;