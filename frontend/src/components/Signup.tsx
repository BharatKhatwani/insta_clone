import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

 const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await axios.post("http://localhost:5000/api/auth/signup", {
      username,
      email,
      password,
    });

    
    localStorage.setItem("token", res.data.token);

    navigate("/home");
  } catch (err: any) {
    setError(err.response?.data?.message || "Signup failed");
  } finally {
    setLoading(false);
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

      
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md bg-white/90 backdrop-blur p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">
            Create Account
          </h2>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

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
              disabled={loading}
              className={`w-full py-2 cursor-pointer rounded-md text-white transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Creating account..." : "Signup"}
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-700">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Login
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
}

export default Signup;
