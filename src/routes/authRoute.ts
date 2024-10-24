// src/routes/utilisateurRoute.ts
import authController from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";
import passport from "passport";

// Créer une instance du routeur
const authRoute: Router = Router();

setTimeout(() => {

    // // Définir les routes
    authRoute.post('/login', authController.login.bind(authController));

    authRoute.post('/logout', authMiddleware, authController.logout.bind(authController));

    // authRoute.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // authRoute.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authController.redirect);
}, 200);


export default authRoute;