import { Request, Response } from "express";
import demandeService from "../services/demandeService";
import { z } from "zod";
import { CreateAccountRequestSchema } from "../validations/demandeValidate";
import { AccountRequestStatus } from "../enums/AccountRequestStatus";

class DemandeController {
    async createDemande(req: Request, res: Response) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        try {
            if (!files.idCardFrontPhoto || !files.idCardBackPhoto) {
                return res.status(400).json({
                    message: "Les photos recto et verso de la carte d'identité sont requises",
                    data: null,
                    error: true
                });
            }

            const parsedData = CreateAccountRequestSchema.parse({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                idCardFrontPhoto: files.idCardFrontPhoto[0],
                idCardBackPhoto: files.idCardBackPhoto[0],
            });

            const newRequest = await demandeService.createAccountRequest({
                firstName: parsedData.firstName,
                lastName: parsedData.lastName,
                email: parsedData.email,
                phoneNumber: parsedData.phoneNumber,
                idCardFrontPhoto: files.idCardFrontPhoto[0].path,
                idCardBackPhoto: files.idCardBackPhoto[0].path,
            });

            res.status(201).json({
                message: "Demande créée avec succès",
                data: newRequest,
                error: false
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Erreur de validation",
                    data: error.errors,
                    error: true
                });
            } else if (error instanceof Error) {
                console.error("Erreur lors de la création de la demande:", error);
                return res.status(500).json({
                    message: "Erreur lors de la création de la demande",
                    data: {
                        message: error.message,
                    },
                    error: true
                });
            } else {
                console.error("Erreur inconnue lors de la création de la demande:", error);
                return res.status(500).json({
                    message: "Erreur inconnue lors de la création de la demande",
                    data: null,
                    error: true
                });
            }
        }
    }

    async listRequests(req: Request, res: Response) {
        try {
            const { status } = req.query;
            let validStatus: AccountRequestStatus | undefined;

            if (status && typeof status === 'string') {
                const upperStatus = status.toUpperCase();
                if (Object.values(AccountRequestStatus).includes(upperStatus as AccountRequestStatus)) {
                    validStatus = upperStatus as AccountRequestStatus;
                }
            }

            const requests = await demandeService.getAccountRequests(validStatus);
            res.status(200).json({
                message: "Demandes récupérées avec succès",
                data: requests,
                error: false
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            res.status(500).json({
                message: "Erreur lors de la récupération des demandes",
                data: null,
                error: true
            });
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (![AccountRequestStatus.APPROVED, AccountRequestStatus.REJECTED].includes(status)) {
                return res.status(400).json({
                    message: "Statut non valide",
                    data: null,
                    error: true
                });
            }

            const updatedRequest = await demandeService.updateRequestStatus(id, status);
            res.status(200).json({
                message: "Statut de la demande mis à jour avec succès",
                data: updatedRequest,
                error: false
            });
        } catch (error) {
            res.status(500).json({
                message: "Erreur lors de la mise à jour du statut",
                data: null,
                error: true
            });
        }
    }
}

export default new DemandeController();
