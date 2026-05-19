import type { Message } from "../types";
import { sendMessageToBot } from "./customApi";

export const sendMessageToGemini = async (
    message: string,
    history: Message[]
): Promise<string> => {
    const systemPrompt = history
        .filter((msg) => msg.text)
        .map((msg) => `${msg.sender === "user" ? "User" : "rizki"}: ${msg.text}`)
        .join("\n");

    return sendMessageToBot(message, systemPrompt);
};
