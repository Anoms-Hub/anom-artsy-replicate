import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";

/**
 * Anom Artsy Home Page
 * Neon cyberpunk design with high-contrast colors and glowing effects
 * Enhanced with interactive signup form and success states
 * Integrated with Manus OAuth authentication
 */

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect to dashboard if already logged in (using useEffect to avoid render-time navigation)
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render anything while redirecting
  if (isAuthenticated && user) {
    return null;
  }

  const handleOAuthSignup = () => {
    startLogin();
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white">
      {/* Header/Navigation */}
      <header className="border-b-2 border-[#ff00ff] bg-[#0a0e27] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#ff00ff] rounded-sm flex items-center justify-center font-bold text-lg glow-magenta">
              A
            </div>
            <span className="font-bold text-xl glow-magenta">ANOM // ARTSY</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center text-sm">
            <a href="/" className="hover:text-[#ff00ff] transition-colors duration-200">
              HOME
            </a>
            <a href="/sanctuary" className="hover:text-[#ff00ff] transition-colors duration-200">
              SANCTUARY
            </a>
            <a href="/explore" className="hover:text-[#ff00ff] transition-colors duration-200">
              EXPLORE
            </a>
          </nav>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#b0b8d4]">{user?.name || user?.email}</span>
              <button
                onClick={() => navigate("/dashboard")}
                className="neon-button text-sm"
              >
                DASHBOARD
              </button>
              <button
                onClick={() => logout()}
                className="neon-button text-sm"
              >
                SIGN OUT
              </button>
            </div>
          ) : (
            <button
              onClick={handleOAuthSignup}
              className="neon-button text-sm"
            >
              SIGN IN
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block border-2 border-[#ff00ff] px-4 py-2 rounded-sm hover:shadow-[0_0_20px_rgba(255,0,255,0.6)] transition-all duration-300">
              <span className="text-xs font-bold text-[#ff00ff] glow-magenta">
                🎨 ARTIST FIRST PLATFORM
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold glow-magenta leading-tight">
              Identity,<br />
              Amplified
            </h1>
            <p className="text-lg text-[#b0b8d4] max-w-md leading-relaxed">
              Join the Anom Artsy community — a neon-lit sanctuary where artists first, creativity thrives, and identity is amplified. Create, collaborate, and make world social good impact.
            </p>
            <div className="flex gap-4 pt-4">
              <button className="neon-button">Explore the Universe</button>
              <button className="px-6 py-3 border-2 border-[#00ffff] text-[#00ffff] rounded-sm hover:bg-[#00ffff]/10 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] transition-all duration-200">
                Support Now
              </button>
            </div>
          </div>

          {/* Right - Signup Form */}
          <div className="border-2 border-[#ff00ff] bg-[#1a1f3a] p-8 rounded-sm space-y-6 hover:shadow-[0_0_30px_rgba(255,0,255,0.3)] transition-all duration-300">
            {!showSuccess ? (
              <>
                <h2 className="text-2xl font-bold glow-magenta">Join Anom Artsy</h2>
                
                <div className="space-y-4">
                  {/* Manus OAuth Signup */}
                  <button
                    onClick={handleOAuthSignup}
                    className="w-full bg-[#ff00ff] text-white py-3 rounded-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#ff1493] hover:shadow-[0_0_25px_rgba(255,0,255,0.8)]"
                  >
                    <span>✨</span> Sign up with Anom
                  </button>

                  {/* Facebook Signup */}
                  <button
                    className="w-full bg-[#1877F2] text-white py-3 rounded-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#166fe5] hover:shadow-[0_0_15px_rgba(24,119,242,0.6)]"
                  >
                    <span>f</span> Sign up with Facebook
                  </button>

                  {/* Google Signup */}
                  <button
                    className="w-full bg-white text-black py-3 rounded-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:bg-gray-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  >
                    <span>🔍</span> Sign up with Google
                  </button>
                </div>

                <p className="text-xs text-[#7a8199] text-center">
                  By signing up, you agree to our <a href="#" className="text-[#00ffff] hover:underline">Terms of Service</a> and <a href="#" className="text-[#00ffff] hover:underline">Privacy Policy</a>
                </p>
              </>
            ) : (
              /* Success Message */
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="text-6xl animate-bounce">
                  <CheckCircle className="w-16 h-16 text-[#00ffff] glow-cyan" />
                </div>
                <h3 className="text-2xl font-bold glow-cyan text-center">Welcome to Anom Artsy!</h3>
                <p className="text-[#b0b8d4] text-center">
                  Check your email for next steps and start your creative journey.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social Good Section */}
      <section className="bg-gradient-to-r from-[#1a1f3a] to-[#2d3557] border-t-2 border-b-2 border-[#ff00ff] py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl font-bold">
            <span className="glow-magenta">Social Good</span>
            <span className="text-[#00ffff] glow-cyan"> Meets </span>
            <span className="glow-magenta">Creative Power</span>
          </h2>
          <p className="text-lg text-[#b0b8d4] max-w-2xl mx-auto">
            Every voice earned, every collaboration started, every voice amplified — all artists, creators, and visionaries building a better world together.
          </p>
          <button className="neon-button">Explore Our Impact</button>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 glow-magenta">
          What Awaits You
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Card 1 */}
          <div className="neon-card group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-4 text-[#00ffff] group-hover:scale-125 transition-transform duration-300">💰</div>
            <h3 className="text-xl font-bold mb-3 text-[#00ffff]">Anom Coin Economy</h3>
            <p className="text-[#b0b8d4]">
              Earn coins through missions, games, and collaborations. Unlock them on profile, merch, and exclusive content.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="neon-card group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-4 text-[#ff00ff] group-hover:scale-125 transition-transform duration-300">👥</div>
            <h3 className="text-xl font-bold mb-3 text-[#ff00ff]">Private Lounges</h3>
            <p className="text-[#b0b8d4]">
              Create family, friend, and fan channels. Connect, collaborate, and customize your space with friends.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="neon-card group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-4 text-[#9d00ff] group-hover:scale-125 transition-transform duration-300">🎮</div>
            <h3 className="text-xl font-bold mb-3 text-[#9d00ff]">Mini-Games</h3>
            <p className="text-[#b0b8d4]">
              Play trivia, memory, mood, mystery, and more. Climb the leaderboard, earn coins, and unlock rewards.
            </p>
          </div>

          {/* Feature Card 4 */}
          <div className="neon-card group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-4 text-[#ff1493] group-hover:scale-125 transition-transform duration-300">❤️</div>
            <h3 className="text-xl font-bold mb-3 text-[#ff1493]">Safe Space</h3>
            <p className="text-[#b0b8d4]">
              A safe space for children and teens. Moderated, safe, offline-friendly, and designed for their wellbeing.
            </p>
          </div>

          {/* Feature Card 5 */}
          <div className="neon-card group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-4 text-[#00d9ff] group-hover:scale-125 transition-transform duration-300">🎨</div>
            <h3 className="text-xl font-bold mb-3 text-[#00d9ff]">Profile Customization</h3>
            <p className="text-[#b0b8d4]">
              Apply neon themes, character designs, and profile layouts. Customize your space with your unique style.
            </p>
          </div>

          {/* Feature Card 6 */}
          <div className="neon-card group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-4 text-[#ff00ff] group-hover:scale-125 transition-transform duration-300">🎯</div>
            <h3 className="text-xl font-bold mb-3 text-[#ff00ff]">Missions & Contributions</h3>
            <p className="text-[#b0b8d4]">
              Join community missions. Contribute to collective stability and earn recognition for your impact.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] border-t-2 border-[#00ffff] py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl font-bold glow-cyan">
            Ready to join the Anom Universe?
          </h2>
          <button
            onClick={handleOAuthSignup}
            className="neon-button text-lg"
          >
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#ff00ff] bg-[#050812] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-[#ff00ff] mb-4">PLATFORM</h4>
              <ul className="space-y-2 text-sm text-[#b0b8d4]">
                <li><a href="/" className="hover:text-[#ff00ff] transition-colors duration-200">Explore</a></li>
                <li><a href="/sanctuary" className="hover:text-[#ff00ff] transition-colors duration-200">Sanctuary</a></li>
                <li><a href="#" className="hover:text-[#ff00ff] transition-colors duration-200">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#00ffff] mb-4">COMMUNITY</h4>
              <ul className="space-y-2 text-sm text-[#b0b8d4]">
                <li><a href="#" className="hover:text-[#00ffff] transition-colors duration-200">Discord</a></li>
                <li><a href="https://twitter.com/anomoriginals" className="hover:text-[#00ffff] transition-colors duration-200">Twitter</a></li>
                <li><a href="https://instagram.com/anomoriginals" className="hover:text-[#00ffff] transition-colors duration-200">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#9d00ff] mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-sm text-[#b0b8d4]">
                <li><a href="#" className="hover:text-[#9d00ff] transition-colors duration-200">Help Center</a></li>
                <li><a href="mailto:hello@anomartsy.com" className="hover:text-[#9d00ff] transition-colors duration-200">Contact</a></li>
                <li><a href="#" className="hover:text-[#9d00ff] transition-colors duration-200">Report</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#ff1493] mb-4">LEGAL</h4>
              <ul className="space-y-2 text-sm text-[#b0b8d4]">
                <li><a href="#" className="hover:text-[#ff1493] transition-colors duration-200">Privacy</a></li>
                <li><a href="#" className="hover:text-[#ff1493] transition-colors duration-200">Terms</a></li>
                <li><a href="#" className="hover:text-[#ff1493] transition-colors duration-200">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#2d3557] pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#7a8199]">
            <p>&copy; 2026 Anom Artsy. All rights reserved.</p>
            <p>Made with 💜 for creators</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
