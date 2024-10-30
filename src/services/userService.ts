import prisma from "../config/prisma";
import {RoleEnum} from "../enums/RoleEnum";
import {CreateUserKyc, creatUser, UpdateUser, userIncludes} from "../interfaces/UserInterface";
import {User} from "@prisma/client";
import HashService from "../security/hashService";
import {KycStatus} from "../enums/KycStatus";
import kycService from "./kycService";
import {KycCreate} from "../interfaces/KycInterface";
import {extractTextFromImage, parseIdentityData} from "../config/vision";
import { WalletService } from "./walletService";
import bcrypt from "bcryptjs";

class UserService {

    async phoneExist(phone: string): Promise<User | null> {
        console.log('Numéro de téléphone recherché:', phone);
        try {
            const phonecl = await prisma.user.findUnique({
                where: { phoneNumber: phone },
                include: { role: true }
            });
            console.log('Résultat trouvé:', phonecl);
            return phonecl;
        } catch (error) {
            console.error('Erreur rencontrée lors de la recherche de l\'utilisateur:', error);
            return null;  // Assurez-vous que `null` est retourné en cas d'erreur
        }
    }



    // Fonction pour valider et créer un compte utilisateur
    async createUser(data: creatUser): Promise<User> {
        const roleId = await this.getRoleId(data.role);

        // Commencez la transaction avec Prisma
        try {
            const result = await prisma.$transaction(async (prisma) => {
                // Créer l'utilisateur
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
                        isActive: data.isActive ?? false,
                        kycStatus: data.kycStatus ?? KycStatus.PENDING,
                    },
                });
                // Créer automatiquement un wallet pour les utilisateurs non-admin
                if (data.role !== RoleEnum.ADMIN) {
                    const walletService = WalletService.getInstance();
                    await walletService.createWallet({
                        userId: user.id
                    });
                }
                console.log(`User created with ID: ${user.id}`);

                return user;
            });

            return result; // Retourner l'utilisateur créé si tout réussit
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.error(`User with phone number ${data.phoneNumber} already exists`);
                throw new Error(`User with phone number ${data.phoneNumber} already exists`);
            } else {
                console.error('Error creating user and wallet:', error);
                throw new Error('Error creating user and wallet');
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
    async updateUser(data: UpdateUser): Promise<User> {
        try {
            // Vérifier si l'utilisateur existe
            const existingUser = await this.getUserById(data.id);
            if (!existingUser) {
                throw new Error('Utilisateur non trouvé');
            }

            // Si le numéro de téléphone est modifié, vérifier s'il n'existe pas déjà
            if (data.phoneNumber && data.phoneNumber !== existingUser.phoneNumber) {
                const phoneExists = await this.phoneExist(data.phoneNumber);
                if (phoneExists) {
                    throw new Error('Ce numéro de téléphone est déjà utilisé');
                }
            }
            // Vérifier si le mot de passe actuel est correct
            if (data.currentPassword ) {
                // Vérifier si le mot de passe actuel est correct
                const isPasswordValid: boolean = await bcrypt.compare(data.currentPassword, existingUser.passwordHash);
                if (!isPasswordValid) {
                    throw new Error('Les mots de passe utiliser ne corresponde pas');

                }
                // Vérifier si le mdp est modifié,
                if (data.password) {
                    existingUser.passwordHash = await HashService.hash(data.password);
                }
            }
            // Vérifier si le mail est modifié,
            if (data.email) {
                const emailExists = await this.emailExist(data.email);
                if (emailExists && emailExists.id!== data.id) {
                    throw new Error('Cet email est déjà utilisé');
                }
            }
            // Vérifier si le role est modifié,
            if (data.role) {
                existingUser.roleId = await this.getRoleId(data.role);
            }

            // Vérifier si le kycStatus est modifié,
            if (data.kycStatus) {
                existingUser.kycStatus = data.kycStatus;
            }

            // Mise à jour de l'utilisateur
            return await prisma.user.update({
                where: {id: data.id},
                data: {
                    email: data.email,
                    firstName: data.firstName,
                    photo: data.photo,
                    passwordHash: existingUser.passwordHash,
                    lastName: data.lastName,
                    dateOfBirth: data.dateOfBirth,
                    address: data.address,
                    city: data.city,
                    country: data.country,
                    phoneNumber: data.phoneNumber,
                    isVerified: data.isVerified,
                    isActive: data.isActive,
                    kycStatus: data.kycStatus,
                    roleId: existingUser.roleId,

                },
                include: userIncludes,
            });
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }


    private async emailExist(email: string) {
        return prisma.user.findUnique({ where: { email } });

    }
}
export default new UserService();
