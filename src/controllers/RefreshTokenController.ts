import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import userService from "../services/userService";
import { IRequestAuth } from "../interfaces/AuthInterface";

export default new class RefreshTokenController {
    async refreshToken(req: Request, res: Response) {
        const oldToken = req.headers['authorization']?.split(' ')[1];

        try {
            // Verify the old token
            const decodedToken = jwt.verify(oldToken!, process.env.JWT_SECRET!) as { userId: string };

            // Find the user
            const user = await userService.findById(decodedToken.userId);
            if (!user) {
                return res.status(401).json({ message: 'Utilisateur non trouvé', error: true, data: null });
            }

            // Get user role
            const role = await userService.getRolename(user.roleId);

            // Generate new token
            const newToken: string = jwt.sign(
                {
                    userId: user.id,
                    role: role
                },
                process.env.JWT_SECRET!,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN
                }
            );

            res.status(200).json({
                data: { token: newToken },
                message: 'Token rafraîchi avec succès',
                error: false
            });
        } catch (error) {
            console.error('Erreur lors du refresh token:', error);
            res.status(401).json({ message: 'Token invalide', error: true, data: null });
        }
    }
}