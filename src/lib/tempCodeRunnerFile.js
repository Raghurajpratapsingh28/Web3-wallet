import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import CryptoJS from "crypto-js";

// const mnemonic = generateMnemonic();
const mnemonic = "foot found misery holiday resource orange voice empty royal crystal deputy kite"
console.log("Generated Mnemonic:", mnemonic);
const validate = validateMnemonic(mnemonic);
console.log(validate);

const seed = mnemonicToSeedSync(mnemonic); // returns Buffer
console.log(seed);

  const hash = CryptoJS.SHA256(seed.toString("hex")).toString();
  console.log(hash);