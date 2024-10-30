import { Date } from "mongoose";
import { AccountRequestStatus } from "../enums/AccountRequestStatus";


export interface CreateAccountRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    idCardFrontPhoto: string; // Type pour les fichiers Multer
    idCardBackPhoto: string;
}