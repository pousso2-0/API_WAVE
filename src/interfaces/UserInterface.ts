import { KycStatus } from "../enums/KycStatus";
import { ContactInterface } from "./ContactInterface";
import { KycInterface } from "./KycInterface";
import { NotificationInterface } from "./NotificationInterface";
import { WalletInterface } from "./WalletInterface";

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