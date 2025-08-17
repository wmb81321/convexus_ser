import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";

export default function Header() {
  const { authenticated, logout } = usePrivy();

  return (
    <header className="glass-card border-0 border-b border-white/20 shadow-lg">
      <div className="container-institutional py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Professional Convexo Logo */}
          <div className="flex items-center gap-3 hover-lift transition-institutional">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 p-1">
              <Image
                src="/convexo-logo.png"
                alt="Convexo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold heading-institutional bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Convexo
              </h1>
              <p className="text-xs text-institutional-light font-medium">
                Smart Web3 Wallet
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {authenticated && (
            <>
              {/* Professional Status Badge */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm font-semibold">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                <span className="text-green-600 dark:text-green-400">
                  Smart Wallet Active
                </span>
              </div>
              
              {/* Professional Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-institutional hover:bg-primary/10 hover:text-primary 
                  transition-institutional rounded-full px-4 py-2 font-medium"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
