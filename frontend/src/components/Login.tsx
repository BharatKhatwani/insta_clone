import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full relative font-mono">
      {/* Cosmic Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), linear-gradient(120deg, #0f0e17 0%, #1a1b26 100%)",
        }}
      />

      {/* Login Card */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md bg-white/90 backdrop-blur p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">
            Login
          </h2>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="submit"
              className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-700">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Signup
            </span>
          </p>
          <div className="mt-4 rounded-lg border border-dashed border-gray-400 p-3 text-sm text-gray-700">
            <p className="font-semibold mb-1">Demo User</p>
            <p>Email: <span className="font-mono">rahul@test.com</span></p>
            <p>Password: <span className="font-mono">123456</span></p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
