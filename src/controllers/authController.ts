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
        const token = req.headers['authorization']?.split(' ')[1]
        blacklistToken(token);
        res.clearCookie('token');
        res.status(200).json({ message: 'Deconnexion reussie', data: { userId }, error: false });
    }

    async login(req: Request, res: Response) {
        const { phone, password } = req.body;
        console.log(phone, password);

        try {

            const user = await userService.phoneExist(phone);
            if (!user) {
                return res.status(404).json({ message: 'Le numéro ou mot de passe incorrect', error: true, data: null });
            }

            const isPasswordValid: boolean = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Le numéro ou mot de passe incorrect', error: true, data: null });
            }

            const token: string = jwt.sign({ userId: user.id, role: user.roleId }, process.env.JWT_SECRET!, {
                expiresIn: process.env.JWT_EXPIRES_IN,
            });

            res.status(200).json({ data: { token }, message: 'Connexion reussie', error: false });
        }
        catch (error) {
            res.status(500).json({ mesage: 'An error occurred', error, data: null });
        }
    }
}