"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  
  // Standard Login State
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  
  // Forgot Password State
  const [isForgotMode, setIsForgotMode] = useState(false)
  const [email, setEmail] = useState("")
  const [resetMessage, setResetMessage] = useState("")

  // --- Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (id === "1" && password === "password123") {
      setErrorMessage("")
      localStorage.setItem("role", "supervisor")
      localStorage.setItem("supervisorId", id)
      router.push("/dashboard")
    } else {
      setErrorMessage("Unauthorized Access: Invalid ID or Password.")
    }
  }

  const handleSendResetCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.includes("@")) {
      setErrorMessage("")
      setResetMessage(`A secure reset link has been dispatched to ${email}.`)
      // In a real app, this is where you would trigger your backend email API
    } else {
      setResetMessage("")
      setErrorMessage("Please enter a valid email address.")
    }
  }

  const toggleMode = () => {
    setIsForgotMode(!isForgotMode)
    setErrorMessage("")
    setResetMessage("")
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center text-white p-4">
      <div className="bg-[#111827] p-10 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl transition-all">
        
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Supervisor Portal
          </h2>
          <p className="text-slate-400 mt-2 text-sm">Construction Site Safety Monitor</p>
        </div>

        {/* --- DYNAMIC UI SWITCH --- */}
        {!isForgotMode ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in zoom-in duration-300">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Supervisor ID</label>
              <input
                type="text"
                className="w-full p-3 bg-[#1f2937] border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter ID (e.g., 1)"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                className="w-full p-3 bg-[#1f2937] border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMessage && (
              <div className="text-red-400 text-sm font-semibold bg-red-900/30 p-3 rounded border border-red-800">
                🚨 {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 py-3 rounded-lg font-bold tracking-wide hover:bg-blue-500 transition-all shadow-lg mt-4"
            >
              Authenticate
            </button>

            <div className="mt-6 text-center">
              <button 
                type="button"
                onClick={toggleMode}
                className="text-sm text-slate-400 hover:text-blue-400 transition-colors underline decoration-slate-600 hover:decoration-blue-400"
              >
                Forgot Password?
              </button>
            </div>
          </form>

        ) : (

          /* FORGOT PASSWORD FORM */
          <form onSubmit={handleSendResetCode} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-sm text-slate-300 mb-4 text-center">
              Enter your registered administration email to receive a password reset code.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Registered Email</label>
              <input
                type="email"
                className="w-full p-3 bg-[#1f2937] border border-slate-600 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="supervisor@constructionsite.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {errorMessage && (
              <div className="text-red-400 text-sm font-semibold bg-red-900/30 p-3 rounded border border-red-800">
                🚨 {errorMessage}
              </div>
            )}
            
            {resetMessage && (
              <div className="text-emerald-400 text-sm font-semibold bg-emerald-900/30 p-3 rounded border border-emerald-800">
                ✅ {resetMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 py-3 rounded-lg font-bold tracking-wide hover:bg-emerald-500 transition-all shadow-lg mt-4"
            >
              Send Reset Code
            </button>

            <div className="mt-6 text-center">
              <button 
                type="button"
                onClick={toggleMode}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center w-full gap-2"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}