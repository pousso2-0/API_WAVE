import { Request, Response, NextFunction } from 'express';
import { IRequestAuth } from '../interfaces/AuthInterface';
import { RoleEnum } from '../enums/RoleEnum';



const rolesValides: RoleEnum[] = [
    RoleEnum.ADMIN, // Utilisation de l'énumération
    RoleEnum.AGENT, // Utilisation de l'énumération
    RoleEnum.CLIENT // Utilisation de l'énumération
];

export const roleMiddleware = (roles: RoleEnum[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const reqAuth: IRequestAuth = req as IRequestAuth;
        const userRole: RoleEnum = reqAuth.user?.role as RoleEnum;
        console.log(userRole, roles, rolesValides);

        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({
                message: 'Accès refusé. Vous n\'avez pas les autorisations nécessaires.',
                error: true,
                data: null
            });
        }
        next();
    };
};
