import prisma from "../config/prisma";
import { AccountRequestStatus } from "../enums/AccountRequestStatus";
import { RoleEnum } from "../enums/RoleEnum";
import userService from "./userService";
import { creatUser } from "../interfaces/UserInterface";
import { KycStatus } from "../enums/KycStatus";
import NotificationService from "../services/notificationService";
import KycService from "./kycService";
import { KycCreate } from "../interfaces/KycInterface";
import { extractTextFromImage, parseIdentityData } from "../config/vision";
import { generateTemporaryPassword } from "../utils/generatePassword";
import {WalletService} from "./walletService";

interface ProcessingResult {
    success: boolean;
    processedCount: number;
    failedCount: number;
    failedRequests: Array<{
        id: string;
        error: string;
    }>;
}

class AccountJobService {
    // Fonction pour traiter une seule demande avec gestion des erreurs
    private async handleAccountRequest(accountRequestId: string): Promise<boolean> {
            try {
                console.log('=== Début du traitement de la demande ===');
                console.log('ID de la demande:', accountRequestId);

                const accountRequest = await prisma.accountCreationRequest.findUnique({
                    where: { id: accountRequestId },
                });

                if (!accountRequest) {
                    throw new Error("Request not found");
                }

                // 1. Extraction et parsing des données d'identité
                const frontText = await extractTextFromImage(accountRequest.idCardFrontPhoto);
                const backText = await extractTextFromImage(accountRequest.idCardBackPhoto);

                if (!frontText || !backText) {
                    throw new Error("Failed to extract text from ID card images");
                }

                const frontData = parseIdentityData(frontText);
                const backData = parseIdentityData(backText);

                // 2. Fusion des données
                const mergedData = Object.entries(frontData).reduce((acc, [key, value]) => {
                    acc[key] = value || backData[key as keyof typeof backData] || '';
                    return acc;
                }, {} as Record<string, string>);

                const temporaryPassword = generateTemporaryPassword();


                // 3. Prépareration des données utilisateur
                const newUser: creatUser = {
                    email: accountRequest.email || 'demande@gmail.com',
                    firstName: mergedData.firstName,
                    lastName: mergedData.lastName,
                    dateOfBirth: new Date(mergedData.dateOfBirth || "2000-01-01"),
                    address: mergedData.address,
                    city: mergedData.city,
                    country:  "Senegal",
                    phoneNumber: accountRequest.phoneNumber,
                    password: temporaryPassword,
                    role: RoleEnum.CLIENT,
                    kycStatus: KycStatus.VERIFIED,
                    isVerified: true,
                    isActive: true,
                };
                // 4. Transaction pour les opérations critiques de base de données
                const user = await prisma.$transaction(async (prismaTransaction) => {
                    // Créer l'utilisateur
                    const createdUser = await userService.createUser(newUser);

                    // Créer le KYC
                    const kycData: KycCreate = {
                        userId: createdUser.id,
                        documentType: 'CNI',
                        documentNumber: mergedData.documentNumber,
                        idCardFrontPhoto: accountRequest.idCardFrontPhoto,
                        idCardBackPhoto: accountRequest.idCardBackPhoto,
                        verificationStatus: KycStatus.VERIFIED,
                        verifiedAt: new Date(),
                        verificationMethod: "Automatique",
                        rejectionReason: ""
                    };

                     await KycService.createKyc(kycData);
                     const data = {
                         userId: createdUser.id,
                         balance: 0,
                         currency: "F CFA",
                         dailyLimit: 100000,
                         monthlyLimit: 1000000,
                     }

                     // Créer le wallet
                    const getInstance = new WalletService()
                  await getInstance.createWallet(data)

                    // Marquer la demande comme traitée
                    await prismaTransaction.accountCreationRequest.update({
                        where: { id: accountRequest.id },
                        data: { processed: true }
                    });

                    return createdUser;
                }, {
                    timeout: 10000 // Augmenter le timeout à 10 secondes
                });

                // 5. Envoyer la notification (en dehors de la transaction car non critique)
                await NotificationService.notifySignUpWithConfirmationCode(user.id, temporaryPassword);

                console.log(`Demande traitée avec succès pour le téléphone ${user.phoneNumber}`);
                return true;

            } catch (error) {
                console.error(`Erreur lors du traitement de la demande ${accountRequestId}:`, error);
                return false;
            }
    }

    // Fonction pour traiter toutes les demandes approuvées
    async processApprovedRequests(): Promise<ProcessingResult> {
        const result: ProcessingResult = {
            success: false,
            processedCount: 0,
            failedCount: 0,
            failedRequests: []
        };

        try {
            const approvedRequests = await prisma.accountCreationRequest.findMany({
                where: {
                    status: AccountRequestStatus.APPROVED,
                    processed: false
                }
            });

            console.log(`Found ${approvedRequests.length} approved requests to process`);

            for (const request of approvedRequests) {
                try {
                    const success = await this.handleAccountRequest(request.id);
                    if (success) {
                        result.processedCount++;
                    } else {
                        result.failedCount++;
                        result.failedRequests.push({
                            id: request.id,
                            error: 'Processing failed'
                        });
                    }
                } catch (error) {
                    result.failedCount++;
                    result.failedRequests.push({
                        id: request.id,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            result.success = result.processedCount > 0;
            return result;

        } catch (error) {
            console.error("Erreur dans processApprovedRequests:", error);
            throw error;
        }
    }
}

export default new AccountJobService();