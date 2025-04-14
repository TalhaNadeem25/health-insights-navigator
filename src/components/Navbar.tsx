import { Menu, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { SignInButton, SignUpButton, useUser, useClerk } from "@clerk/clerk-react";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {!isSignedIn && (
            <>
              <SignInButton mode="modal">
                <Button className="bg-health-600 text-white hover:bg-health-700">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="outline" className="border-health-600 text-health-600 hover:bg-health-50">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
          {isSignedIn && (
            <>
              <Button 
                variant="ghost" 
                onClick={() => signOut()}
                className="text-red-600 hover:text-red-700"
              >
                Sign Out
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
