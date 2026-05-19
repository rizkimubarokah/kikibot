const CharacterAI = require('node_characterai');
const characterAI = new CharacterAI();

const charId = "UvmcFYHfT11SuZvgxiY2sxktiDozY2rh4wsMS10TPGI";

(async () => {
    try {
        await characterAI.authenticateAsGuest();
        console.log("Authenticated as guest");

        const info = await characterAI.fetchCharacterInfo(charId);
        console.log("Character Info Name:", info.name);
        // Dump relevant voice fields if they exist
        console.log("Voice ID:", info.voiceId || info.voice_uuid || "Not found in info object");
        console.log("Full Info Keys:", Object.keys(info));

    } catch (error) {
        console.error("Error:", error);
    }
})();
