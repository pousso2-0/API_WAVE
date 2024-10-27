import { Request, Response } from "express";
import Controller from "./controller";
import transactionService from "../services/transactionService";
import { RoleEnum } from "../enums/RoleEnum";

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

}

export default new TransactionController();