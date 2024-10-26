import prisma from "../config/prisma";
import {RoleEnum} from "../enums/RoleEnum";
import {CreateUserKyc, creatUser, userIncludes} from "../interfaces/UserInterface";
import {User} from "@prisma/client";
import HashService from "../security/hashService";
import {KycStatus} from "../enums/KycStatus";
import kycService from "./kycService";
import {KycCreate} from "../interfaces/KycInterface";
import {extractTextFromImage, parseIdentityData} from "../config/vision";

class UserService {
    async phoneExist(phone: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { phoneNumber: phone }, include: { role: true } });
    }

    // Fonction pour valider et créer un compte utilisateur
    async createUser(data: creatUser): Promise<User> {
        const roleId = await this.getRoleId(data.role);

        try {
            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    dateOfBirth: data.dateOfBirth,
                    address: data.address,
                    city: data.city,
                    country: data.country,
                    phoneNumber: data.phoneNumber,
                    passwordHash: await HashService.hash(data.password),
                    roleId,
                    isVerified: data.isVerified ?? false,
                    isActive: false,
                    kycStatus: data.kycStatus ?? KycStatus.PENDING,
                },
            });

            console.log(`User created with ID: ${user.id}`);
            return user;
        } catch (error: any) { // Utilisez 'any' ou 'unknown' et gérez-le correctement
            if (error.code === 'P2002') {
                console.error(`User with phone number ${data.phoneNumber} already exists`);
                throw new Error(`User with phone number ${data.phoneNumber} already exists`);
            } else {
                console.error('Error creating user:', error);
                throw new Error('Error creating user');
            }
        }
    }

    async getRoleId(role: RoleEnum) {
        const roleRecord = await prisma.role.findUnique({
            where: { name: role },
        });
        if (!roleRecord) {
            throw new Error(`Role ${role} not found`);
        }
        return roleRecord.id;
    }

    async createAgentOrAdmin(data: creatUser): Promise<User> {
        return await this.createUser(data);
    }
    async createClientByAgent(data: CreateUserKyc): Promise<User> {

        console.log('les donnee recuperer dans le services', data);
        try {
            return await prisma.$transaction(async (prismaClient) => {
                // Utilisation de la méthode createUser existante
                const {kyc, ...userData} = data;
                const user = await this.createUser(userData);

                // Si des données KYC sont fournies, utiliser le KycService
                if (kyc) {
                    const kycData: KycCreate = {
                        userId: user.id,
                        documentType: kyc.documentType,
                        documentNumber: kyc.documentNumber,
                        idCardFrontPhoto: kyc.idCardFrontPhoto,
                        idCardBackPhoto: kyc.idCardBackPhoto,
                        verificationStatus: kyc.verificationStatus,
                        verifiedAt: new Date(),
                        verificationMethod: kyc.verificationMethod,
                        rejectionReason: kyc.rejectionReason
                    };

                    await kycService.createKyc(kycData);
                }

                // Récupérer l'utilisateur avec ses données KYC
                const userWithKyc = await prisma.user.findUnique({
                    where: {id: user.id},
                    include: userIncludes
                });

                // Vérifier si l'utilisateur existe
                if (!userWithKyc) {
                    throw new Error("L'utilisateur créé n'a pas pu être retrouvé");
                }

                return userWithKyc;
            });
        } catch (error) {
            console.error("Erreur lors de la création du client avec KYC:", error);
            throw new Error("La création du client avec KYC a échoué.");
        }
    }

    async getUserById(userId: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: {id: userId},
            include: userIncludes,
        });
    }

    // Méthode pour lister les utilisateurs
    async listUsers(role?: RoleEnum): Promise<User[]> {
        const whereClause = role ? { role: { name: role } } : {};
        return prisma.user.findMany({
            where: whereClause,
            include: userIncludes,
        });
    }

    async deleteUser(userId: string): Promise<void> {
        try {
            await prisma.user.delete({
                where: { id: userId },
            });
            console.log(`User with ID: ${userId} deleted successfully`);
        } catch (error: any) {
            console.error('Error deleting user:', error);
            throw new Error('Error deleting user');
        }
    }

    async handleAccountRequest(accountRequestId: string) {
        try {
            console.log('=== Début du traitement de la demande ===');
            console.log('ID de la demande:', accountRequestId);

            const accountRequest = await prisma.accountCreationRequest.findUnique({
                where: { id: accountRequestId },
            });

            if (!accountRequest) {
                throw new Error("Request not found");
            }
            console.log('\n=== Extraction du texte - Face avant ===');
            const frontText = await extractTextFromImage(accountRequest.idCardFrontPhoto);
            console.log('Texte extrait (face avant):\n', frontText);

            console.log('\n=== Extraction du texte - Face arrière ===');
            const backText = await extractTextFromImage(accountRequest.idCardBackPhoto);
            console.log('Texte extrait (face arrière):\n', backText);

            console.log('\n=== Parsing des données - Face avant ===');
            const frontData = parseIdentityData(frontText!);
            console.log('Données parsées (face avant):', JSON.stringify(frontData, null, 2));

            console.log('\n=== Parsing des données - Face arrière ===');
            const backData = parseIdentityData(backText!);
            console.log('Données parsées (face arrière):', JSON.stringify(backData, null, 2));

            // Fusionner les données en privilégiant les données non vides
            const mergedData = Object.entries(frontData).reduce((acc, [key, value]) => {
                acc[key] = value || backData[key as keyof typeof backData] || '';
                return acc;
            }, {} as Record<string, string>);

            console.log('\n=== Données fusionnées ===');
            console.log(JSON.stringify(mergedData, null, 2));
            return mergedData;
        } catch (error) {
            console.error('Erreur lors du traitement de la demande:', error);
            throw error;
        }
    }


}
export default new UserService();
