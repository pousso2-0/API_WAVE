import userController from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import {roleMiddleware} from "../middlewares/roleMiddleware";
import {upload} from "../config/multer";

// Créer une instance du routeur
const userRoute: Router = Router();

setTimeout(() => {
    // Placer les routes spécifiques AVANT les routes avec paramètres
    // Route de recherche en premier
    userRoute.get('/search', authMiddleware, userController.searchUser.bind(userController));
    
    userRoute.get('/me/moi', authMiddleware, userController.getCurrentUser.bind(userController));

    userRoute.post('/create-agent', authMiddleware, userController.createAgentOrAdmin.bind(userController));
    
    userRoute.post('/create-client', upload.fields([
        { name: "idCardFrontPhoto", maxCount: 1 },
        { name: "idCardBackPhoto", maxCount: 1 }
    ]), userController.createClientByAgent.bind(userController));

    // Routes avec paramètres après
    userRoute.get('/:id', authMiddleware, userController.getUserById.bind(userController));
    userRoute.get('/', authMiddleware, userController.listUsers.bind(userController));
    userRoute.delete('/:id', authMiddleware, userController.deleteUser.bind(userController));
    userRoute.get('/dmande/:id', authMiddleware, userController.DmandeParseData.bind(userController));
    userRoute.patch('/:id', authMiddleware, upload.fields([{ name: "photo", maxCount: 1}]), userController.updateUser.bind(userController));

}, 200);

export default userRoute;