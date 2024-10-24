import { Request, Response, NextFunction } from 'express';
import { IRequestAuth } from '../interfaces/AuthInterface';
import { RoleEnum } from '../enums/RoleEnum';



const rolesValides: string[] = [
    RoleEnum.ADMIN, // Utilisation de l'énumération
    RoleEnum.AGENT, // Utilisation de l'énumération
    RoleEnum.CLIENT // Utilisation de l'énumération
];

export const roleMiddleware = (roles: string[]) => {
    // Vérifier si les rôles spécifiés dans le middleware sont tous valides
    const invalidRoles = roles.filter(role => !rolesValides.includes(role));
    if (invalidRoles.length > 0) {
        throw new Error(`Rôles invalides spécifiés : ${invalidRoles.join(', ')}`);
    }

    return (req: Request, res: Response, next: NextFunction) => {
        const reqAuth: IRequestAuth = req as IRequestAuth;
        const userRole = reqAuth.user?.role;
        // Vérifier si le rôle de l'utilisateur est valide et s'il fait partie des rôles autorisés
        if (!userRole || !rolesValides.includes(userRole) || !roles.includes(userRole)) {
            return res.status(403).json({
                message: 'Accès refusé. Vous n\'avez pas les autorisations nécessaires.',
                error: true,
                data: null
            });
        }
        next();
    };
};
