import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import {
  ArrowLeft, Lock, CheckCircle, ChevronRight, BookOpen,
  PiggyBank, CreditCard, TrendingUp, Users, Zap, Star, Coins
} from "lucide-react";

// ─── Lesson Data ─────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  summary: string;
  content: string;
  quiz: { question: string; options: string[]; correct: number; explanation: string };
  coins: number;
}

interface Module {
  id: string;
  title: string;
  tagline: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  glowColor: string;
  realWorldConcept: string;
  lessons: Lesson[];
  unlockRequirement?: string; // moduleId that must be completed first
}

const MODULES: Module[] = [
  {
    id: "vault",
    title: "The Vault",
    tagline: "Savings Account",
    icon: <PiggyBank className="w-6 h-6" />,
    color: "from-green-400 to-emerald-500",
    borderColor: "border-green-400/50",
    glowColor: "rgba(74,222,128,0.25)",
    realWorldConcept: "Savings Account",
    lessons: [
      {
        id: "vault-1",
        moduleId: "vault",
        title: "What Is a Savings Account?",
        summary: "Learn why keeping coins in the Vault earns you more over time.",
        content: `A savings account is a safe place to store money you don't need right now. In the real world, banks pay you a small amount called **interest** just for keeping your money there. The longer you save, the more interest you earn — this is called **compound interest**, and it's one of the most powerful forces in personal finance.\n\nIn AO-City, the Vault works the same way. Every 7 days, your Vault balance earns a small bonus. The more you deposit, the more you earn. The key rule: don't touch it unless you really need to.`,
        quiz: {
          question: "What do you earn by keeping coins in the Vault?",
          options: ["Nothing — it just keeps them safe", "Interest — a bonus for saving", "Debt — you owe coins back", "XP points only"],
          correct: 1,
          explanation: "Correct! Savings accounts pay interest — a reward for keeping your money stored safely over time."
        },
        coins: 10,
      },
      {
        id: "vault-2",
        moduleId: "vault",
        title: "Compound Interest: The Snowball Effect",
        summary: "Discover how interest on interest makes your savings grow faster.",
        content: `Imagine you put 100 coins in the Vault. After one month, you earn 5 coins in interest — now you have 105. Next month, you earn interest on 105, not just 100. That extra 5 coins is now earning interest too. This is **compound interest** — interest on your interest.\n\nOver time, this creates a snowball effect. Small amounts saved consistently can grow into much larger amounts. The earlier you start saving, the more time compound interest has to work. This is why financial experts say: **start saving as early as possible, even if it's a small amount.**`,
        quiz: {
          question: "With compound interest, what earns interest in the second month?",
          options: ["Only your original deposit", "Your original deposit plus the interest you already earned", "Only the interest you earned", "Nothing — interest only applies once"],
          correct: 1,
          explanation: "Exactly! Compound interest means your interest also earns interest — that's what makes it so powerful over time."
        },
        coins: 15,
      },
      {
        id: "vault-3",
        moduleId: "vault",
        title: "Emergency Fund: Your Safety Net",
        summary: "Why every saver needs 3 months of expenses set aside.",
        content: `An **emergency fund** is money you save specifically for unexpected situations — a broken device, a medical bill, losing a job. Financial experts recommend saving at least 3 months of your regular expenses in an emergency fund before investing or spending on anything else.\n\nWithout an emergency fund, unexpected costs force you to borrow money — which costs even more. With one, you can handle surprises without going into debt. In AO-City, your Vault serves as your emergency fund. Before spending coins on anything else, try to keep a healthy Vault balance as your safety net.`,
        quiz: {
          question: "How many months of expenses should an emergency fund cover?",
          options: ["1 week", "1 month", "At least 3 months", "10 years"],
          correct: 2,
          explanation: "Financial experts recommend at least 3 months of expenses in an emergency fund to handle unexpected situations without going into debt."
        },
        coins: 15,
      },
    ],
  },
  {
    id: "exchange",
    title: "The Exchange",
    tagline: "Checking Account",
    icon: <CreditCard className="w-6 h-6" />,
    color: "from-blue-400 to-cyan-500",
    borderColor: "border-blue-400/50",
    glowColor: "rgba(96,165,250,0.25)",
    realWorldConcept: "Checking Account",
    unlockRequirement: "vault",
    lessons: [
      {
        id: "exchange-1",
        moduleId: "exchange",
        title: "Checking vs. Savings: What's the Difference?",
        summary: "Learn when to use your spending balance vs. your Vault.",
        content: `A **checking account** is for everyday spending — paying bills, buying groceries, sending money to friends. A **savings account** is for money you're setting aside for the future. The key difference: checking accounts are designed to be used frequently, while savings accounts are designed to be left alone.\n\nIn AO-City, your coin balance is your checking account. Your Vault is your savings account. The golden rule: always keep some coins in your Vault, and only spend from your balance what you've budgeted for.`,
        quiz: {
          question: "Which account is designed for everyday spending?",
          options: ["Savings account", "Checking account", "Investment account", "Credit account"],
          correct: 1,
          explanation: "Checking accounts are designed for frequent, everyday transactions — paying bills, buying things, sending money."
        },
        coins: 10,
      },
      {
        id: "exchange-2",
        moduleId: "exchange",
        title: "Budgeting: The 50/30/20 Rule",
        summary: "A simple framework for managing any income.",
        content: `The **50/30/20 rule** is one of the most popular budgeting frameworks. It works like this:\n\n- **50%** of your income goes to **needs** — rent, food, utilities, transportation\n- **30%** goes to **wants** — entertainment, dining out, hobbies\n- **20%** goes to **savings and debt repayment**\n\nIn AO-City terms: if you earn 100 coins from missions and games, put 20 coins in the Vault immediately, spend up to 50 on essential platform activities, and use 30 for fun extras. This simple rule prevents overspending and builds savings automatically.`,
        quiz: {
          question: "In the 50/30/20 rule, what percentage goes to savings?",
          options: ["50%", "30%", "20%", "10%"],
          correct: 2,
          explanation: "The 50/30/20 rule allocates 20% to savings and debt repayment — the foundation of financial health."
        },
        coins: 15,
      },
    ],
  },
  {
    id: "credit-bureau",
    title: "The Credit Bureau",
    tagline: "Credit Score & Credit Line",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-yellow-400 to-orange-500",
    borderColor: "border-yellow-400/50",
    glowColor: "rgba(250,204,21,0.25)",
    realWorldConcept: "Credit Score & Credit Line",
    unlockRequirement: "exchange",
    lessons: [
      {
        id: "credit-1",
        moduleId: "credit-bureau",
        title: "What Is a Credit Score?",
        summary: "Understand the number that follows you through financial life.",
        content: `A **credit score** is a number (typically 300–850 in the US) that tells lenders how likely you are to repay borrowed money. The higher your score, the more trust lenders have in you — and the better interest rates you get on loans.\n\nYour credit score is calculated from five factors:\n1. **Payment history** (35%) — Do you pay on time?\n2. **Credit utilization** (30%) — How much of your available credit are you using?\n3. **Length of credit history** (15%) — How long have you had credit?\n4. **Credit mix** (10%) — Do you have different types of credit?\n5. **New credit** (10%) — Have you recently applied for new credit?\n\nIn AO-City, your **Social Good Score (SGS)** works the same way — it reflects your trustworthiness and community standing.`,
        quiz: {
          question: "What is the most important factor in a credit score?",
          options: ["How much money you have", "Payment history — paying on time", "How many credit cards you have", "Your age"],
          correct: 1,
          explanation: "Payment history makes up 35% of your credit score — the single biggest factor. Paying on time, every time, is the foundation of good credit."
        },
        coins: 15,
      },
      {
        id: "credit-2",
        moduleId: "credit-bureau",
        title: "Borrowing Responsibly",
        summary: "How to use credit as a tool, not a trap.",
        content: `Credit is a tool — used well, it helps you build wealth. Used poorly, it creates debt that's hard to escape. The key rules of responsible borrowing:\n\n1. **Only borrow what you can repay** — Never borrow more than you can pay back within the agreed time\n2. **Pay on time, every time** — Late payments damage your credit score and often trigger fees\n3. **Don't max out your credit** — Using more than 30% of your available credit hurts your score\n4. **Understand the cost** — Interest makes borrowed money more expensive than cash\n\nIn AO-City, your Credit Line lets you borrow coins against your Social Good Score. Repay on time and your SGS goes up. Miss a repayment and it goes down — just like real credit.`,
        quiz: {
          question: "What percentage of your credit limit should you try to stay below to protect your score?",
          options: ["100%", "75%", "30%", "10%"],
          correct: 2,
          explanation: "Keeping your credit utilization below 30% is a key rule for maintaining a healthy credit score."
        },
        coins: 20,
      },
    ],
  },
  {
    id: "investment-floor",
    title: "The Investment Floor",
    tagline: "Community Investment",
    icon: <Users className="w-6 h-6" />,
    color: "from-purple-400 to-pink-500",
    borderColor: "border-purple-400/50",
    glowColor: "rgba(192,132,252,0.25)",
    realWorldConcept: "Community Investment & Collective Economics",
    unlockRequirement: "credit-bureau",
    lessons: [
      {
        id: "invest-1",
        moduleId: "investment-floor",
        title: "What Is Investing?",
        summary: "How putting money to work creates more money over time.",
        content: `**Investing** means putting money into something with the expectation that it will grow in value over time. Unlike saving (which earns small, predictable interest), investing involves risk — but also the potential for much higher returns.\n\nCommon types of investments include stocks (ownership in a company), bonds (loans to governments or companies), real estate, and mutual funds. The key principle: **diversification** — spreading your investments across different types reduces risk, because not everything goes down at the same time.\n\nIn AO-City, the Community Investment Pool is a collective investment — members pool coins together to fund shared bounties that reward everyone. This teaches cooperative economics: when the community invests together, everyone benefits.`,
        quiz: {
          question: "What is the main difference between saving and investing?",
          options: [
            "Saving earns no money; investing always loses money",
            "Saving earns small, predictable returns; investing has higher potential returns but also risk",
            "Investing is only for rich people",
            "There is no difference"
          ],
          correct: 1,
          explanation: "Saving offers predictable, lower returns with no risk. Investing offers higher potential returns but comes with risk — the trade-off is at the heart of financial planning."
        },
        coins: 20,
      },
      {
        id: "invest-2",
        moduleId: "investment-floor",
        title: "Social Good Economics",
        summary: "How investing in community creates returns for everyone.",
        content: `**Social good economics** is the idea that investing in community — education, health, environment, creativity — creates returns that benefit everyone, not just the investor. This is different from traditional investing, where returns flow only to the person who invested.\n\nExamples of social good investing:\n- **Credit unions** — member-owned banks that return profits to members\n- **Community development funds** — investments in underserved neighborhoods\n- **Impact investing** — choosing investments that do social good alongside financial returns\n\nThe AO Universe's Social Good Score is built on this principle: your standing in the community is a form of social capital, and social capital has real value. Members with high SGS get access to better credit terms, exclusive missions, and community leadership roles.`,
        quiz: {
          question: "What makes social good investing different from traditional investing?",
          options: [
            "Social good investing always loses money",
            "Returns benefit the community, not just the individual investor",
            "Social good investing is only for nonprofits",
            "There is no financial return in social good investing"
          ],
          correct: 1,
          explanation: "Social good investing creates returns that benefit the broader community — it's the foundation of the AO Universe's Social Good Score system."
        },
        coins: 25,
      },
    ],
  },
];

