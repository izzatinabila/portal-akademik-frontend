
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Academic Advisor will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getAcademicAdvice = async (ipk: number, goal: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Fitur saran akademik tidak tersedia karena API Key belum diatur.";
    }

    const prompt = `
    Anda adalah seorang penasihat akademik yang berpengalaman dan suportif.
    Seorang mahasiswa memiliki IPK saat ini sebesar ${ipk.toFixed(2)}.
    Tujuan mereka adalah: "${goal}".

    Berikan 3 hingga 5 tips yang singkat, jelas, dan dapat ditindaklanjuti untuk membantu mereka mencapai tujuan tersebut.
    Fokus pada strategi belajar, manajemen waktu, dan kebiasaan baik lainnya.
    Gunakan bahasa Indonesia yang memotivasi dan mudah dipahami.
    Format jawaban Anda sebagai daftar bernomor (numbered list) dalam format Markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching academic advice:", error);
        return "Maaf, terjadi kesalahan saat mencoba mendapatkan saran. Silakan coba lagi nanti.";
    }
};