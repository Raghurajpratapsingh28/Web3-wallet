
import React from "react";
import ThemeToggle from "./ThemeToggle";
import { Wallet } from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <div className="floating-navbar w-full max-w-7xl px-6 py-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary animate-float" />
          <span className="font-bold text-2xl md:text-3xl text-primary">Solana Wallet</span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;