// ─── Progress tracker (local state — backend integration is a future phase) ──
function useProgress() {
  const [completed, setCompleted] = useState<string[]>([]);
  const markComplete = (lessonId: string) => setCompleted(prev => prev.includes(lessonId) ? prev : [...prev, lessonId]);
  const isComplete = (lessonId: string) => completed.includes(lessonId);
  const moduleComplete = (moduleId: string) => {
    const mod = MODULES.find(m => m.id === moduleId);
    return mod ? mod.lessons.every(l => completed.includes(l.id)) : false;
  };
  const totalCoins = completed.reduce((sum, id) => {
    for (const mod of MODULES) {
      const lesson = mod.lessons.find(l => l.id === id);
      if (lesson) return sum + lesson.coins;
    }
    return sum;
  }, 0);
  return { completed, markComplete, isComplete, moduleComplete, totalCoins };
}

// ─── Quiz Component ───────────────────────────────────────────────────────────
function Quiz({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === lesson.quiz.correct;

  return (
    <div className="space-y-4">
      <p className="text-white font-medium">{lesson.quiz.question}</p>
      <div className="space-y-2">
        {lesson.quiz.options.map((opt, i) => (
          <button
            key={i}
            disabled={submitted}
            onClick={() => setSelected(i)}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
              submitted
                ? i === lesson.quiz.correct
                  ? "border-green-500 bg-green-500/20 text-green-300"
                  : i === selected && !correct
                  ? "border-red-500 bg-red-500/20 text-red-300"
                  : "border-white/10 text-gray-500"
                : selected === i
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                : "border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/5"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {!submitted && selected !== null && (
        <button
          onClick={() => setSubmitted(true)}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:opacity-90 transition"
        >
          Submit Answer
        </button>
      )}
      {submitted && (
        <div className={`p-4 rounded-lg border ${correct ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}`}>
          <p className={`font-bold text-sm mb-1 ${correct ? "text-green-400" : "text-red-400"}`}>
            {correct ? "✓ Correct!" : "✗ Not quite."}
          </p>
          <p className="text-sm text-gray-300">{lesson.quiz.explanation}</p>
          {correct && (
            <button
              onClick={onComplete}
              className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4" />
              Claim {lesson.coins} Coins →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FinancialDistrict() {
  const { isAuthenticated } = useAuth();
  const progress = useProgress();
  const [activeModule, setActiveModule] = useState<string>("vault");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const currentModule = MODULES.find(m => m.id === activeModule)!;

  const isModuleLocked = (mod: Module) => {
    if (!mod.unlockRequirement) return false;
    return !progress.moduleComplete(mod.unlockRequirement);
  };

  const handleLessonComplete = (lesson: Lesson) => {
    progress.markComplete(lesson.id);
    setActiveLesson(null);
  };

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Space Mono', monospace" }}>
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-green-500/20 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/universe">
              <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition text-sm">
                <ArrowLeft className="w-4 h-4" />
                Universe Map
              </button>
            </Link>
            <div className="w-px h-5 bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-r from-green-400 to-cyan-500 flex items-center justify-center text-sm">
                🤖
              </div>
              <div>
                <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">
                  The Financial District
                </h1>
                <p className="text-xs text-gray-500">Guided by Security Bot X-9</p>
              </div>
            </div>
          </div>
          {progress.totalCoins > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
              <Coins className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300 font-bold">+{progress.totalCoins} earned</span>
            </div>
          )}
        </div>
      </header>

      {/* Auth gate */}
      {!isAuthenticated && (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">🤖</div>
          <h2 className="text-2xl font-bold text-green-400 mb-3">Security Bot X-9 Requires ID</h2>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            The Financial District requires a verified identity. Sign in to access lessons, track your progress, and earn coins for completing modules.
          </p>
          <button
            onClick={() => startLogin()}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold hover:opacity-90 transition"
          >
            Sign In to Enter
          </button>
        </div>
      )}

      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Security Bot X-9 intro */}
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 mb-8 flex gap-4 items-start">
            <div className="text-4xl shrink-0">🤖</div>
            <div>
              <p className="text-green-400 font-bold text-sm mb-1">Security Bot X-9</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Welcome to the Financial District. I am Security Bot X-9 — precision and protocol are my core functions. Here, you will learn the rules of the financial system: savings, checking, credit, and community investment. Complete each module in order. Answer correctly to earn AO Coins. These lessons mirror real-world financial principles — what you learn here applies beyond AO-City.
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <BookOpen className="w-3.5 h-3.5" />
                  {MODULES.reduce((sum, m) => sum + m.lessons.length, 0)} lessons total
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Coins className="w-3.5 h-3.5" />
                  {MODULES.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + l.coins, 0), 0)} coins available
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {progress.completed.length} completed
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Module list */}
            <div className="space-y-3">
              {MODULES.map((mod, i) => {
                const locked = isModuleLocked(mod);
                const complete = progress.moduleComplete(mod.id);
                const active = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => !locked && setActiveModule(mod.id)}
                    disabled={locked}
                    className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
                      locked
                        ? "border-white/5 bg-black/20 opacity-50 cursor-not-allowed"
                        : active
                        ? `${mod.borderColor} bg-black/70`
                        : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-black/60"
                    }`}
                    style={active && !locked ? { boxShadow: `0 0 20px ${mod.glowColor}` } : {}}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${mod.color} flex items-center justify-center text-white shrink-0`}>
                          {locked ? <Lock className="w-4 h-4" /> : mod.icon}
                        </div>
                        <div>
                          <p className={`font-bold text-sm bg-gradient-to-r ${mod.color} bg-clip-text text-transparent`}>
                            {mod.title}
                          </p>
                          <p className="text-xs text-gray-500">{mod.tagline}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {complete && <CheckCircle className="w-4 h-4 text-green-400" />}
                        {!locked && !complete && (
                          <span className="text-xs text-gray-500">
                            {mod.lessons.filter(l => progress.isComplete(l.id)).length}/{mod.lessons.length}
                          </span>
                        )}
                      </div>
                    </div>
                    {locked && mod.unlockRequirement && (
                      <p className="text-xs text-gray-600 mt-2">
                        Complete "{MODULES.find(m => m.id === mod.unlockRequirement)?.title}" first
                      </p>
                    )}
                  </button>
                );
              })}

              {/* SGS teaser */}
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <p className="text-sm font-bold text-yellow-300">Social Good Score</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Completing Financial District lessons raises your SGS. A high SGS unlocks the Credit Bureau's borrowing features and community leadership roles.
                </p>
              </div>
            </div>

            {/* Right: Lesson detail */}
            <div className="lg:col-span-2">
              {activeLesson ? (
                // Lesson view
                <div className="rounded-xl border border-white/10 bg-black/60 p-6">
                  <button
                    onClick={() => setActiveLesson(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {currentModule.title}
                  </button>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${currentModule.color} text-white`}>
                      {currentModule.title}
                    </span>
                    <span className="text-xs text-gray-500">+{activeLesson.coins} coins</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-4">{activeLesson.title}</h2>
                  <div className="prose prose-invert prose-sm max-w-none mb-6">
                    {activeLesson.content.split("\n\n").map((para, i) => (
                      <p key={i} className="text-gray-300 text-sm leading-relaxed mb-3"
                        dangerouslySetInnerHTML={{
                          __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                        }}
                      />
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <p className="text-sm font-bold text-cyan-300">Knowledge Check</p>
                    </div>
                    {progress.isComplete(activeLesson.id) ? (
                      <div className="p-4 rounded-lg border border-green-500/50 bg-green-500/10 text-center">
                        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-green-300 font-bold">Lesson Complete!</p>
                        <p className="text-xs text-gray-400 mt-1">You earned {activeLesson.coins} coins for this lesson.</p>
                      </div>
                    ) : (
                      <Quiz lesson={activeLesson} onComplete={() => handleLessonComplete(activeLesson)} />
                    )}
                  </div>
                </div>
              ) : (
                // Module overview
                <div className="space-y-4">
                  <div
                    className={`rounded-xl border ${currentModule.borderColor} bg-black/60 p-6`}
                    style={{ boxShadow: `0 0 30px ${currentModule.glowColor}` }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentModule.color} flex items-center justify-center text-white`}>
                        {currentModule.icon}
                      </div>
                      <div>
                        <h2 className={`text-2xl font-bold bg-gradient-to-r ${currentModule.color} bg-clip-text text-transparent`}>
                          {currentModule.title}
                        </h2>
                        <p className="text-sm text-gray-400">Real-world concept: <span className="text-white">{currentModule.realWorldConcept}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {currentModule.lessons.length} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        {currentModule.lessons.reduce((s, l) => s + l.coins, 0)} coins
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {currentModule.lessons.filter(l => progress.isComplete(l.id)).length} completed
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${currentModule.color} transition-all duration-500`}
                        style={{
                          width: `${(currentModule.lessons.filter(l => progress.isComplete(l.id)).length / currentModule.lessons.length) * 100}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mb-6">
                      {currentModule.lessons.filter(l => progress.isComplete(l.id)).length} of {currentModule.lessons.length} lessons complete
                    </p>
                    {/* Lesson list */}
                    <div className="space-y-3">
                      {currentModule.lessons.map((lesson, i) => {
                        const done = progress.isComplete(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                              done
                                ? "border-green-500/30 bg-green-500/5"
                                : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                                  done ? "bg-green-500 text-white" : "bg-white/10 text-gray-400"
                                }`}>
                                  {done ? "✓" : i + 1}
                                </div>
                                <div>
                                  <p className={`font-medium text-sm ${done ? "text-green-300" : "text-white"}`}>
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">{lesson.summary}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-gray-500">+{lesson.coins}</span>
                                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
