import prisma from "../config/prisma";
import {extractTextFromImage, parseIdentityCardText} from "../config/vision";
import {RoleEnum} from "../enums/RoleEnum";
import {creatUser} from "../interfaces/UserInterface";
import {User} from "@prisma/client";
import HashService from "../security/hashService";
import {KycStatus} from "../enums/KycStatus";
import {promises} from "node:dns";

export default new class userService {
    phoneExist(phone: string): Promise<any> {
        return prisma.user.findUnique({ where: { phoneNumber: phone }, include: { role: true } });
    }

// Fonction pour gérer la demande de création de compte
async  handleAccountRequest(accountRequestId: string) {
    const accountRequest = await prisma.accountCreationRequest.findUnique({
        where: { id: accountRequestId },
    });

    if (!accountRequest) throw new Error("Request not found");

    // Extraire les informations des photos de la carte d'identité
    const frontText = await extractTextFromImage(accountRequest.idCardFrontPhoto);
    const backText = await extractTextFromImage(accountRequest.idCardBackPhoto);

    // Parser les informations extraites
    const frontData = parseIdentityCardText(frontText!);
    const backData = parseIdentityCardText(backText!);

    console.log('Informations extraites:', { ...frontData, ...backData });
}

// Fonction pour valider et créer un compte utilisateur
async  createUser(data:creatUser) : Promise<User> {
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
                isVerified: false,
                isActive: false,
                kycStatus: KycStatus.PENDING,
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

async  getRoleId(role: RoleEnum) {
    const roleRecord = await prisma.role.findUnique({
        where: { name: role },
    });
    if (!roleRecord) {
        throw new Error(`Role ${role} not found`);
    }
    return roleRecord.id;
}

async  createAgent(data:creatUser): Promise<User>{
    return await this.createUser(data);
}
}