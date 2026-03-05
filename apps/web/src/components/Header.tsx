import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/Button";
import { LogOut, User, Menu } from "lucide-react";
import { useState } from "react";

export function Header() {
    const { user, profile, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="w-full rounded shadow-lg dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold tracking-wider hover:opacity-90 transition duration-300 ease-in-out dark:text-white">
                    SYFSE
                </Link>
                
                <nav className="hidden md:flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                            <User className="w-5 h-5 text-white" />
                            <span className="text-white font-medium">{profile?.username}</span>
                            <button onClick={logout} className="text-white hover:text-red-200 transition">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login">
                            <Button classes="bg-white text-blue-600 font-semibold hover:bg-gray-100">
                                Login
                            </Button>
                        </Link>
                    )}
                </nav>

                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {isOpen && (
                <div className="md:hidden bg-blue-700 px-4 py-4 flex flex-col gap-3">
                    {user ? (
                        <>
                            <div className="text-white flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {profile?.username}
                            </div>
                            <Button onClick={logout} classes="bg-red-500 text-white w-full">
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Link to="/login" className="w-full">
                            <Button classes="w-full bg-white text-blue-600">Login</Button>
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
