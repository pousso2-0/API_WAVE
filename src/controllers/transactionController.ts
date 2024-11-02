import { Request, Response } from "express";
import Controller from "./controller";
import transactionService from "../services/transactionService";
import { RoleEnum } from "../enums/RoleEnum";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { transactionSchema } from "../validations/transactionValidate";
import { log } from "console";

class TransactionController extends Controller {


    private async checkWalletAccess(
        walletId: string,
        req: Request
    ): Promise<boolean> {
        const userAuth = this.getUserRequest(req);

        if (userAuth.role !== RoleEnum.CLIENT) return true;

        const wallet = await transactionService.getWallet(walletId);
        return wallet?.userId === userAuth.userId;
    }

    private async checkTransactionAccess(
        transactionId: string,
        req: Request
    ): Promise<boolean> {
        const userAuth = this.getUserRequest(req);

        if (userAuth.role === RoleEnum.ADMIN) return true;

        const transaction = await transactionService.getById(transactionId);
        return transaction?.id === userAuth.userId;
    }

    public async getAll(req: Request, res: Response) {
        return this.trycatch(async () => {
            const params = this.getPaginationParams(req);
            const timeFrame = this.getTimeFrameParam(req);

            const result = await transactionService.getAll(
                params.page,
                params.limit,
                timeFrame
            );

            const response = this.createPaginatedResponse(
                result,
                "Toutes les transactions",
                params
            );

            return res.status(200).json(response);
        }, res);
    }

    public async getAllByUser(req: Request, res: Response) {
        return this.trycatch(async () => {
            const userAuth = this.getUserRequest(req);
            const userId = req.params.id;
            const params = this.getPaginationParams(req);
            const timeFrame = this.getTimeFrameParam(req);

            if (userAuth.role === RoleEnum.CLIENT && userId !== userAuth.userId) {
                const errorResponse = this.createErrorResponse(
                    "Vous n'êtes pas autorisé à voir ces transactions"
                );
                return res.status(403).json(errorResponse);
            }

            const result = await transactionService.getAllByUser(
                userId,
                params.page,
                params.limit,
                timeFrame
            );

            const response = this.createPaginatedResponse(
                result,
                `Transactions de l'utilisateur avec l'id: ${userId}`,
                params
            );

            return res.status(200).json(response);
        }, res);
    }

    public async getAllByWallet(req: Request, res: Response) {
        return this.trycatch(async () => {
            const walletId = req.params.id;
            const params = this.getPaginationParams(req);
            const timeFrame = this.getTimeFrameParam(req);

            const hasAccess = await this.checkWalletAccess(walletId, req);
            if (!hasAccess) {
                const errorResponse = this.createErrorResponse(
                    "Vous n'êtes pas autorisé à voir les transactions de ce portefeuille"
                );
                return res.status(403).json(errorResponse);
            }

            const result = await transactionService.getAllByWallet(
                walletId,
                params.page,
                params.limit,
                timeFrame
            );

            const response = this.createPaginatedResponse(
                result,
                `Transactions du portefeuille avec l'id: ${walletId}`,
                params
            );

            return res.status(200).json(response);
        }, res);
    }

    public async getByid(req: Request, res: Response) {
        return this.trycatch(async () => {
            const userAuth = this.getUserRequest(req);
            const id: string = req.params.id;
            const transaction = transactionService.getById(id);

            if (userAuth.role !== RoleEnum.ADMIN && await this.checkTransactionAccess(id, req)) {
                const errorResponse = this.createErrorResponse(
                    "Vous n'êtes pas autorisé à voir ces transactions"
                );
                return res.status(403).json(errorResponse);
            }
            if (!transaction)
                return res.status(404).json(this.createErrorResponse(`La transaction avec l'id: ${id} n'exist pas`));
            return res.status(200).json(this.createSuccesResponse(`La transaction avec l'id: ${id}`, transaction));
        }, res);
    }

