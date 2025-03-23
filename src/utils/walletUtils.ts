
// This is a simplified wallet utility for demo purposes
// In a real app, you would use proper crypto libraries

// Generate a random mnemonic of 12 words
export const generateMnemonic = (): string => {
  const wordList = [
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
    "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
    "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
    "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
    "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
    "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter",
    "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger"
  ];

  let mnemonic = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    mnemonic.push(wordList[randomIndex]);
  }

  return mnemonic.join(" ");
};

// Validate a mnemonic (basic check - in real app this would be more robust)
export const validateMnemonic = (mnemonic: string): boolean => {
  const words = mnemonic.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
};

// Generate a dummy public key from mnemonic
export const generatePublicKey = (mnemonic: string, chain: "ethereum" | "solana"): string => {
  if (!validateMnemonic(mnemonic)) {
    throw new Error("Invalid mnemonic");
  }
  
  // This is just a placeholder demonstration
  // In a real wallet app, we would use proper crypto libraries to derive keys
  const hash = Array.from(mnemonic).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  if (chain === "ethereum") {
    return `0x${hash.toString(16).padStart(40, '0')}`;
  } else {
    // Solana keys are base58 encoded
    return `${hash.toString(36).substring(0, 44)}`;
  }
};
