import QRCode from 'qrcode';

export const generateQRCodeService = async (text: string, qrcode: boolean = true): Promise<Buffer | string> => {
    try {
        const code: string = "www.odc.groupe7.wave.com/" + text;
        const qrCodeDataURL = await QRCode.toDataURL(code);
        const base64Data = qrCodeDataURL.split(',')[1];
        if (!qrcode)
            return code;
        return Buffer.from(base64Data, 'base64');
    } catch (error) {
        throw new Error('Error generating QR code');
    }
};
