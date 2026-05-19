
export type Season = 'curah-hujan-tinggi' | 'kemarau' | 'pancaroba'; // Adapted for Indonesia (Tropical) or stick to 4 seasons?
// User asked for "musim di dunia ini sekarang" (season in this world now).
// Since often "Season" implies the 4 seasons (Winter, Spring, Summer, Autumn) in global context, let's use standard northern hemisphere for "World" feel, 
// OR simpler: Just standard 4 seasons as requested (Snow in Dec-Feb).

export type GlobalSeason = 'winter' | 'spring' | 'summer' | 'autumn';
export type TimeOfDay = 'morning' | 'day' | 'sore' | 'night';

export const getSeason = (): GlobalSeason => {
    const month = new Date().getMonth(); // 0-11

    // Northern Hemisphere standard
    if (month === 11 || month === 0 || month === 1) return 'winter';
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    return 'autumn';
};

export const getTimeOfDay = (): TimeOfDay => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11) return 'morning'; // 05:00 - 10:59
    if (hour >= 11 && hour < 15) return 'day';    // 11:00 - 14:59
    if (hour >= 15 && hour < 19) return 'sore';   // 15:00 - 18:59
    return 'night';                               // 19:00 - 04:59
};

export const getAutoThemeConfig = () => {
    const season = getSeason();
    const time = getTimeOfDay();

    // Map time to colors
    let bgGradient = '';

    switch (time) {
        case 'morning':
            bgGradient = 'linear-gradient(to bottom, #60a5fa, #bfdbfe)'; // Blue sky
            break;
        case 'day':
            bgGradient = 'linear-gradient(to bottom, #3b82f6, #93c5fd)'; // Bright blue
            break;
        case 'sore':
            bgGradient = 'linear-gradient(to bottom, #f59e0b, #7c3aed)'; // Orange to Purple (Sunset)
            break;
        case 'night':
        default:
            bgGradient = 'linear-gradient(to bottom, #0f172a, #312e81)'; // Dark
            break;
    }

    return { season, time, bgGradient };
};
