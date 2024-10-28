// src/routes/utilisateurRoute.ts
import authController from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import passport from "passport";

// Créer une instance du routeur
const authRoute: Router = Router();



    // // Définir les routes
    authRoute.post('/login', authController.login.bind(authController));

    authRoute.post('/logout', authMiddleware, authController.logout.bind(authController));



export default authRoute;