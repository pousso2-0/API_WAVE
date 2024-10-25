import { z } from 'zod';
import {RoleEnum} from "../../enums/RoleEnum";

// Schéma de validation pour correspondre à l'interface creatUser
export const createUserSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    phoneNumber: z.string().regex(/^\+221(77|78|76|75)\d{7}$/, { message: "Numéro de téléphone invalide" }),
    password: z.string().min(4, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
    firstName: z.string().min(1, { message: "Le prénom est obligatoire" }),
    lastName: z.string().min(1, { message: "Le nom est obligatoire" }),
    dateOfBirth: z.preprocess((arg) => {
        if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    }, z.date({ message: "Date de naissance invalide" })),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    role: z.nativeEnum(RoleEnum, { message: "Rôle invalide" }),
});
// Schéma de validation pour la vérification de l'OTP
export const verifyOtpSchema = z.object({
    userId: z.string().uuid({ message: "ID utilisateur invalide" }),
    otp: z.number().min(100000, { message: "Code OTP incorrect" }).max(999999, { message: "Code OTP incorrect" }),
});

// Schéma de validation pour la connexion
export const loginSchema = z.object({
    phoneNumber: z.string().regex(/^(221)(77|78|76|75)[ ]?\d{7}$/, { message: "Numéro de téléphone invalide" }),
    password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

// Schéma de validation pour la réinitialisation du mot de passe via OTP
export const resetPasswordSchema = z.object({
    phoneNumber: z.string().regex(/^(221)(77|78|76|75)[ ]?\d{7}$/, { message: "Numéro de téléphone invalide" }),
    otp: z.number().min(100000, { message: "Code OTP incorrect" }).max(999999, { message: "Code OTP incorrect" }),
    newPassword: z.string().min(6, { message: "Le nouveau mot de passe doit contenir au moins 6 caractères" }),
});

// Schéma de validation pour la génération d'un OTP pour réinitialiser le mot de passe
export const generateResetOtpSchema = z.object({
    phoneNumber: z.string().regex(/^(221)(77|78|76|75)[ ]?\d{7}$/, { message: "Numéro de téléphone invalide" }),
});
