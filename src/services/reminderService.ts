export type Reminder = {
    id: string;
    text: string;
    timestamp: number;
    isCompleted: boolean;
};

// Key for storage
const STORAGE_KEY = 'chat_reminders';

export const getReminders = (): Reminder[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
};

export const saveReminder = (reminder: Reminder) => {
    const reminders = getReminders();
    reminders.push(reminder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
};

export const markReminderComplete = (id: string) => {
    const reminders = getReminders();
    const updated = reminders.map(r => r.id === id ? { ...r, isCompleted: true } : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const checkDueReminders = (): Reminder[] => {
    const reminders = getReminders();
    const now = Date.now();
    // Return reminders that are due (passed timestamp) and NOT completed
    // We allow a small buffer window so we don't miss slightly old ones if app was closed, 
    // but typically we just check !isCompleted && timestamp <= now
    return reminders.filter(r => !r.isCompleted && r.timestamp <= now);
};

// Helper: Parse time string
// Supporting formats:
// - "10 menit lagi" / "1 jam lagi"
// - "jam 14:00" / "pukul 08.30"
export const parseReminderRequest = (input: string): { text: string; time: number } | null => {
    const now = Date.now();

    // Pattern 1: Relative time (e.g., "ingatkan ... 10 menit lagi")
    // Regex matches: "... (X) (menit/jam/detik) lagi"
    const relativeRegex = /(.+?)\s+(\d+)\s+(menit|jam|detik|second|minute|hour)\s+lagi/i;
    const relMatch = input.match(relativeRegex);

    if (relMatch) {
        const text = relMatch[1].replace(/ingatkan\s+(aku\s+)?/i, '').trim();
        const amount = parseInt(relMatch[2]);
        const unit = relMatch[3].toLowerCase();

        let multiplier = 1000; // seconds
        if (unit.includes('menit') || unit.includes('minute')) multiplier = 60 * 1000;
        if (unit.includes('jam') || unit.includes('hour')) multiplier = 60 * 60 * 1000;

        return {
            text,
            time: now + (amount * multiplier)
        };
    }

    // Pattern 2: Absolute time (e.g., "ingatkan ... jam 14:00")
    // Regex matches: "... (jam/pukul) HH:MM"
    const absoluteRegex = /(.+?)\s+(?:jam|pukul|at)\s+(\d{1,2})[:.](\d{2})/i;
    const absMatch = input.match(absoluteRegex);

    if (absMatch) {
        const text = absMatch[1].replace(/ingatkan\s+(aku\s+)?/i, '').trim();
        const hours = parseInt(absMatch[2]);
        const minutes = parseInt(absMatch[3]);

        const targetDate = new Date();
        targetDate.setHours(hours, minutes, 0, 0);

        // If target time is earlier than now, assume it's for tomorrow
        if (targetDate.getTime() < now) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        return {
            text,
            time: targetDate.getTime()
        };
    }

    return null;
};
