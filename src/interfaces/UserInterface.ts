import { KycStatus } from "../enums/KycStatus";
import { ContactInterface } from "./ContactInterface";
import { KycInterface } from "./KycInterface";
import { NotificationInterface } from "./NotificationInterface";
import { WalletInterface } from "./WalletInterface";
import {RoleEnum} from "../enums/RoleEnum";

export interface UserInterface {
    id: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    address?: string;
    city?: string;
    country?: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    kycStatus: KycStatus;
    wallets: WalletInterface[];
    notifications: NotificationInterface[];
    kyc?: KycInterface;
    contacts: ContactInterface[];
    contactList: ContactInterface[];
}
export interface creatUser{
    email: string;
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    address?: string;
    city?: string;
    country?: string;
    role: RoleEnum;
    kycStatus?: KycStatus;
    isVerified?: boolean;
    isActive?: boolean;
}

// Interface pour la mise à jour d'un utilisateur
export interface UpdateUser {
    id: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    photo?:string;
    currentPassword?: string; // Mot de passe actuel pour la validation
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    address?: string;
    city?: string;
    country?: string;
    role?: RoleEnum;
    kycStatus?: KycStatus;
    isVerified?: boolean;
    isActive?: boolean;}

export interface CreateUserKyc extends creatUser {
    kyc?: {
        documentType: string;
        documentNumber: string;
        idCardFrontPhoto: string;
        idCardBackPhoto: string;
        verificationStatus: KycStatus;
        verificationMethod?: string;
        rejectionReason?: string;
    }
}
export interface User {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    photo: string | null; // Permettre null
    address: string | null; // Permettre null
}


export const userIncludes = {
    wallets: {
        include: {
            user: true, // Inclure l'objet user
            sentTransactions: {
                include: {
                     receiverWallet: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    phoneNumber: true,
                                },
                            },
                        },
                    },
                },
            },
            receivedTransactions: {
                include: {
                    senderWallet: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    phoneNumber: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    notifications: true,
    kyc: true,
    contacts: true,
    contactList: true,
};

export const searchUserIncludes = {
    include: {
        wallets: {
            select: {
                id: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                        email: true,
                        photo: true
                    }
                }
            }
        }
    }
};