const CharacterAI = require('node_characterai');
const characterAI = new CharacterAI();

(async () => {
    console.log("Methods on instance:");
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(characterAI)));
})();
