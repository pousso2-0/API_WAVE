import { Request, Response } from "express";
import AccountActivationService from "../services/accountActivationService";
import {updatePasswordSchema, verifyCodeSchema} from "../validations/demandeValidate";


class AccountActivationController {
    async verifyCode(req: Request, res: Response) {
        try {
            const { success } = verifyCodeSchema.safeParse(req.body);
            if (!success) {
                return res.status(400).json({
                    message: "Données invalides",
                    error: true
                });
            }

            const { phoneNumber, code } = req.body;
            const result = await AccountActivationService.verifyActivationCode(phoneNumber, code);

            if (!result.success) {
                return res.status(400).json({
                    message: result.message,
                    error: true
                });
            }

            return res.status(200).json({
                message: result.message,
                data: { userId: result.userId },
                error: false
            });

        } catch (error) {
            console.error("Erreur lors de la vérification du code:", error);
            return res.status(500).json({
                message: "Erreur lors de la vérification du code",
                error: true
            });
        }
    }

    async updatePassword(req: Request, res: Response) {
        try {
            // Validation des données avec le schéma
            const validationResult = updatePasswordSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    message: "Données invalides",
                    error: true,
                    errors: validationResult.error.format() // Retourne les erreurs de validation
                });
            }

            const { userId, newPassword } = req.body;
            const result = await AccountActivationService.updatePassword(userId, newPassword);

            // Retourner le résultat avec les données de l'utilisateur mises à jour
            return res.status(200).json({
                message: result.message,
                error: false,
                data: result.data // Inclure les données mises à jour
            });

        } catch (error) {
            console.error("Erreur lors de la mise à jour du mot de passe:", error);
            return res.status(500).json({
                message: "Erreur lors de la mise à jour du mot de passe",
                error: true
            });
        }
    }

}

export default new AccountActivationController();