
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, RefreshCw, Key, Trash2, ChevronUp, Eye, Search } from "lucide-react";
import { generateMnemonic, generatePublicKey, validateMnemonic } from "@/utils/walletUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface WalletFormProps {
  chain: "ethereum" | "solana";
}

interface Wallet {
  id: number;
  publicKey: string;
  privateKey: string;
}

// Storage keys
const STORAGE_KEY_MNEMONIC = "solarium_mnemonic";
const STORAGE_KEY_WALLETS = "solarium_wallets";

const WalletForm: React.FC<WalletFormProps> = ({ chain }) => {
  const [mnemonic, setMnemonic] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showPrivateKey, setShowPrivateKey] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const savedMnemonic = localStorage.getItem(STORAGE_KEY_MNEMONIC);
    const savedWallets = localStorage.getItem(STORAGE_KEY_WALLETS);
    
    if (savedMnemonic) {
      setMnemonic(savedMnemonic);
    }
    
    if (savedWallets) {
      try {
        const parsedWallets = JSON.parse(savedWallets);
        setWallets(parsedWallets);
      } catch (error) {
        console.error("Error parsing saved wallets:", error);
      }
    }
  }, []);
  
  // Save to localStorage whenever mnemonic or wallets change
  useEffect(() => {
    if (mnemonic) {
      localStorage.setItem(STORAGE_KEY_MNEMONIC, mnemonic);
    }
    
    if (wallets.length > 0) {
      localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(wallets));
    }
  }, [mnemonic, wallets]);

  const handleAddWallet = () => {
    setLoading(true);
    try {
      // If no mnemonic is provided, generate one
      const seedPhrase = mnemonic || generateMnemonic();
      setMnemonic(seedPhrase);
      
      if (validateMnemonic(seedPhrase)) {
        // Add a delay to simulate processing
        setTimeout(() => {
          const key = generatePublicKey(seedPhrase, chain);
          // Generate a dummy private key
          const privKey = `${chain === "ethereum" ? "0x" : ""}${Array.from(seedPhrase).reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(16).padStart(64, '0')}`;
          
          const newWallet = {
            id: Date.now(),
            publicKey: key,
            privateKey: privKey
          };
          
          setWallets(prev => [...prev, newWallet]);
          setLoading(false);
          toast.success("Wallet added successfully");
        }, 600);
      } else {
        if (seedPhrase) {
          toast.error("Invalid mnemonic phrase. Please use 12 or 24 words.");
        }
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error generating wallet");
      setLoading(false);
    }
  };

  const handleClearWallets = () => {
    setWallets([]);
    setMnemonic("");
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY_MNEMONIC);
    localStorage.removeItem(STORAGE_KEY_WALLETS);
    
    toast.success("All wallets cleared");
  };

  const handleRemoveWallet = (id: number) => {
    const updatedWallets = wallets.filter(wallet => wallet.id !== id);
    setWallets(updatedWallets);
    
    // Update localStorage
    if (updatedWallets.length > 0) {
      localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(updatedWallets));
    } else {
      localStorage.removeItem(STORAGE_KEY_WALLETS);
    }
    
    toast.success("Wallet removed");
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const togglePrivateKey = (id: number) => {
    setShowPrivateKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter wallets based on search term
  const filteredWallets = wallets.filter(wallet => 
    wallet.publicKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (showPrivateKey[wallet.id] && wallet.privateKey.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Generate mnemonic display
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
            className="p-3 bg-background/50 border rounded-md text-center"
            onClick={() => handleCopy(word, "Word")}
          >
            {word}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
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
                <Copy className="h-4 w-4" /> Click Anywhere To Copy
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold">{chain === "ethereum" ? "Ethereum" : "Solana"} Wallet</h2>
        <div className="flex gap-2">
          <Button onClick={handleAddWallet} disabled={loading}>
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
            <Button 
              variant="destructive"
              onClick={handleClearWallets}
            >
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
                <CardTitle className="text-xl font-medium">Wallet {index + 1}</CardTitle>
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
                    onClick={() => handleCopy(wallet.publicKey, "Public key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Private Key</h3>
                <div className="relative">
                  <Input
                    value={showPrivateKey[wallet.id] ? wallet.privateKey : "•".repeat(wallet.privateKey.length)}
                    readOnly
                    className="pr-20 font-mono text-sm"
                  />
                  <div className="absolute right-0 top-0 h-full flex">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-full"
                      onClick={() => togglePrivateKey(wallet.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-full"
                      onClick={() => handleCopy(wallet.privateKey, "Private key")}
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
