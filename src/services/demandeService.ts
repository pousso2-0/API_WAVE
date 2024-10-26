import { PrismaClient } from '@prisma/client';
import { CreateAccountRequest } from '../interfaces/DemandeInterface';
import { AccountRequestStatus } from '../enums/AccountRequestStatus';

const prisma = new PrismaClient();

 class DemandeService {
     async checkPhoneNumberExists(phoneNumber: string): Promise<boolean> {
         // Rechercher dans la table user
         const userExists = await prisma.user.findUnique({
             where: {
                 phoneNumber: phoneNumber,
             },
         });

         // Rechercher dans la table demande
         const demandeExists = await prisma.accountCreationRequest.findUnique({
             where: {
                 phoneNumber: phoneNumber,
             },
         });

         // Retourne true si le numéro existe dans l'une des deux tables
         return !!userExists || !!demandeExists;
     }

     // Créer une nouvelle demande de création de compte
     async createAccountRequest(data: CreateAccountRequest) {
         const phoneNumberExists = await this.checkPhoneNumberExists(data.phoneNumber);

         if (phoneNumberExists) {
             throw new Error('Le numéro de téléphone existe déjà dans le système.');
         }

         return prisma.accountCreationRequest.create({
             data: {
                 firstName: data.firstName,
                 lastName: data.lastName,
                 email: data.email || 'demande@gmail.com',
                 phoneNumber: data.phoneNumber,
                 idCardFrontPhoto: data.idCardFrontPhoto,
                 idCardBackPhoto: data.idCardBackPhoto,
                 status: AccountRequestStatus.PENDING,
             },
         });
     }

     // Obtenir toutes les demandes ou filtrer par statut
    async getAccountRequests(status?: AccountRequestStatus) {
        return prisma.accountCreationRequest.findMany({
            where: status ? {status} : {},
        });
    }

    // Mettre à jour le statut de la demande (APPROVED ou REJECTED)
    async updateRequestStatus(id: string, status: AccountRequestStatus) {
        return prisma.accountCreationRequest.update({
            where: {id},
            data: {status},
        });
    }
}

export default new DemandeService()