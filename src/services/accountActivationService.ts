import prisma from "../config/prisma";
import userService from "./userService";
import HashService from "../security/hashService";
import {User} from "@prisma/client";
import bcrypt from 'bcryptjs';
import {userIncludes} from "../interfaces/UserInterface";


interface ActivationResult {
    success: boolean;
    message: string;
    userId?: string;
}

interface PasswordUpdateResult {
    success: boolean;
    message: string;
    data?: User;
}

class AccountActivationService {
    async verifyActivationCode(phoneNumber: string, code: string): Promise<ActivationResult> {
        try {
            const user = await userService.phoneExist(phoneNumber);
            if (!user || user.isActive) {
                return {
                    success: false,
                    message: 'Numéro de téléphone non trouvé ou compte déjà activé'
                };
            }

            const isPasswordValid: boolean = await bcrypt.compare(code, user.passwordHash);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Code d\'activation incorrect'
                };
            }

            return {
                success: true,
                message: 'Code vérifié avec succès',
                userId: user.id
            };

        } catch (error) {
            console.error("Erreur lors de la vérification du code:", error);
            throw new Error("Erreur lors de la vérification du code d'activation");
        }
    }

    async updatePassword(userId: string, newPassword: string): Promise<PasswordUpdateResult> {
        try {
            // Attendez d'abord que la mise à jour soit terminée
            const hashedPassword = await HashService.hash(newPassword);

            const updatedUser = await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    passwordHash: hashedPassword,
                    isActive: true,
                },
                include: userIncludes
            });

            // Maintenant nous pouvons créer notre résultat avec l'utilisateur mis à jour
            return {
                success: true,
                message: "Mot de passe mis à jour et compte activé avec succès",
                data: updatedUser as User // Cast explicite vers User
            };

        } catch (error) {
            console.error("Erreur lors de la mise à jour du mot de passe:", error);
            return {
                success: false,
                message: "Erreur lors de la mise à jour du mot de passe"
            };
        }
    }
}

export default new AccountActivationService();