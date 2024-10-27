import { z } from 'zod';
import { RoleEnum } from "../enums/RoleEnum";
import { AccountRequestStatus } from "@prisma/client";

export const CreateAccountRequestSchema = z.object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    email: z.string().email({ message: "Email invalide" }),
    phoneNumber: z.string().regex(/^\+221(77|78|76|75)\d{7}$/, { message: "Numéro de téléphone invalide" }),
    idCardFrontPhoto: z.object({
        path: z.string().min(1, "Le chemin de la photo avant est requis")
    }),
    idCardBackPhoto: z.object({
        path: z.string().min(1, "Le chemin de la photo arrière est requis")
    })
});

// Schemas de validation
export const verifyCodeSchema = z.object({
    phoneNumber: z.string().min(1, "Le numéro de téléphone est requis"),
    code: z.string().min(1, "Le code est requis")
});

export const updatePasswordSchema = z.object({
    userId: z.string().min(1, "L'ID utilisateur est requis"),
    newPassword: z.string().length(4, "Le mot de passe doit contenir exactement 4 caractères")
});
