// WalletForm.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Copy, 
  RefreshCw, 
  Key, 
  Trash2, 
  ChevronUp, 
  Eye, 
  Search, 
  Lock, 
  Shield, 
  AlertTriangle 
} from "lucide-react";
import { 
  generateMnemonic, 
  validateMnemonic, 
  generateKeyPair, 
  encryptPrivateKey, 
  decryptPrivateKey 
} from "@/utils/walletUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface WalletFormProps {
  chain: "ethereum" | "solana";
}

interface Wallet {
  id: number;
  publicKey: string;
  privateKey: string;
  encrypted: boolean;
}

const STORAGE_KEY_MNEMONIC = "wallet_secure_mnemonic_v2";
const STORAGE_KEY_WALLETS = "wallet_secure_keys_v2";
const DEFAULT_ENCRYPTION_PASSWORD = "default_password";

const WalletForm: React.FC<WalletFormProps> = ({ chain }) => {
  const [mnemonic, setMnemonic] = useState("");
  const [customMnemonic, setCustomMnemonic] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showPrivateKey, setShowPrivateKey] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [encryptionPassword, setEncryptionPassword] = useState(DEFAULT_ENCRYPTION_PASSWORD);
  const [securityLevel, setSecurityLevel] = useState(70);

  useEffect(() => {
    try {
      const savedMnemonic = localStorage.getItem(STORAGE_KEY_MNEMONIC);
      const savedWallets = localStorage.getItem(STORAGE_KEY_WALLETS);
      
      if (savedMnemonic) {
        setMnemonic(savedMnemonic);
        setCustomMnemonic(savedMnemonic);
      }
      
      if (savedWallets) {
        setWallets(JSON.parse(savedWallets));
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
      toast.error("Failed to load saved wallet data");
      localStorage.removeItem(STORAGE_KEY_MNEMONIC);
      localStorage.removeItem(STORAGE_KEY_WALLETS);
    }
  }, []);

  useEffect(() => {
    if (mnemonic) {
      try {
        localStorage.setItem(STORAGE_KEY_MNEMONIC, mnemonic);
      } catch (error) {
        console.error("Error saving mnemonic:", error);
        toast.error("Failed to save mnemonic");
      }
    }
    
    if (wallets.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(wallets));
      } catch (error) {
        console.error("Error saving wallets:", error);
        toast.error("Failed to save wallets");
      }
    }
  }, [mnemonic, wallets]);

  const encryptWalletKeys = async () => {
    setLoading(true);
    try {
      const updatedWallets = await Promise.all(
        wallets.map(async (wallet) => {
          if (!wallet.encrypted) {
            const encryptedKey = await encryptPrivateKey(wallet.privateKey, encryptionPassword);
            return { ...wallet, privateKey: encryptedKey, encrypted: true };
          }
          return wallet;
        })
      );
      
      setWallets(updatedWallets);
      setSecurityLevel(95);
      localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(updatedWallets));
      toast.success("Private keys encrypted successfully");
    } catch (error) {
      console.error("Encryption error:", error);
      toast.error("Failed to encrypt private keys");
    } finally {
      setLoading(false);
    }
  };

  const decryptPrivateKeyForDisplay = async (wallet: Wallet, id: number) => {
    if (!wallet.encrypted) return wallet.privateKey;
    
    try {
      return await decryptPrivateKey(wallet.privateKey, encryptionPassword);
    } catch (error) {
      console.error("Decryption error:", error);
      toast.error("Failed to decrypt private key");
      return "••• DECRYPTION ERROR •••";
    }
  };

  const handleGenerateMnemonic = () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    setCustomMnemonic(newMnemonic);
    setWallets([]);
    toast.success("New mnemonic generated");
  };

  const handleMnemonicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setCustomMnemonic(input);
    if (validateMnemonic(input)) {
      setMnemonic(input);
      setWallets([]);
      toast.success("Valid mnemonic accepted");
    }
  };

  const handleAddWallet = async () => {
    if (!mnemonic) {
      toast.error("Please generate or enter a mnemonic first");
      return;
    }

    setLoading(true);
    try {
      if (validateMnemonic(mnemonic)) {
        const { publicKey, privateKey } = await generateKeyPair(mnemonic, wallets.length, chain);
        const shouldEncrypt = securityLevel >= 80;
        const finalPrivateKey = shouldEncrypt 
          ? await encryptPrivateKey(privateKey, encryptionPassword)
          : privateKey;
        
        const newWallet = {
          id: Date.now(),
          publicKey,
          privateKey: finalPrivateKey,
          encrypted: shouldEncrypt
        };
        
        setWallets(prev => [...prev, newWallet]);
        toast.success("Wallet added successfully");
        
        if (shouldEncrypt) {
          setSecurityLevel(Math.max(securityLevel, 90));
        }
      } else {
        toast.error("Invalid mnemonic phrase. Please use 12 or 24 words.");
      }
    } catch (error) {
      console.error("Error generating wallet:", error);
      toast.error("Error generating wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleClearWallets = () => {
    setWallets([]);
    setMnemonic("");
    setCustomMnemonic("");
    localStorage.removeItem(STORAGE_KEY_MNEMONIC);
    localStorage.removeItem(STORAGE_KEY_WALLETS);
    toast.success("All wallets and mnemonic cleared");
    setSecurityLevel(50);
  };

  const handleRemoveWallet = (id: number) => {
    const updatedWallets = wallets.filter(wallet => wallet.id !== id);
    setWallets(updatedWallets);
    
    if (updatedWallets.length > 0) {
      localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(updatedWallets));
    } else {
      localStorage.removeItem(STORAGE_KEY_WALLETS);
    }
    
    toast.success("Wallet removed");
  };

  const handleCopy = async (wallet: Wallet, text: string, type: string) => {
    try {
      let finalText = text;
      if (type === "Private key" && wallet.encrypted) {
        finalText = await decryptPrivateKeyForDisplay(wallet, wallet.id);
      }
      
      await navigator.clipboard.writeText(finalText);
      toast.success(`${type} copied to clipboard`);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error(`Failed to copy ${type.toLowerCase()}`);
    }
  };

  const togglePrivateKey = async (wallet: Wallet, id: number) => {
    if (!showPrivateKey[id] && wallet.encrypted) {
      try {
        await decryptPrivateKeyForDisplay(wallet, id);
      } catch (error) {
        toast.error("Failed to decrypt private key");
        return;
      }
    }
    
    setShowPrivateKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredWallets = wallets.filter(wallet => 
    wallet.publicKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderMnemonicGrid = () => {
    if (!mnemonic) return null;
    
    const words = mnemonic.split(" ");
    const filteredWords = searchTerm 
      ? words.filter(word => word.toLowerCase().includes(searchTerm.toLowerCase()))
      : words;
      
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
        {filteredWords.map((word, index) => (
          <div 
            key={index} 
            className="p-3 bg-background/50 border rounded-md text-center group relative cursor-pointer"
            onClick={() => handleCopy({ id: 0, publicKey: '', privateKey: word, encrypted: false }, word, "Mnemonic word")}
          >
            <span className="group-hover:invisible">{word}</span>
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              Copy
            </span>
          </div>
        ))}
      </div>
    );
  };

  const getSecurityLevelColor = () => {
    if (securityLevel >= 90) return "bg-green-500";
    if (securityLevel >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSecurityLevelText = () => {
    if (securityLevel >= 90) return "High Security";
    if (securityLevel >= 70) return "Medium Security";
    return "Low Security";
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              placeholder="Search phrases and keys..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Shield className="mr-2 h-4 w-4" />
                Security Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Wallet Security</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>{getSecurityLevelText()}</span>
                    <span>{securityLevel}%</span>
                  </div>
                  <Progress value={securityLevel} className={getSecurityLevelColor()} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-medium">Encryption Password</label>
                    <Input
                      type="password"
                      value={encryptionPassword}
                      onChange={e => setEncryptionPassword(e.target.value)}
                      placeholder="Enter a strong password"
                    />
                  </div>
                  <Button 
                    onClick={encryptWalletKeys} 
                    disabled={loading || wallets.every(w => w.encrypted)}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Encrypting...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Encrypt All Private Keys
                      </>
                    )}
                  </Button>
                </div>
                {securityLevel < 70 && (
                  <div className="flex items-start p-3 rounded-md bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
                    <AlertTriangle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm">Your wallet security is low. We recommend encrypting your private keys and using a strong password.</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Enter your 12 or 24 word mnemonic phrase or generate a new one"
            value={customMnemonic}
            onChange={handleMnemonicChange}
            className={validateMnemonic(customMnemonic) ? "border-green-500" : "border-red-500"}
          />
          <Button onClick={handleGenerateMnemonic} variant="secondary">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate New Mnemonic
          </Button>
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <Card className="w-full glass-card animate-scale-in">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Your Secret Phrase</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ChevronUp className={`h-5 w-5 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {renderMnemonicGrid()}
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Copy className="h-4 w-4" /> Click Word To Copy
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold">{chain === "ethereum" ? "Ethereum" : "Solana"} Wallet</h2>
        <div className="flex gap-2">
          <Button onClick={handleAddWallet} disabled={loading || !mnemonic}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Add Wallet
              </>
            )}
          </Button>
          {wallets.length > 0 && (
            <Button variant="destructive" onClick={handleClearWallets}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Wallets
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredWallets.length === 0 && searchTerm && (
          <div className="text-center p-6 border border-dashed rounded-lg text-muted-foreground">
            No wallets match your search criteria
          </div>
        )}
        {filteredWallets.map((wallet, index) => (
          <Card key={wallet.id} className="w-full glass-card">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-medium">Wallet {index + 1}</CardTitle>
                  {wallet.encrypted && (
                    <div className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Encrypted
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive"
                  onClick={() => handleRemoveWallet(wallet.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Public Key</h3>
                <div className="relative">
                  <Input
                    value={wallet.publicKey}
                    readOnly
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => handleCopy(wallet, wallet.publicKey, "Public key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  Private Key
                  {wallet.encrypted && <Lock className="h-4 w-4 text-green-600" />}
                </h3>
                <div className="relative">
                  <Input
                    value={showPrivateKey[wallet.id] 
                      ? wallet.encrypted 
                        ? "•••• ENCRYPTED - CLICK EYE ICON TO VIEW ••••" 
                        : wallet.privateKey 
                      : "•".repeat(Math.min(64, wallet.privateKey.length))}
                    readOnly
                    className="pr-20 font-mono text-sm"
                  />
                  <div className="absolute right-0 top-0 h-full flex">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-full"
                      onClick={() => togglePrivateKey(wallet, wallet.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-full"
                      onClick={() => handleCopy(wallet, wallet.privateKey, "Private key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WalletForm;