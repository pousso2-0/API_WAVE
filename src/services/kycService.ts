// services/KycService.ts
import {KycCreate} from "../interfaces/KycInterface";
import prisma from "../config/prisma";

class KycService {
    async createKyc(data: KycCreate) {
        try {
            return await prisma.kyc.create({
                data: {
                    userId: data.userId,
                    documentType: data.documentType,
                    documentNumber: data.documentNumber,
                    idCardFrontPhoto: data.idCardFrontPhoto,
                    idCardBackPhoto: data.idCardBackPhoto,
                    verificationStatus: data.verificationStatus,
                    verifiedAt: data.verifiedAt,
                    verificationMethod: data.verificationMethod,
                    rejectionReason: data.rejectionReason
                }
            });
        } catch (error) {
            console.error("Erreur lors de la création du KYC:", error);
            throw new Error("La création du KYC a échoué.");
        }
    }
}

export default new KycService();
