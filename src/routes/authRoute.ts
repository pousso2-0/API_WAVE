// src/routes/utilisateurRoute.ts
import container from "../config";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { CONTROLLER } from "../types";

import passport from "passport";

// Créer une instance du routeur
const authRoute: Router = Router();

setTimeout(() => {

    const authController: AuthController = container.get<AuthController>(CONTROLLER.Auth);

    // // Définir les routes
    authRoute.post('/login', authController.login.bind(authController));

    authRoute.post('/logout', authMiddleware, authController.logout.bind(authController));

    authRoute.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    authRoute.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authController.redirect);
}, 200);


export default authRoute;