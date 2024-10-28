import { Request, Response } from "express";
import kycService from "../services/kycService";

export default new class KycController {

  async saveKYC(req: Request, res: Response) {
    const { userId, documentType, documentNumber } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (!userId || !documentType || !documentNumber) {
      return res.status(400).json({ message: "Les informations utilisateur et document sont requises." });
    }

    if (!files?.idCardFrontPhoto?.[0] || !files?.idCardBackPhoto?.[0]) {
      return res.status(400).json({ message: "Les photos de la carte d'identité sont requises." });
    }

    const [idCardFrontPhoto, idCardBackPhoto] = [files.idCardFrontPhoto[0], files.idCardBackPhoto[0]];

    try {
      await kycService.verifyDocument(documentType, documentNumber, userId);
      await kycService.saveKYC(userId, documentType, documentNumber, idCardFrontPhoto, idCardBackPhoto);

      return res.status(201).json({ message: "KYC enregistré avec succès." });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du KYC:", error);
      return res.status(500).json({ message: "Erreur lors de l'enregistrement du KYC." });
    }
  }

  async verifyDocument(req: Request, res: Response) {
    const { documentType, documentNumber, userId } = req.body;

    try {
      await kycService.verifyDocument(documentType, documentNumber, userId);
      return res.status(200).json({ message: "Document déjà vérifié." });
    } catch (error) {
      console.error("Erreur lors de la vérification du document:", error);
      return res.status(500).json({ message: "Erreur lors de la vérification du document." });
    }
  }
}
