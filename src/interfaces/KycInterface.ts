import { KycStatus } from "../enums/KycStatus";
import { UserInterface } from "./UserInterface";

export interface KycInterface {
    id: string;
    userId: string;
    documentType: string;
    documentNumber: string;
    idCardFrontPhoto: string;
    idCardBackPhoto: string;
    verificationStatus: KycStatus;
    verifiedAt?: Date; // Optional
    verificationMethod?: string; // Optional
    rejectionReason?: string; // Optional
    user: UserInterface;
}
export interface KycCreate {
    userId: string;
    documentType: string;
    documentNumber: string;
    idCardFrontPhoto: string;
    idCardBackPhoto: string;
    verificationStatus: KycStatus;
    verifiedAt?: Date; // Optional
    verificationMethod?: string; // Optional
    rejectionReason?: string; // Optional
}
