import { User } from "@prisma/client";
import { Request, Response } from "express";
import userService from "../services/userService";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IRequestAuth } from "../interfaces/AuthInterface";
import { blacklistToken } from "../security/blackList";

export default new class authController {

    async logout(req: Request, res: Response) {
        const userId: string = (req as IRequestAuth).user.userId;
        const token = req.headers['authorization']?.split(' ')[1];
        blacklistToken(token);
        res.clearCookie('token');
        res.status(200).json({ data: { userId }, message: 'Déconnexion réussie', error: false });
    }

    async login(req: Request, res: Response) {
        const { phone, password } = req.body;
        try {
            console.log('Vérification du téléphone:', phone);
            const user = await userService.phoneExist(phone);
            console.log('Utilisateur trouvé:', user);

            if (!user) {
                return res.status(401).json({ data: null, message: 'Le numéro ou le mot de passe est incorrect.', error: true });
            }

            console.log('Mot de passe utilisateur:', user.passwordHash);
            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            console.log('Correspondance du mot de passe:', passwordMatch);

            if (!passwordMatch) {
                return res.status(401).json({ data: null, message: 'Le numéro ou le mot de passe est incorrect.', error: true });
            }

            const role = await userService.getRolename(user.roleId);
            console.log('Rôle de l\'utilisateur:', role);

            // Génération des tokens
            const accessToken = jwt.sign(
                { userId: user.id, role: role },
                process.env.JWT_SECRET!,
                { expiresIn: '15m' }
            );
            console.log('Access Token:', accessToken);

            const refreshToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET!,
                { expiresIn: '7d' }
            );
            console.log('Refresh Token:', refreshToken);

            // Réponse avec les tokens
            res.status(200).json({
                data: { accessToken, refreshToken },
                message: 'Connexion réussie',
                error: false
            });
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).json({ data: null, message: 'Erreur interne du serveur', error: true });
        }
    }

    async refreshToken(req: Request, res: Response) {
        const { refreshToken } = req.body;
        console.log()

        if (!refreshToken) {
            return res.status(401).json({ data: null, message: 'Refresh token requis', error: true });
        }

        try {
            console.log('Début de la vérification du refresh token');
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { userId: string };
            console.log('Token décodé:', decoded);

            const user = await userService.getUserById(decoded.userId);
            console.log('Utilisateur récupéré:', user);

            if (!user) {
                return res.status(401).json({ data: null, message: 'Utilisateur non trouvé', error: true });
            }

            const role = await userService.getRolename(user.roleId);
            console.log('Rôle récupéré:', role);

            const newAccessToken = jwt.sign(
                { userId: user.id, role: role },
                process.env.JWT_SECRET!,
                { expiresIn: '15m' }
            );
            console.log(newAccessToken)

            res.status(200).json({
                data: { accessToken: newAccessToken },
                message: 'Nouveau access token généré',
                error: false
            });
        } catch (error) {
            console.error('Erreur lors du refresh token:', error);
            res.status(401).json({ data: null, message: 'Refresh token invalide ou expiré', error: true });
        }
    }

}
