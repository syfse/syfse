import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import type { AuthError } from "@supabase/supabase-js";
import { useNotification } from "../contexts/NotificationContext";

export function RegisterView() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const notify = useNotification();

  function handleSignUp() {
    signUp(email, password).then(({ error }: { error: AuthError | null }) => {
      if (error) {
        console.error("Sign up failed:", error.message);
        notify.error(error.message, "Sign-up failed");
      } else {
        notify.success("Account created successfully", "Sign-up successful");
        navigate("/");
      }
    })
  }

  return (
    <Card
      buttonConfig={{
        useDefault: false,
        customButtons: [
          <Button classes="transition duration-300 ease" onClick={handleSignUp}>
            Register
          </Button>,
        ],
      }}
      footer={
        <p className="text-gray-400 text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      }
    >
      <h1 className="text-gray-800 font-bold text-2xl mb-1">Create Account</h1>
      <div className="my-8">
        <Input
          label="Email"
          placeholder="johndoe@example.com"
          classes="mb-4"
          required={true}
          value={email}
          onChange={(newEmail) => setEmail(newEmail)}
        />
        <Input
          label="Password"
          placeholder="*****"
          type="password"
          classes="mb-2"
          required={true}
          value={password}
          onChange={(newPassword) => setPassword(newPassword)}
        />
      </div>
    </Card>
  );
}
