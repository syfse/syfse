import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export function LoginView() {
  return (
    <Card>
      <form className="">
        <h1 className="text-gray-800 font-bold text-2xl mb-1">Welcome Back!</h1>
        <div className="my-8">
          <Input label="Email" placeholder="johndoe@example.com" className="mb-4" required={true} />
          <Input label="Password" placeholder="*****" type="password" className="mb-2" required={true} />
          <span className="text-gray-400 text-sm ml-2 hover:text-blue-500 cursor-pointer transition duration-300 ease">
            Forgot Password ?
          </span>
        </div>

        <button className="w-full bg-green-500 text-white font-bold mt-4 py-2 px-4 rounded hover:bg-green-600 transition duration-300 ease">
          Login
        </button>
      </form>
    </Card>
  );
}