    private async handleTransactionCreation(
        req: Request,
        res: Response,
        type: TransactionType,
        allowedRoles: RoleEnum[],
        feeAmount: number = 0,
        senderWalletId: string | null = null,
        receiverWalletId: string | null = null,
    ) {
        return this.trycatch(async () => {
            const validation = transactionSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessages = validation.error.errors.map(e => e.message).join(", ");
                return res.status(400).json(this.createErrorResponse(`Données invalides : ${errorMessages}`));
            }
            const { amount, currency, description } = validation.data;

            const userAuth = this.getUserRequest(req);

            if (!senderWalletId)
                senderWalletId = validation.data.senderWalletId;
            if (!receiverWalletId)
                receiverWalletId = validation.data.receiverWalletId;

            // Vérification du rôle
            if (!allowedRoles.includes(userAuth.role as RoleEnum)) {
                return res.status(403).json(this.createErrorResponse("Vous n'êtes pas autorisé à effectuer cette transaction"));
            }

            // Vérification de l'accès au portefeuille émetteur (si applicable)
            if (senderWalletId) {
                const hasAccess = await this.checkWalletAccess(senderWalletId, req);
                if (!hasAccess) {
                    return res.status(403).json(this.createErrorResponse("Vous n'avez pas accès au portefeuille émetteur"));
                }
            }

            // // Vérification de l'accès au portefeuille récepteur (si applicable)
            // if (receiverWalletId) {
            //     const hasAccess = await this.checkWalletAccess(receiverWalletId, req);
            //     if (!hasAccess) {
            //         return res.status(403).json(this.createErrorResponse("Vous n'avez pas accès au portefeuille récepteur"));
            //     }
            // }

            // Création de la transaction
            const transaction = await transactionService.createTransaction(
                senderWalletId || "",
                receiverWalletId || "",
                type,
                amount,
                currency,
                description,
                feeAmount
            );

            if (!transaction) {
                res.status(400).json(this.createErrorResponse("La transaction à échoue"));
            }

            return res.status(201).json(this.createSuccesResponse("Transaction créée avec succès", transaction));
        }, res);
    }

    // Méthode pour les dépôts
    public async createDeposit(req: Request, res: Response) {
        const walletId: string = req.body.senderWalletId;
        const wallet = await transactionService.getWallet(walletId);
        const userAuth = this.getUserRequest(req);


        if (wallet && wallet?.userId != userAuth.userId)
            return res.status(403).json(this.createErrorResponse("Vous n'êtes pas le propriètaire de cette portfeuille"));
        if (userAuth.role as RoleEnum != RoleEnum.AGENT)
            return res.status(403).json(this.createErrorResponse("Vous n'êtes pas autorisé à effectuer cette transaction"));


        return this.handleTransactionCreation(
            req,
            res,
            TransactionType.DEPOSIT,
            [RoleEnum.AGENT]
        );
    }

    // Méthode pour les retraits
    public async createWithdrawal(req: Request, res: Response) {
        
        const walletId: string = req.body.senderWalletId;
        const receiverId: string = req.body.receiverWalletId;

        if(!walletId && !receiverId)
            return res.status(400).json(this.createErrorResponse("Le senderWalletId et le receiverWalletId est requise"));

        const wallet = await transactionService.getWallet(walletId, true);
        
        const receiver = await transactionService.getWallet(receiverId, true);
        const userAuth = this.getUserRequest(req);
        if (receiver && receiver?.userId != userAuth.userId)
            return res.status(403).json(this.createErrorResponse("Vous n'êtes pas le propriètaire de cette portfeuille"));
        if (userAuth.role as RoleEnum != RoleEnum.AGENT)
            return res.status(403).json(this.createErrorResponse("Vous n'êtes pas autorisé à effectuer cette transaction"));
        if (wallet && wallet.user.role.name != RoleEnum.CLIENT)
            return res.status(404).json(this.createErrorResponse("Vous ne pouvez pas effectuer un retrait pour un autre qui n'est pas client"));
        return this.handleTransactionCreation(
            req,
            res,
            TransactionType.WITHDRAWAL,
            [RoleEnum.AGENT],
        );
    }

    // Méthode pour les transferts
    public async createTransfer(req: Request, res: Response) {

        return this.handleTransactionCreation(
            req,
            res,
            TransactionType.TRANSFERE,
            [RoleEnum.CLIENT, RoleEnum.AGENT, RoleEnum.ADMIN],
            (Number(req.body.amount / 100))
        );
    }

    public async addBalanceToUserAgent(req: Request, res: Response): Promise<any> {
        const { userAgentWalletId, amount } = req.body;

        const errorResponse = (message: string) => res.status(400).json(this.createErrorResponse(message));

        if (!userAgentWalletId || amount === undefined || amount === null) {
            return errorResponse('ID de portefeuille et montant requis.');
        }

        const amountNumber = Number(amount);
        if (isNaN(amountNumber)) {
            return errorResponse("Le montant doit être un nombre valide.");
        }

        const userAuth = this.getUserRequest(req);
        if (userAuth.role !== RoleEnum.ADMIN) {
            return res.status(403).json(this.createErrorResponse("Vous n'êtes pas autorisé à effectuer cette action."));
        }

        // Bloc try-catch pour gérer les erreurs de transaction
        return this.trycatch(async () => {
            const updatedWallet = await transactionService.addBalanceToUserAgent(userAgentWalletId, amountNumber);
            return res.status(200).json(this.createSuccesResponse("Le portefeuille a bien été rechargé.", updatedWallet));
        }, res);
    }

}

export default new TransactionController();
