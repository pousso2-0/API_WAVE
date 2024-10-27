import { Request, Response } from "express";
import AccountJobService from "../services/accountJobService";

class AccountJobController {
    async ManualProccessing(req: Request, res: Response) {
        try {
            const result = await AccountJobService.processApprovedRequests();

            if (result.failedCount > 0) {
                // Si certaines demandes ont échoué mais d'autres ont réussi
                return res.status(207).json({
                    message: `Traitement partiellement réussi. ${result.processedCount} demande(s) traitée(s), ${result.failedCount} échec(s).`,
                    data: result,
                    error: false
                });
            }

            // Si toutes les demandes ont réussi
            return res.status(200).json({
                message: `Traitement réussi de ${result.processedCount} demande(s)`,
                data: result,
                error: false
            });
        } catch (error) {
            console.error("Erreur lors du déclenchement du traitement des comptes :", error);
            res.status(500).json({
                message: "Échec du traitement des demandes de compte",
                data: null,
                error: true
            });
        }
    }
}

export default new AccountJobController();