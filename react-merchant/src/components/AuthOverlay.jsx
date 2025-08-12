import { useState } from "react";
import { login } from "../services/api";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";

const AuthOverlay = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { token, expiry } = await login(email, password);
      localStorage.setItem("authToken", token);
      localStorage.setItem("authExpiry", expiry);
      onLoginSuccess();
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex h-screen z-50">
      {/* Left Half - Desert landscape background */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600">
        {/* Atmospheric gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-300 via-transparent to-orange-800 opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-20"></div>

        {/* Sun/moon in sky */}
        <div className="absolute top-20 right-32 w-24 h-24 bg-yellow-200 rounded-full blur-sm opacity-80"></div>
        <div className="absolute top-24 right-36 w-16 h-16 bg-white rounded-full opacity-90"></div>

        {/* Mountain ranges */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3">
          <svg viewBox="0 0 800 500" className="w-full h-full">
            {/* Back mountains */}
            <path
              d="M0,500 L0,350 Q100,300 200,320 Q300,340 400,310 Q500,280 600,300 Q700,320 800,290 L800,500 Z"
              fill="rgba(139, 69, 19, 0.4)"
            />
            {/* Middle mountains */}
            <path
              d="M0,500 L0,380 Q150,330 300,350 Q450,370 600,340 Q750,310 800,330 L800,500 Z"
              fill="rgba(101, 67, 33, 0.6)"
            />
            {/* Front mountains */}
            <path
              d="M0,500 L0,420 Q200,380 400,400 Q600,420 800,390 L800,500 Z"
              fill="rgba(62, 39, 35, 0.8)"
            />
          </svg>
        </div>

        {/* Desert vegetation silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          {/* Large cactus */}
          <div className="absolute bottom-8 left-16">
            <div className="w-6 h-24 bg-black opacity-70 rounded-t-full relative">
              <div className="absolute -left-2 top-8 w-4 h-12 bg-black opacity-70 rounded-full"></div>
              <div className="absolute -right-2 top-12 w-4 h-10 bg-black opacity-70 rounded-full"></div>
            </div>
          </div>

          {/* Small cacti */}
          <div className="absolute bottom-8 left-32 w-4 h-16 bg-black opacity-60 rounded-t-full"></div>
          <div className="absolute bottom-6 left-40 w-3 h-12 bg-black opacity-50 rounded-t-full"></div>

          {/* Desert plants */}
          <div className="absolute bottom-4 right-24 w-8 h-8 bg-black opacity-40 rounded-full"></div>
          <div className="absolute bottom-6 right-32 w-6 h-6 bg-black opacity-40 rounded-full"></div>
          <div className="absolute bottom-8 right-16 w-12 h-6 bg-black opacity-50 rounded-full"></div>
        </div>

        {/* Gen AI Logo */}
        <div className="absolute top-8 left-8 flex items-center space-x-3 text-white">
          <img
            src="https://zifypay.com/logo.png"
            alt="logo"
            className="h-12 w-52 object-contain"
          />
        </div>

        {/* Bottom attribution */}
        <div className="absolute bottom-8 left-8 text-white text-sm opacity-70">
        This is a Merchant-Boarding platform 
        </div>

        {/* Visit site button */}
        <div className="absolute bottom-8 right-8 text-white text-base opacity-80 flex items-center space-x-2 cursor-pointer hover:opacity-100 transition-opacity">
          <span>Visit site</span>
          <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center">
            <ArrowRight size={14} className="transform rotate-45" />
          </div>
        </div>
      </div>

      {/* Right Half - Login Form */}
      <div className="flex-1 bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-8">
          <div className="flex items-center justify-between mb-8">
            <div className="text-right">
              <p className="text-slate-400 text-sm">This is a Internal Tool </p>
            </div>
          </div>

          <h2 className="text-3xl font-light text-white mb-2">
            Create Your Account to
          </h2>
          <h3 className="text-3xl font-normal text-white mb-8">
            Unleash Your Dreams
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-slate-700 bg-opacity-60 border border-slate-600 border-opacity-50 rounded-xl text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="mb-6 relative">
              <label htmlFor="password" className="block text-gray-300 mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-slate-700 bg-opacity-60 border border-slate-600 border-opacity-50 rounded-xl text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-12 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && (
              <p className="text-red-500 mb-4 bg-red-900 bg-opacity-30 border border-red-800 border-opacity-50 rounded-xl p-3">
                {error}
              </p>
            )}
            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg ${
                isLoading ? "btn-loading" : ""
              }`}
              disabled={isLoading}
            >
              <span>{isLoading ? "Logging in..." : "Start Creating"}</span>
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <ArrowRight size={16} />
              </div>
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-500 text-center leading-relaxed">
            By signing up, This is Internal Place use official email Id for
            login <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthOverlay;
