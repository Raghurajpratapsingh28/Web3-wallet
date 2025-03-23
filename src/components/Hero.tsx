
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import WalletForm from "./WalletForm";
import { ChevronDown, Coins, Wallet } from "lucide-react";
import WalletGenerator from "./WalletForm";

const Hero: React.FC = () => {
  const [activeChain, setActiveChain] = useState<"ethereum" | "solana" | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-28 pt-36 sm:pt-32">
      <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="inline-block bg-primary/10 dark:bg-primary/20 rounded-full px-3 py-1 text-sm font-medium text-primary mb-4">
          Secure. Simple. Seamless.
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight text-balance">
          Your Digital Assets, <br className="hidden sm:block" />
          <span className="text-primary">Secured</span> in One Place
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Manage your crypto portfolio with confidence using Solana Wallet's state-of-the-art security features and intuitive interface.
        </p>

        {!activeChain ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {/* <Button
              className="flex items-center gap-2 h-12 px-6 text-base bg-gradient-to-r from-[#5345ee] to-[#6e5df7] hover:opacity-90 transition-all border-0"
              onClick={() => setActiveChain("ethereum")}
            >
              <svg className="w-5 h-5" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                <path fill="#fff" d="M127.9611 0.0410156L127.6071 1.26102V285.661L127.9611 286.014L255.9231 212.94L127.9611 0.0410156Z" />
                <path fill="#fff" d="M127.962 0.0410156L0 212.94L127.962 286.013V153.023V0.0410156Z" />
                <path fill="#fff" d="M127.9609 310.0209L127.7539 310.2709V416.9069L127.9609 417.0009L255.9999 236.9749L127.9609 310.0209Z" />
                <path fill="#fff" d="M127.962 416.9819V310.0209L0 236.9749L127.962 416.9819Z" />
                <path fill="#fff" d="M127.962 286.0139L255.925 212.9399L127.962 153.0239V286.0139Z" />
                <path fill="#fff" d="M0.0009 212.9399L127.9629 286.0139V153.0239L0.0009 212.9399Z" />
              </svg>
              Ethereum Wallet
            </Button> */}
            <Button
              className="flex items-center gap-2 h-12 px-6 text-base bg-gradient-to-r from-[#9945ee] to-[#cb5df7] hover:opacity-90 transition-all border-0"
              onClick={() => setActiveChain("solana")}
            >
              <svg className="w-5 h-5" viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M64.5004 237.24L98.9475 310.78H298.251L397 155.5L298.251 0H98.9475L64.5004 73.54M64.5004 237.24L0 155.5L64.5004 73.54M64.5004 237.24L163.248 310.78M64.5004 73.54L163.248 0" stroke="white" strokeWidth="12"/>
              </svg>
              Solana Wallet
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto">
            <WalletForm chain={activeChain} />
            <Button
              variant="ghost"
              className="mt-4 mx-auto flex items-center gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => setActiveChain(null)}
            >
              <ChevronDown className="h-4 w-4" />
              Choose different chain
            </Button>
          </div>
        )}
      </div>

      {!activeChain && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <div className="glass-card p-6 rounded-2xl">
            <Wallet className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">Secure Storage</h3>
            <p className="text-muted-foreground">Your keys remain encrypted and protected with military-grade security.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <Coins className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">Multi-Chain Support</h3>
            <p className="text-muted-foreground">One wallet for all your digital assets across multiple blockchains.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <svg className="h-8 w-8 mb-4 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v7h-2zm0 8h2v2h-2z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">Full Control</h3>
            <p className="text-muted-foreground">You own your keys and your crypto. No intermediaries, no restrictions.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
