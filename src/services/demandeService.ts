import { PrismaClient } from "@prisma/client";
import { DemandeInterface } from "../interfaces/DemandeInterface";
import { PaginationParams } from "../interfaces/PaginationParams";




import { ApiResponse } from "../interfaces/ApiResponse";

const prisma = new PrismaClient();

class demandeService {
    private validatePhoneNumber(phoneNumber: string): boolean {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber);
    }

    private validateIdCardPhotos(frontPhoto: string, backPhoto: string): boolean {
        const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png)$/i;
        return urlRegex.test(frontPhoto) && urlRegex.test(backPhoto);
    }

    private async checkExistingRequest(phoneNumber: string): Promise<boolean> {
        const existingRequest = await prisma.accountCreationRequest.findFirst({
            where: {
                phoneNumber,
                status: 'PENDING'
            }
        });
        return !!existingRequest;
    }

    private async checkExistingUser(phoneNumber: string): Promise<boolean> {
        const existingUser = await prisma.user.findUnique({
            where: { phoneNumber }
        });
        return !!existingUser;
    }

    async createDemande(demandeData: Omit<DemandeInterface, 'id' | 'createdAt' | 'status'>): Promise<ApiResponse<DemandeInterface>> {
        try {
            // Validation des données
            if (!this.validatePhoneNumber(demandeData.phoneNumber)) {
                return {
                    data: null,
                    message: "Format de numéro de téléphone invalide",
                    error: true
                };
            }

            if (!this.validateIdCardPhotos(demandeData.idCardFrontPhoto, demandeData.idCardBackPhoto)) {
                return {
                    data: null,
                    message: "Format des photos de carte d'identité invalide",
                    error: true
                };
            }

            const existingRequest = await this.checkExistingRequest(demandeData.phoneNumber);
            if (existingRequest) {
                return {
                    data: null,
                    message: "Une demande en attente existe déjà pour ce numéro de téléphone",
                    error: true
                };
            }

            const existingUser = await this.checkExistingUser(demandeData.phoneNumber);
            if (existingUser) {
                return {
                    data: null,
                    message: "Un compte existe déjà avec ce numéro de téléphone",
                    error: true
                };
            }

            const newDemande = await prisma.accountCreationRequest.create({
                data: {
                    firstName: demandeData.firstName,
                    lastName: demandeData.lastName,
                    phoneNumber: demandeData.phoneNumber,
                    idCardFrontPhoto: demandeData.idCardFrontPhoto,
                    idCardBackPhoto: demandeData.idCardBackPhoto,
                    status: 'PENDING'
                }
            });

            return {
                data: newDemande as unknown as DemandeInterface,
                message: "Demande créée avec succès",
                error: false
            };

        } catch (error) {
            console.error('Erreur lors de la création de la demande:', error);
            return {
                data: null,
                message: "Erreur lors de la création de la demande",
                error: true
            };
        }
    }

    async listDemandes(params: PaginationParams): Promise<ApiResponse<DemandeInterface[]>> {
        try {
            const { page, limit } = params;
            const offset = limit * (page - 1);
    
            const demandes = await prisma.accountCreationRequest.findMany({
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            });
    
            const totalDemandes = await prisma.accountCreationRequest.count();
    
            return {
                data: demandes as unknown as DemandeInterface[],
                message: "Demandes récupérées avec succès",
                error: false,
                pagination: {
                    currentPage: page,
                    itemsPerPage: limit,
                    totalItems: totalDemandes,
                    totalPages: Math.ceil(totalDemandes / limit),
                }
            };
    
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            return {
                data: null,
                message: "Erreur lors de la récupération des demandes",
                error: true
            };
        }
    }
    

    async updateDemande(id: string, updateData: { phoneNumber?: string, idCardFrontPhoto?: string, idCardBackPhoto?: string }): Promise<ApiResponse<DemandeInterface>> {
        try {
            const existingDemande = await prisma.accountCreationRequest.findUnique({ where: { id } });
            if (!existingDemande) {
                return { data: null, message: "Demande non trouvée", error: true };
            }

            if (updateData.phoneNumber && !this.validatePhoneNumber(updateData.phoneNumber)) {
                return { data: null, message: "Format de numéro de téléphone invalide", error: true };
            }

            if (updateData.phoneNumber && existingDemande.phoneNumber !== updateData.phoneNumber) {
                const existingUserWithPhone = await this.checkExistingUser(updateData.phoneNumber);
                if (existingUserWithPhone) {
                    return { data: null, message: "Ce numéro de téléphone est déjà utilisé", error: true };
                }
            }

            if (updateData.idCardFrontPhoto && updateData.idCardBackPhoto &&
                !this.validateIdCardPhotos(updateData.idCardFrontPhoto, updateData.idCardBackPhoto)) {
                return { data: null, message: "Format des photos de carte d'identité invalide", error: true };
            }

            const updatedDemande = await prisma.accountCreationRequest.update({
                where: { id },
                data: updateData
            });

            return { data: updatedDemande as unknown as DemandeInterface, message: "Demande mise à jour avec succès", error: false };

        } catch (error) {
            console.error('Erreur lors de la mise à jour de la demande:', error);
            return { data: null, message: "Erreur lors de la mise à jour de la demande", error: true };
        }
    }

    async deleteDemande(id: string): Promise<ApiResponse<null>> {
        try {
            const existingDemande = await prisma.accountCreationRequest.findUnique({
                where: { id }
            });

            if (!existingDemande) {
                return {
                    data: null,
                    message: "Demande non trouvée",
                    error: true
                };
            }

            await prisma.accountCreationRequest.delete({
                where: { id }
            });

            return {
                data: null,
                message: "Demande supprimée avec succès",
                error: false
            };

        } catch (error) {
            console.error('Erreur lors de la suppression de la demande:', error);
            return {
                data: null,
                message: "Erreur lors de la suppression de la demande",
                error: true
            };
        }
    }
}

export default new demandeService();