import { Router } from "express";
import transactionController from "../controllers/transactionController";
import authMiddleware from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { RoleEnum } from "../enums/RoleEnum";



const transactionRoute: Router = Router();

transactionRoute.get(
    "/all", 
    authMiddleware, 
    roleMiddleware([RoleEnum.ADMIN]), 
    transactionController.getAll.bind(transactionController)
);

transactionRoute.get(
    "/user/:id/all", 
    authMiddleware, 
    roleMiddleware([RoleEnum.ADMIN, RoleEnum.CLIENT]), 
    transactionController.getAllByUser.bind(transactionController)
);

transactionRoute.get(
    "/wallet/:id/all", 
    authMiddleware, 
    transactionController.getAllByWallet.bind(transactionController)
);

// Route pour la création d'un dépôt (agents uniquement)
transactionRoute.post(
    "/deposit",
    authMiddleware,
    roleMiddleware([RoleEnum.AGENT]),
    transactionController.createDeposit.bind(transactionController)
);

// Route pour la création d'un retrait (agents uniquement)
transactionRoute.post(
    "/withdrawal",
    authMiddleware,
    roleMiddleware([RoleEnum.AGENT]),
    transactionController.createWithdrawal.bind(transactionController)
);

// Route pour la création d'un transfert (clients, agents, et administrateurs)
transactionRoute.post(
    "/transfer",
    authMiddleware,
    roleMiddleware([RoleEnum.CLIENT, RoleEnum.AGENT, RoleEnum.ADMIN]),
    transactionController.createTransfer.bind(transactionController)
);

transactionRoute.post(
    "/add-balance",
    authMiddleware,
    roleMiddleware([RoleEnum.ADMIN]),
    transactionController.addBalanceToUserAgent.bind(transactionController)
)

export default transactionRoute;    