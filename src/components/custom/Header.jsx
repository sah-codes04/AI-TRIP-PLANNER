import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";

const navigationLinks = [
  { label: "Home", to: "/" },
  { label: "Trips", to: "/my-trips" },
  { label: "Chart Analysis", to: "/chart-analysis" },
  { label: "Profile", to: "/profile" },
  { label: "Settings", to: "/settings" },
];

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem("user");
    return null;
  }
};

function Header() {
  const [user, setUser] = useState(getStoredUser);
  const [openDialog, setOpenDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());

    window.addEventListener("storage", syncUser);
    window.addEventListener("user-updated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("user-updated", syncUser);
    };
  }, []);

  const login = useGoogleLogin({
    onSuccess: (tokenResp) => getUserProfile(tokenResp),
    onError: () => toast.error("Google login failed"),
  });

  const getUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`, {
        headers: { Authorization: `Bearer ${tokenInfo.access_token}` },
      })
      .then((resp) => {
        localStorage.setItem("user", JSON.stringify(resp.data));
        setUser(resp.data);
        window.dispatchEvent(new Event("user-updated"));
        toast.success("Login successful");
        setOpenDialog(false);
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error);
        toast.error("Failed to get user profile");
      });
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user-updated"));
    toast.success("Logged out successfully");
  };

  const menuButtonClass =
    "w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-left text-sm font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-surface-hover)]";

  const navLinkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-[color:var(--color-surface-hover)] text-[color:var(--color-text)]"
        : "text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-text)]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
          <img src="/logo.svg" alt="AI Trip Planner Logo" className="h-9 w-auto logo-text" />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navigationLinks.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass} end={item.to === "/"}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-surface-hover)] md:inline-flex"
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpenDialog(true)}
              className="hidden rounded-md bg-[color:var(--color-text)] px-3 py-2 text-sm font-semibold text-[color:var(--color-bg)] transition-opacity hover:opacity-90 md:inline-flex"
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex rounded-md border border-[color:var(--color-border)] p-2 text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-surface-hover)] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[color:var(--color-border)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navigationLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={menuButtonClass}
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}

            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className={menuButtonClass}
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOpenDialog(true);
                }}
                className={menuButtonClass}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="h-screen w-screen max-w-none rounded-none bg-[color:var(--color-surface)] p-6 text-[color:var(--color-text)]">
          <DialogHeader>
            <DialogTitle className="sr-only">
              Google Sign In
            </DialogTitle>
            <DialogDescription>
              Sign in to the app using Google authentication
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center h-full text-center">
            <img src="/logo.svg" alt="AI Trip Planner Logo" className="logo-text" />

            <h2 className="font-bold text-2xl mt-7">Sign in With Google</h2>

            <p className="text-sm text-muted-foreground mt-2">
              Securely authenticate using your Google account
            </p>

            <Button
              onClick={login}
              className="mt-6 flex w-full max-w-sm items-center gap-4 bg-[color:var(--color-text)] text-[color:var(--color-bg)] hover:opacity-90"
            >
              <FcGoogle className="h-7 w-7" />
              Sign in With Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}

export default Header;
