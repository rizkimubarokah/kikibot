import type { MedicalApiResponse, MedicalStats } from '../types/medical';

export const getMedicalFunFacts = async (birthDate: string): Promise<MedicalStats> => {
    try {
        const response = await fetch(`https://api.siputzx.my.id/api/fun/livefunfact?birthdate=${birthDate}`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data: MedicalApiResponse = await response.json();

        if (!data.status || !data.data) {
            throw new Error('Invalid data format received');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching medical facts:', error);
        throw error;
    }
};
