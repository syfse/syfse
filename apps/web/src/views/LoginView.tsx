import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import type { AuthError } from "@supabase/supabase-js";
import { useNotification } from "../hooks/useNotification";

export function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const notify = useNotification();

  function handleLogin() {
    login(email, password).then(({ error }: { error: AuthError | null }) => {
      if (error) {
        notify.error(error.message, "Login failed");
      } else {
        notify.success("Logged in successfully", "Login successful");
        navigate("/");
      }
    });
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card
        classes="dark:bg-gray-800"
        buttonConfig={{
          useDefault: false,
          customButtons: [
            <Button
              classes="transition duration-300 ease"
              onClick={handleLogin}
            >
              Login
            </Button>,
          ],
        }}
        footer={
          <p className="text-gray-400 text-sm mt-4 dark:text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </p>
        }
      >
        <h1 className="text-gray-800 font-bold text-2xl mb-1 dark:text-white">
          Welcome Back!
        </h1>
        <div className="my-8">
          <Input
            classes="dark:bg-gray-800 dark:text-white mb-4"
            label="Email"
            placeholder="johndoe@example.com"
            required={true}
            value={email}
            onChange={(newEmail) => setEmail(newEmail)}
          />
          <Input
            classes="dark:bg-gray-800 dark:text-white mb-2"
            label="Password"
            placeholder="*****"
            type="password"
            required={true}
            value={password}
            onChange={(newPassword) => setPassword(newPassword)}
          />
          <Link
            to="/forgot-password"
            className="text-gray-400 text-sm ml-2 hover:text-blue-500 cursor-pointer transition duration-300 ease"
          >
            Forgot Password?
          </Link>
        </div>
      </Card>
    </div>
  );
}
