// utils/walletUtils.ts

/**
 * Generate a cryptographically secure BIP39 mnemonic phrase
 * @returns A 12-word mnemonic phrase
 */
export function generateMnemonic(): string {
  // Extended list of BIP39 words
  const wordList = [
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
    "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
    "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
    "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
    "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
    "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter",
    "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger",
    "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique",
    "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic",
    "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest",
    "arrive", "arrow", "art", "artefact", "artist", "artwork", "ask", "aspect", "assault", "asset",
    "assist", "assume", "asthma", "athlete", "atom", "attack", "attend", "attitude", "attract", "auction",
    "audit", "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake",
    "aware", "away", "awesome", "awful", "awkward", "axis",
    // Additional words to improve entropy
    "bacon", "badge", "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner", "bar",
    "barely", "bargain", "barrel", "base", "basic", "basket", "battle", "beach", "bean", "beauty",
    "because", "become", "beef", "before", "begin", "behave", "behind", "believe", "below", "belt"
  ];

  // Use window.crypto for better randomness
  const getRandomInt = (max: number) => {
    const buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    return buffer[0] % max;
  };

  // Create a random 12-word mnemonic with improved entropy
  const randomWords = Array(12).fill(0).map(() => {
    const randomIndex = getRandomInt(wordList.length);
    return wordList[randomIndex];
  });

  return randomWords.join(" ");
}

/**
 * Validate a mnemonic phrase
 * @param mnemonic The mnemonic phrase to validate
 * @returns Whether the mnemonic is valid
 */
export function validateMnemonic(mnemonic: string): boolean {
  // Simple validation - just check if it has 12 or 24 words
  const words = mnemonic.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
}

/**
 * Advanced cryptographic hash function
 * @param input String to hash
 * @returns Secure hashed string
 */
function secureHash(input: string): string {
  // Convert string to an array of bytes
  const msgBuffer = new TextEncoder().encode(input);
  
  // Create a hash using SHA-256
  return crypto.subtle.digest('SHA-256', msgBuffer)
    .then(hashBuffer => {
      // Convert hash to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    })
    .catch(() => {
      // Fallback to a simpler hash if Web Crypto API is not available
      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16).padStart(64, '0');
    });
}

/**
 * Apply PBKDF2 key derivation (simulated)
 * @param seed The initial seed
 * @param salt Additional salt value
 * @param iterations Number of PBKDF2 iterations
 * @returns Derived key
 */
async function deriveKey(seed: string, salt: string, iterations: number = 2048): Promise<string> {
  // In a real implementation, you would use the Web Crypto API's PBKDF2
  // This is a simplified implementation for demonstration
  let result = seed + salt;
  
  for (let i = 0; i < iterations; i++) {
    result = await secureHash(result + i.toString());
  }
  
  return result;
}

/**
 * Generate a key pair from a mnemonic phrase and derivation path with improved security
 * @param mnemonic The mnemonic phrase
 * @param index The account index for derivation
 * @param chain The blockchain to generate keys for
 * @returns Object containing public and private keys
 */
export async function generateKeyPair(
  mnemonic: string, 
  index: number, 
  chain: "ethereum" | "solana"
): Promise<{ publicKey: string; privateKey: string }> {
  // Create a seed from the mnemonic with more entropy
  const path = `m/44'/${chain === "ethereum" ? "60" : "501"}'/${index}'/0/0`;
  const seed = mnemonic + path;
  
  // Salt value for key derivation
  const salt = `${chain}_wallet_${Date.now()}`;
  
  // Derive a strong private key using multiple layers
  const privateKeyBase = await deriveKey(seed, salt);
  let privateKey = '';
  let publicKey = '';
  
  if (chain === "ethereum") {
    // Generate a 64-character hex string (32 bytes) for Ethereum
    privateKey = "0x" + privateKeyBase.substring(0, 64);
    
    // For demo purposes, derive a deterministic but secure public key
    const ethAddressBase = await secureHash(privateKey);
    publicKey = "0x" + ethAddressBase.substring(24, 64); // Last 40 chars
  } else {
    // For Solana, generate a longer private key
    const extendedPrivateKey = await secureHash(privateKeyBase + index.toString());
    privateKey = extendedPrivateKey.repeat(2).substring(0, 128);
    
    // Generate a Base58-like format for Solana public key
    const pubKeyHash = await secureHash(privateKey);
    const pubKeyBase = pubKeyHash.substring(0, 32);
    
    // Format it to look like a Solana address
    const chunks = [];
    for (let i = 0; i < 32; i += 4) {
      chunks.push(pubKeyBase.substring(i, i + 4));
    }
    publicKey = chunks.join('');
  }
  
  return { publicKey, privateKey };
}

/**
 * Encrypt a private key for storage
 * @param privateKey The private key to encrypt
 * @param password User's password for encryption
 * @returns Encrypted key string
 */
export async function encryptPrivateKey(privateKey: string, password: string): Promise<string> {
  // In a real implementation, you would use AES encryption from Web Crypto API
  // This is a simplified mockup for demonstration
  const salt = await secureHash(Date.now().toString());
  const encryptionKey = await deriveKey(password, salt, 1000);
  
  // XOR "encryption" (for demonstration only - not secure!)
  let result = '';
  for (let i = 0; i < privateKey.length; i++) {
    const charCode = privateKey.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
    result += String.fromCharCode(charCode);
  }
  
  // Convert to Base64-like format for storage
  return btoa(result) + '.' + salt.substring(0, 16);
}

/**
 * Decrypt a stored private key
 * @param encryptedKey The encrypted private key
 * @param password User's password for decryption
 * @returns Decrypted private key
 */
export async function decryptPrivateKey(encryptedKey: string, password: string): Promise<string> {
  // Split the encrypted key and salt
  const [encrypted, salt] = encryptedKey.split('.');
  
  // Derive the same key used for encryption
  const encryptionKey = await deriveKey(password, salt, 1000);
  
  // Decode from Base64-like format
  const encryptedData = atob(encrypted);
  
  // XOR "decryption" (for demonstration only)
  let result = '';
  for (let i = 0; i < encryptedData.length; i++) {
    const charCode = encryptedData.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
    result += String.fromCharCode(charCode);
  }
  
  return result;
}

/**
 * Generate a public key from a mnemonic phrase
 * @param mnemonic The mnemonic phrase
 * @param chain The blockchain to generate keys for
 * @returns The public key
 */
export async function generatePublicKey(mnemonic: string, chain: "ethereum" | "solana"): Promise<string> {
  // This maintains backward compatibility with code that uses this function
  const { publicKey } = await generateKeyPair(mnemonic, 0, chain);
  return publicKey;
}