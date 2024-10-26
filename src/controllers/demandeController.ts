import { Request, Response } from "express";
import demandeService from "../services/demandeService";
import { DemandeInterface } from "../interfaces/DemandeInterface";

class demandeController {
    async createDemande(req: Request, res: Response) {
        try {
            const { firstName, lastName, phoneNumber, idCardFrontPhoto, idCardBackPhoto } = req.body;

            if (!firstName || !lastName || !phoneNumber || !idCardFrontPhoto || !idCardBackPhoto) {
                return res.status(400).json({
                    data: null,
                    message: "Tous les champs sont requis",
                    error: true
                });
            }

            const response = await demandeService.createDemande({
                firstName,
                lastName,
                phoneNumber,
                idCardFrontPhoto,
                idCardBackPhoto
            });

            if (response.error) {
                return res.status(400).json(response);
            }

            return res.status(201).json(response);

        } catch (error) {
            return res.status(500).json({
                data: null,
                message: "Erreur serveur lors de la création de la demande",
                error: true
            });
        }
    }

    async listDemandes(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;

            const response = await demandeService.listDemandes({ page, limit });

            if (response.error) {
                return res.status(400).json(response);
            }

            return res.status(200).json(response);

        } catch (error) {
            return res.status(500).json({
                data: null,
                message: "Erreur serveur lors de la récupération des demandes",
                error: true
            });
        }
    }

    async updateDemande(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData: Partial<DemandeInterface> = req.body;

            const response = await demandeService.updateDemande(id, updateData);

            if (response.error) {
                return res.status(400).json(response);
            }

            return res.status(200).json(response);

        } catch (error) {
            return res.status(500).json({
                data: null,
                message: "Erreur serveur lors de la mise à jour de la demande",
                error: true
            });
        }
    }

    async deleteDemande(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const response = await demandeService.deleteDemande(id);

            if (response.error) {
                return res.status(400).json(response);
            }

            return res.status(200).json(response);

        } catch (error) {
            return res.status(500).json({
                data: null,
                message: "Erreur serveur lors de la suppression de la demande",
                error: true
            });
        }
    }
}

export default new demandeController();