import Tesseract from 'tesseract.js';

// Fonction d'extraction de texte à partir d'une image
export async function extractTextFromImage(imagePath: string) {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePath, // Pour les fichiers locaux ou les URLs
            'eng', // Spécifiez la langue ici
            {
                logger: m => console.log(m) // Journaliser l'état de la reconnaissance
            }
        );
        console.log('Extracted Text:', text);
        return text; // Retourner le texte extrait
    } catch (error) {
        console.error('Error during OCR processing:', error);
        throw new Error('Failed to extract text from image');
    }
}

// Fonction pour parser le texte extrait de la carte d'identité
export function parseIdentityCardText(text: string) {
    const lines = text.split('\n');
    const parsedData = {
        firstName: '',
        lastName: '',
        documentNumber: '',
        dateOfBirth: ''
    };

    lines.forEach((line) => {
        if (line.startsWith('Nom')) {
            parsedData.lastName = line.replace('Nom:', '').trim();
        }
        if (line.startsWith('Prénom')) {
            parsedData.firstName = line.replace('Prénom:', '').trim();
        }
        if (line.startsWith('N°')) {
            parsedData.documentNumber = line.replace('N°:', '').trim();
        }
        if (line.match(/(\d{2}\/\d{2}\/\d{4})/)) {
            parsedData.dateOfBirth = line.match(/(\d{2}\/\d{2}\/\d{4})/)![0];
        }
    });

    return parsedData;
}
