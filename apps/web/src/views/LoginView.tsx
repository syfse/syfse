import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";

export function LoginView() {
  const {login} = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card
      buttonConfig={{
        useDefault: false,
        customButtons: [
          <Button classes="transition duration-300 ease" onClick={() => login(email, password)}>Login</Button>,
        ],
      }}
    >
      <h1 className="text-gray-800 font-bold text-2xl mb-1">Welcome Back!</h1>
      <div className="my-8">
        <Input
          label="Email"
          placeholder="johndoe@example.com"
          className="mb-4"
          required={true}
          value={email}
          onChange={(newEmail) => setEmail(newEmail)}
        />
        <Input
          label="Password"
          placeholder="*****"
          type="password"
          className="mb-2"
          required={true}
          value={password}
          onChange={(newPassword) => setPassword(newPassword)}
        />
        <a
          href="/forgot-password"
          className="text-gray-400 text-sm ml-2 hover:text-blue-500 cursor-pointer transition duration-300 ease"
        >
          Forgot Password ?
        </a>
      </div>
    </Card>
  );
}
