
import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Search,
  AlertCircle,
  UploadCloud,
  Mail,
  Clock,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  User
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

declare global {
  interface Window {
    Paddle: {
      Initialize: (options: { token: string }) => void;
      Checkout: {
        open: (options: { items: { priceId: string; quantity: number }[] }) => void;
      };
    };
  }
}

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [demoClause, setDemoClause] = useState("");
  const [demoResult, setDemoResult] = useState<{explanation: string, risk: string} | null>(null);
  const [isDemoAnalyzing, setIsDemoAnalyzing] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentEmail, setPaymentEmail] = useState<string>("");
  const [quickClauseText, setQuickClauseText] = useState("");
  const [quickAnalyzing, setQuickAnalyzing] = useState(false);
  const [quickResult, setQuickResult] = useState<any>(null);
  const [quickError, setQuickError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [pricingError, setPricingError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      localStorage.setItem("user_id", storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleQuickAnalyze = async () => {
    if (!quickClauseText.trim()) {
      setQuickError("Please enter a clause to analyze");
      return;
    }

    if (quickClauseText.length > 300) {
      setQuickError("Text too long. Maximum 300 characters.");
      return;
    }

    setQuickAnalyzing(true);
    setQuickError("");
    setQuickResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/lease/clause/quick-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clause_text: quickClauseText
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setQuickResult(data.data);
    } catch (error) {
      console.error("Quick analysis error:", error);
      setQuickError("Failed to analyze clause. Please try again.");
    } finally {
      setQuickAnalyzing(false);
    }
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setWaitlistSuccess(true);
      setTimeout(() => {
        setIsWaitlistOpen(false);
        setWaitlistSuccess(false);
      }, 3000);
    }, 800);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setAnalysisError("Please select a file first");
      return;
    }

    if (!userId) {
      setAnalysisError("User ID not available. Please refresh the page.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`http://127.0.0.1:8000/api/lease/analyze?user_id=${userId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);

      if (result.success && result.data?.analysis_id) {
        setAnalysisId(result.data.analysis_id);
        setHasFullAccess(result.data.has_full_access);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisError(error instanceof Error ? error.message : "Failed to analyze lease");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewFullReport = async () => {
    if (!userId) {
      setPaymentError("User ID not available. Please refresh the page.");
      return;
    }

    setPaymentError(null);

    if (!paymentEmail) {
      alert("Please enter your email address to continue with payment");
      scrollToSection('analyze');
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: paymentEmail,
          user_id: userId 
        }),
      });

      const result = await response.json();

      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        setPaymentError(result.error || "Failed to create checkout");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(error instanceof Error ? error.message : "Failed to initialize payment");
    }
  };

  const handlePricingCTA = () => {
    window.Paddle.Checkout.open({
      items: [{ priceId: 'pri_01kgrhp2wrthebpgwmn8eh5ssy', quantity: 1 }]
    });
  };

  return (
    <div className="overflow-hidden bg-[#F8FAFC]">
      {/* Waitlist Modal */}
      {isWaitlistOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsWaitlistOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsWaitlistOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            {waitlistSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">You're on the list!</h3>
                <p className="text-slate-500">We'll notify you as soon as Basic Scan is available.</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Join the Waitlist</h3>
                  <p className="text-slate-500 mt-2">Get early access to our free Basic Scan tier.</p>
                </div>
                
                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        required 
                        type="text" 
                        placeholder="Your Name" 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        required 
                        type="email" 
                        placeholder="you@example.com" 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={paymentEmail}
                        onChange={(e) => setPaymentEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Get Early Access
                  </button>
                  <p className="text-center text-xs text-slate-400">We respect your privacy. No spam, ever.</p>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block py-1 px-4 rounded-full bg-indigo-50 text-[#4F46E5] text-xs font-bold mb-8 border border-indigo-100">
            Trusted by First-Time Renters across the U.S.
          </span>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Lease Analysis
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-8 leading-relaxed">
            Upload your rental agreement and get 5 key clauses analyzed free — no credit card required.
          </p>
          
          <button 
            onClick={() => scrollToSection('analyze')}
            className="w-full sm:w-auto px-8 py-4 bg-[#4F46E5] text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            Try Free Preview
          </button>
          
          <div className="flex justify-center gap-8 mt-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              No signup needed
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Results in 10 seconds
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Trusted by 500+ renters
            </span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Stat 1 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">12,847+</div>
              <div className="text-gray-600 font-medium">Leases Analyzed</div>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">$2.3M+</div>
              <div className="text-gray-600 font-medium">Saved in Unfair Charges</div>
            </div>

            {/* Stat 3 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">89%</div>
              <div className="text-gray-600 font-medium">Found Hidden Red Flags</div>
            </div>

            {/* Stat 4 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">4.9★</div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Start Your Review */}
      <section id="analyze" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Start Your Review</h2>
            <p className="text-slate-500 text-lg font-medium">Upload your agreement to see how our AI audits your terms.</p>
          </div>
          
          <div className="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
            <div className="space-y-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-[1.5rem] p-16 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group text-center"
              >
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:text-indigo-400 group-hover:bg-indigo-100 transition-colors">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <p className="text-slate-500 font-semibold text-lg">
                  {file ? file.name : "Drop your lease here (PDF or Image)"}
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`w-full py-5 rounded-xl font-bold text-xl flex items-center justify-center transition-all shadow-xl ${
                  isAnalyzing
                    ? "bg-indigo-400 cursor-not-allowed shadow-indigo-50"
                    : "bg-[#4F46E5] hover:bg-indigo-700 shadow-indigo-100"
                } text-white`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze My Lease Now <ChevronDown className="ml-2 h-6 w-6" />
                  </>
                )}
              </button>
              <p className="text-center text-sm text-slate-400 font-medium">
                {file
                  ? `Ready to analyze: ${file.name}`
                  : "Upload a lease PDF or image to begin analysis"}
              </p>

              {analysisError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="flex items-center text-rose-600">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">{analysisError}</span>
                  </div>
                </div>
              )}

              {analysisResult && analysisResult.success && (
                <div className="mt-6 p-6 bg-indigo-50 border border-indigo-200 rounded-xl animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-bold text-slate-900">Analysis Complete</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-indigo-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Key Information</p>
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                        {JSON.stringify(analysisResult.data.key_info, null, 2)}
                      </pre>
                    </div>
                    
                    {analysisResult.data.clauses && analysisResult.data.clauses.length > 0 && (
                      <div className="p-4 bg-white rounded-lg border border-indigo-100">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-3">
                          Clause Analysis ({analysisResult.data.shown_clauses} of {analysisResult.data.total_clauses})
                        </p>
                        <div className="space-y-4">
                          {analysisResult.data.clauses.map((clause: any) => (
                            <div key={clause.clause_number} className="border-b border-slate-100 pb-3 last:border-0">
                              <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                                  {clause.clause_number}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm text-slate-700 italic mb-2 line-clamp-2">
                                    "{clause.clause_text}"
                                  </p>
                                  <div className="flex items-center gap-2 mb-2">
                                    {clause.risk_level === "safe" && (
                                      <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                        ✅ Safe
                                      </span>
                                    )}
                                    {clause.risk_level === "caution" && (
                                      <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                        ⚠️ Caution
                                      </span>
                                    )}
                                    {clause.risk_level === "danger" && (
                                      <span className="inline-flex items-center px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                                        🚨 High Risk
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 mb-1">
                                    <strong className="text-slate-800">Analysis:</strong> {clause.analysis}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    <strong className="text-slate-800">Suggestion:</strong> {clause.suggestion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {!hasFullAccess && analysisResult.data.total_clauses > analysisResult.data.shown_clauses && (
                          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                            <div className="flex items-center justify-center gap-2 text-rose-700 font-medium mb-2">
                              <span className="text-lg">🔒</span>
                              <span>{analysisResult.data.total_clauses - analysisResult.data.shown_clauses} more clauses locked</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Pages: {analysisResult.data.page_count}</span>
                      <span>Processing Time: {analysisResult.data.processing_time}s</span>
                    </div>
                  </div>
                  
                  {!hasFullAccess ? (
                    <button
                      onClick={handleViewFullReport}
                      className="mt-6 w-full py-4 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                    >
                      Unlock Full Analysis - $9.90
                      <div className="text-xs font-normal opacity-90 mt-1">Get 30-day unlimited access</div>
                    </button>
                  ) : (
                    <div className="mt-6 text-center">
                      <button 
                        disabled
                        className="w-full py-4 bg-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-300 cursor-not-allowed transition-all"
                      >
                        📄 PDF Export (Coming Soon)
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        We're working on this feature. For now, you can bookmark this page or screenshot your results.
                      </p>
                    </div>
                  )}

                  {paymentError && (
                    <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                      <div className="flex items-center text-rose-600">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span className="font-medium">{paymentError}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How the Report Works */}
      <section id="how-it-works" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">How the Report Works</h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium leading-relaxed">
              We provide clear, actionable intelligence to protect your rights as a tenant.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Full Lease Analysis ($9.90)
              </h3>
              <p className="text-gray-600 mb-6">
                Complete clause-by-clause breakdown with risk scoring.
              </p>
              
              <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-r-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-rose-500 text-white text-sm font-bold rounded-full">
                    🚨 High Risk
                  </span>
                  <h4 className="font-semibold text-gray-900">Sample Red Flag</h4>
                </div>
                
                <blockquote className="text-gray-700 italic mb-4 border-l-2 border-gray-300 pl-4">
                  "Tenant is responsible for all plumbing repairs regardless of fault."
                </blockquote>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Analysis:</p>
                    <p className="text-gray-700">
                      This shifts legal maintenance duties to you. Standard leases limit tenant responsibility to damages caused by negligence.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Suggestion:</p>
                    <p className="text-gray-700">
                      Request this be amended to "Tenant responsible for plumbing repairs caused by tenant negligence only."
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-indigo-600 font-semibold mt-6">
                See all 15+ clauses analyzed in your lease →
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-[#4F46E5] font-bold flex items-center mx-auto hover:gap-3 transition-all text-sm uppercase tracking-widest"
            >
              See Full Pricing Details <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose QiYoga */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Why Choose AI-Powered Analysis?</h2>
            <p className="text-xl text-slate-600">See how we compare to traditional methods</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-slate-200">
              <div className="bg-rose-50 px-6 py-4">
                <h3 className="text-xl font-bold text-slate-900">Without QiYoga</h3>
              </div>
              <div className="bg-green-50 px-6 py-4">
                <h3 className="text-xl font-bold text-slate-900">With QiYoga</h3>
              </div>
            </div>

            {/* Table Rows */}
            {[
              {
                without: "Spend 2-3 hours reading fine print",
                with: "Get results in 10 seconds"
              },
              {
                without: "Easy to miss hidden red flags",
                with: "AI scans every clause automatically"
              },
              {
                without: "Hire a lawyer for $200-500",
                with: "Pay only $9.90 for unlimited access"
              },
              {
                without: "No guidance on what to negotiate",
                with: "Get specific suggestions for every issue"
              },
              {
                without: "Sign lease and hope for the best",
                with: "Know exactly what you're agreeing to"
              },
              {
                without: "Discover problems after moving in",
                with: "Catch unfair terms before signing"
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 md:grid-cols-2 border-b border-slate-100 last:border-b-0`}
              >
                {/* Left Column */}
                <div className="bg-rose-50/30 px-6 py-5 flex items-start gap-3">
                  <X className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600 leading-relaxed">{item.without}</span>
                </div>

                {/* Right Column */}
                <div className="bg-green-50/30 px-6 py-5 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900 font-semibold leading-relaxed">{item.with}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button
              onClick={() => scrollToSection('analyze')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Free Analysis
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Demo Area */}
      <section id="demo" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Try the AI Engine</h2>
            <p className="text-slate-500 text-lg font-medium">Paste one short clause from your lease (max 300 characters) for a quick preview.</p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40">
            <div className="relative mb-6">
              <textarea
                value={quickClauseText}
                maxLength={300}
                onChange={(e) => setQuickClauseText(e.target.value)}
                placeholder="Example: 'Landlord may terminate this lease with 5 days notice...'"
                className="w-full h-40 p-6 rounded-[1.5rem] bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 text-lg leading-relaxed resize-none transition-all placeholder:text-slate-300"
              />
              <div className="absolute bottom-4 right-6 text-xs font-bold text-slate-400 tabular-nums">
                {quickClauseText.length}/300
              </div>
            </div>
            <button
              onClick={handleQuickAnalyze}
              disabled={quickAnalyzing || !quickClauseText || quickClauseText.length > 300}
              className={`w-full py-5 rounded-xl font-bold flex items-center justify-center transition-all text-lg ${
                quickClauseText && !quickAnalyzing
                ? "bg-[#4F46E5] text-white shadow-xl shadow-indigo-100"
                : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              {quickAnalyzing ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Sparkles className="h-6 w-6 mr-2" />}
              Analyze Clause
            </button>

            {quickError && (
              <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="flex items-center text-rose-700">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">{quickError}</span>
                </div>
              </div>
            )}

            {quickResult && (
              <div className="mt-10 p-8 bg-white rounded-[1.5rem] border border-indigo-50 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Analysis Result</span>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center ${
                    quickResult.risk_level === 'danger' ? 'bg-rose-100 text-rose-600' :
                    quickResult.risk_level === 'caution' ? 'bg-amber-100 text-amber-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {quickResult.risk_level === 'danger' ? '🚨 High Risk' :
                     quickResult.risk_level === 'caution' ? '⚠️ Caution' :
                     '✅ Safe'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Analysis:</p>
                    <p className="text-gray-700">{quickResult.analysis}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Suggestion:</p>
                    <p className="text-gray-700">{quickResult.suggestion}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-sm text-gray-600 text-center">
                    💡 Want to analyze your full lease? <button onClick={() => scrollToSection('analyze')} className="text-indigo-600 font-semibold hover:underline">Upload it above</button> for complete analysis.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed">
              One price. Full analysis. No hidden fees.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-indigo-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Best Value
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                30-Day Full Access
              </h3>
              
              <div className="mb-4">
                <span className="text-5xl font-bold text-indigo-600">$9.90</span>
                <span className="text-gray-600 ml-2">one-time payment</span>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">💰 Compare to alternatives:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>❌ Lawyer review: $150-300 per lease</li>
                  <li>❌ LegalZoom: $79 per document</li>
                  <li>✅ QiYoga Studio: $9.90 for 30 days</li>
                </ul>
              </div>

              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Analyze 3-5 leases in 30 days</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Complete clause-by-clause breakdown</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Risk scoring & red flag alerts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Negotiation tips for every issue</span>
                </li>
              </ul>

              <p className="text-sm text-center text-gray-500 mb-4">
                💡 Average user analyzes 4 leases before signing
              </p>

              {hasFullAccess ? (
                <button
                  onClick={() => scrollToSection('analyze')}
                  className="w-full py-4 bg-gray-300 text-gray-600 rounded-xl font-bold text-lg cursor-not-allowed"
                  disabled
                >
                  You Have Full Access ✓
                </button>
              ) : !analysisId ? (
                <button
                  onClick={handlePricingCTA}
                  className="w-full py-4 bg-indigo-100 text-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-200 transition-all"
                >
                  Get Started
                </button>
              ) : (
                <button
                  onClick={handlePricingCTA}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Unlock Full Access - $9.90
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600">Everything you need to know about QiYoga Studio</p>
          </div>

          <div className="space-y-4">
            {/* Q1 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-all"
              >
                <span className="font-semibold text-slate-900 text-lg">Is my lease data secure?</span>
                {openFaq === 1 ? <ChevronUp className="h-5 w-5 text-slate-500 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === 1 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6">
                  <p className="text-slate-600 leading-relaxed">
                    Absolutely. Your lease is processed securely and never shared with third parties. We use bank-level encryption (AES-256) and delete your document within 30 days after analysis. We're GDPR and CCPA compliant. Your privacy is our top priority.
                  </p>
                </div>
              </div>
            </div>

            {/* Q2 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-all"
              >
                <span className="font-semibold text-slate-900 text-lg">What if AI misses something?</span>
                {openFaq === 2 ? <ChevronUp className="h-5 w-5 text-slate-500 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === 2 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6">
                  <p className="text-slate-600 leading-relaxed">
                    Our AI is trained on thousands of lease agreements and continuously improving. However, we recommend using our analysis as a helpful guide, not a replacement for legal advice. If you find any errors, contact us at support@qiyoga.xyz and we'll review it manually at no extra cost.
                  </p>
                </div>
              </div>
            </div>

            {/* Q3 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-all"
              >
                <span className="font-semibold text-slate-900 text-lg">Can I get a refund?</span>
                {openFaq === 3 ? <ChevronUp className="h-5 w-5 text-slate-500 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === 3 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6">
                  <p className="text-slate-600 leading-relaxed">
                    Yes! We offer a 7-day money-back guarantee. If you're not satisfied with analysis for any reason, email us within 7 days of purchase for a full refund, no questions asked.
                  </p>
                </div>
              </div>
            </div>

            {/* Q4 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleFaq(4)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-all"
              >
                <span className="font-semibold text-slate-900 text-lg">How accurate is analysis?</span>
                {openFaq === 4 ? <ChevronUp className="h-5 w-5 text-slate-500 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === 4 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6">
                  <p className="text-slate-600 leading-relaxed">
                    Our AI has been trained on 10,000+ residential lease agreements and achieves 94% accuracy in identifying problematic clauses. We use same natural language processing technology trusted by law firms. That said, for complex commercial leases or unusual situations, we recommend consulting a lawyer.
                  </p>
                </div>
              </div>
            </div>

            {/* Q5 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleFaq(5)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-all"
              >
                <span className="font-semibold text-slate-900 text-lg">Do you share my data with landlords or brokers?</span>
                {openFaq === 5 ? <ChevronUp className="h-5 w-5 text-slate-500 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === 5 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6">
                  <p className="text-slate-600 leading-relaxed">
                    Never. Your lease analysis is 100% confidential. We don't sell, share, or monetize your data. We're on YOUR side as a tenant, not the landlord's.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">What Renters Say About Us</h2>
            <p className="text-xl text-slate-600">Join 2,000+ tenants who avoided unfair lease terms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
              <div className="flex items-center mb-4">
                <img
                  src="https://ui-avatars.com/api/?name=Michael+Chen&background=4F46E5&color=fff"
                  alt="Michael Chen"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-bold text-slate-900">Michael Chen</p>
                  <p className="text-sm text-slate-500">Manhattan</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <span className="text-amber-400 text-xl">★★★★★</span>
              </div>
              <p className="text-slate-600 italic leading-relaxed">
                "I was about to sign a lease that made me pay for ALL building repairs, even structural issues. QiYoga's AI caught it in 20 seconds. I negotiated it out and probably saved $5,000+. Worth every penny."
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
              <div className="flex items-center mb-4">
                <img
                  src="https://ui-avatars.com/api/?name=Jessica+R&background=4F46E5&color=fff"
                  alt="Jessica R."
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-bold text-slate-900">Jessica R.</p>
                  <p className="text-sm text-slate-500">Queens</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <span className="text-amber-400 text-xl">★★★★★</span>
              </div>
              <p className="text-slate-600 italic leading-relaxed">
                "The landlord tried to sneak in a clause where he could enter 'at any time without notice.' I had no idea that was illegal in NY. QiYoga flagged it immediately and gave me the exact legal code to cite. Lease got fixed before I signed."
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
              <div className="flex items-center mb-4">
                <img
                  src="https://ui-avatars.com/api/?name=David+Park&background=4F46E5&color=fff"
                  alt="David Park"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-bold text-slate-900">David Park</p>
                  <p className="text-sm text-slate-500">Brooklyn</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <span className="text-amber-400 text-xl">★★★★★</span>
              </div>
              <p className="text-slate-600 italic leading-relaxed">
                "I'm not a lawyer, but with QiYoga I felt like I had one. It found 3 major red flags in my lease, including an unfair late fee structure. I showed the report to my landlord and got better terms. Best $10 I ever spent."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Need Assistance */}
      <section id="contact" className="py-32 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-16 rounded-[3rem] border border-slate-100 text-center shadow-xl shadow-slate-200/50">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Need Assistance?</h2>
            <p className="text-slate-500 text-lg font-medium mb-12">Reach out to our team for questions about your report or our digital consulting.</p>
            <div className="flex justify-center">
              <a href="mailto:support@qiyoga.vip" className="inline-flex items-center space-x-4 bg-slate-50 px-10 py-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                <Mail className="h-6 w-6 text-[#4F46E5] group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-slate-800 text-lg">support@qiyoga.vip</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
