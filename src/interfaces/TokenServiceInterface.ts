
export interface TokenServiceInterface {
    generateToken(userId: number): Promise<string>;
    validateToken(token: string): Promise<any | null>;
    invalidateToken(token: string): Promise<any>;
}
