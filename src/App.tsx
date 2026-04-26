/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Terminal as TerminalIcon, 
  Activity, 
  Globe, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Database, 
  Search,
  ChevronRight,
  BarChart3,
  Network,
  LayoutDashboard,
  Award,
  Rocket,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type TaskStatus = 'locked' | 'available' | 'completed';

interface LogEntry {
  id: string;
  timestamp: string;
  sourceIp: string;
  action: string;
  payload: string;
  status: 'info' | 'warning' | 'critical';
}

interface LabTask {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: string;
  concept: string;
  instructions: string[];
  validation: (answer: string) => boolean;
  hint: string;
}

// --- Simulated Data Generators ---
const generateNetworkTraffic = () => {
  return Array.from({ length: 24 }).map((_, i) => ({
    time: `${i}:00`,
    inbound: Math.floor(Math.random() * 50) + 10,
    outbound: i === 18 ? 450 : Math.floor(Math.random() * 30) + 5, // Exfiltration spike at 18:00
  }));
};

const LOG_ENTRIES: LogEntry[] = [
  { id: '1', timestamp: '2024-04-20 14:01:22', sourceIp: '192.168.1.45', action: 'LOGIN_SUCCESS', payload: 'User: admin', status: 'info' },
  { id: '2', timestamp: '2024-04-20 14:05:01', sourceIp: '103.45.21.9', action: 'LOGIN_FAILURE', payload: 'User: root', status: 'warning' },
  { id: '3', timestamp: '2024-04-20 14:05:03', sourceIp: '103.45.21.9', action: 'LOGIN_FAILURE', payload: 'User: root', status: 'warning' },
  { id: '4', timestamp: '2024-04-20 14:05:05', sourceIp: '103.45.21.9', action: 'LOGIN_FAILURE', payload: 'User: admin', status: 'warning' },
  { id: '5', timestamp: '2024-04-20 14:05:08', sourceIp: '103.45.21.9', action: 'LOGIN_FAILURE', payload: 'User: guest', status: 'warning' },
  { id: '6', timestamp: '2024-04-20 14:10:15', sourceIp: '192.168.1.10', action: 'HTTP_GET', payload: '/api/v1/users', status: 'info' },
  { id: '7', timestamp: '2024-04-20 14:12:33', sourceIp: '185.12.33.4', action: 'HTTP_POST', payload: "/search?q=' OR 1=1 --", status: 'critical' },
  { id: '8', timestamp: '2024-04-20 14:15:22', sourceIp: '192.168.1.20', action: 'PORT_SCAN', payload: 'Target: 192.168.1.1 [Port: 21]', status: 'warning' },
  { id: '9', timestamp: '2024-04-20 14:15:23', sourceIp: '192.168.1.20', action: 'PORT_SCAN', payload: 'Target: 192.168.1.1 [Port: 22]', status: 'warning' },
  { id: '10', timestamp: '2024-04-20 14:15:24', sourceIp: '192.168.1.20', action: 'PORT_SCAN', payload: 'Target: 192.168.1.1 [Port: 80]', status: 'warning' },
];

const LAB_TASKS: LabTask[] = [
  {
    id: 'brute-force',
    title: 'Brute Force Detection',
    description: 'A remote IP is attempting to guess credentials. Identify the attacker.',
    concept: 'Authentication Security & Log Correlation',
    difficulty: 'Easy',
    reward: 'SOC Analyst Lvl 1',
    instructions: ['Analyze the SIEM logs.', 'Look for repeated LOGIN_FAILURE actions.', 'Submit the Source IP of the attacker.'],
    validation: (val) => val.trim() === '103.45.21.9',
    hint: 'Check the source IP associated with multiple failed attempts in a short timeframe.'
  },
  {
    id: 'sqli',
    title: 'SQL Injection Signature',
    description: 'Detect a database probing attempt in the web traffic logs.',
    concept: 'Web Application Firewalls (WAF) & Injections',
    difficulty: 'Easy',
    reward: 'Web Defender',
    instructions: ['Examine HTTP_POST entries.', 'Find the SQL pattern in the payload.', 'Submit the Attacker Source IP.'],
    validation: (val) => val.trim() === '185.12.33.4',
    hint: 'Look for common SQL injection characters like "OR 1=1" in the request payloads.'
  },
  {
    id: 'exfiltration',
    title: 'Data Exfiltration Hunt',
    description: 'Internal data is being leaked. Find when the spike occurred.',
    concept: 'Anatomy of a Data Breach',
    difficulty: 'Medium',
    reward: 'Threat Hunter',
    instructions: ['View the Network Traffic Monitor.', 'Identify the timestamp of the massive outbound spike.', 'Submit the hour (e.g., 18:00).'],
    validation: (val) => val.trim() === '18:00',
    hint: 'The Outbound traffic graph shows a massive anomaly. Which hour is it?'
  },
  {
    id: 'recon',
    title: 'Internal Reconnaissance',
    description: 'A compromised internal host is mapping the network.',
    concept: 'Lateral Movement & Scanning',
    difficulty: 'Medium',
    reward: 'Network Sentinel',
    instructions: ['Search logs for PORT_SCAN events.', 'Identify the host scanning the internal network.', 'Submit the Scanner source IP.'],
    validation: (val) => val.trim() === '192.168.1.20',
    hint: 'Multiple sequential port probes from one internal IP to another often indicate a scan.'
  },
  {
    id: 'forensics',
    title: 'Digital Forensics 101',
    description: 'Calculate the total number of critical severity events in the current log set.',
    concept: 'Incident Triage',
    difficulty: 'Medium',
    reward: 'Forensic Associate',
    instructions: ['Count all "critical" status events in the SIEM.', 'Submit the total count.'],
    validation: (val) => val.trim() === '1',
    hint: 'There is only one red-status "critical" entry in the provided log sample.'
  },
  {
    id: 'remediation',
    title: 'Incident Response: Containment',
    description: 'Simulate a containment strategy for the SQLi attacker.',
    concept: 'Incident Response Lifecycle',
    difficulty: 'Hard',
    reward: 'Incident Commander',
    instructions: ['What is the standard FIRST response to an active SQLi attack?', 'A) Reboot Server', 'B) Block Attacker IP', 'C) Delete database', 'D) Ignore'],
    validation: (val) => val.toUpperCase().trim() === 'B',
    hint: 'Containment is about stopping the bleeding immediately.'
  }
];

// --- Components ---

const Sidebar = ({ currentTaskId, completedTasks, onSelectTask }: { 
  currentTaskId: string, 
  completedTasks: string[], 
  onSelectTask: (id: string) => void 
}) => {
  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0">
      <div className="p-6 border-bottom border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Shield className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-lg leading-tight uppercase tracking-wider">EV Cyber Academy</h1>
          <p className="text-xs text-indigo-400 font-mono font-bold">SOC SIMULATION V2.4</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Training Modules</p>
        {LAB_TASKS.map((task, index) => {
          const isCompleted = completedTasks.includes(task.id);
          const isActive = currentTaskId === task.id;
          
          return (
            <button
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className={cn(
                "w-full text-left p-4 rounded-xl transition-all duration-200 border flex items-center justify-between group",
                isActive 
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                  : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg font-mono text-xs border",
                  isActive ? "bg-indigo-500/30 border-indigo-400" : "bg-slate-700/50 border-slate-600"
                )}>
                  0{index + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{task.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter",
                      task.difficulty === 'Easy' && "bg-emerald-500/10 text-emerald-400",
                      task.difficulty === 'Medium' && "bg-amber-500/10 text-amber-400",
                      task.difficulty === 'Hard' && "bg-rose-500/10 text-rose-400",
                    )}>
                      {task.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform group-hover:translate-x-1",
                  isActive ? "text-indigo-200" : "text-slate-600"
                )} />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Overall Progress</span>
            <span className="text-xs font-mono text-indigo-400">{Math.round((completedTasks.length / LAB_TASKS.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-1000" 
              style={{ width: `${(completedTasks.length / LAB_TASKS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default function App() {
  const [activeTask, setActiveTask] = useState<string>(LAB_TASKS[0].id);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [trafficData] = useState(generateNetworkTraffic());
  const [searchQuery, setSearchQuery] = useState('');
  const [showBriefing, setShowBriefing] = useState(true);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const allTasksCompleted = useMemo(() => completedTasks.length === LAB_TASKS.length, [completedTasks]);

  useEffect(() => {
    if (allTasksCompleted && completedTasks.length > 0) {
      setShowCompletionModal(true);
    }
  }, [allTasksCompleted, completedTasks.length]);

  const currentTask = useMemo(() => 
    LAB_TASKS.find(t => t.id === activeTask) || LAB_TASKS[0]
  , [activeTask]);

  const filteredLogs = useMemo(() => {
    return LOG_ENTRIES.filter(log => 
      log.sourceIp.includes(searchQuery) || 
      log.action.includes(searchQuery.toUpperCase()) ||
      log.payload.includes(searchQuery)
    );
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTask.validation(answer)) {
      setFeedback({ type: 'success', message: `Correct! You have earned the [${currentTask.reward}] badge.` });
      if (!completedTasks.includes(activeTask)) {
        setCompletedTasks(prev => [...prev, activeTask]);
      }
      setAnswer('');
    } else {
      setFeedback({ type: 'error', message: 'Verification failed. Review the logs and try again.' });
    }
  };

  useEffect(() => {
    setFeedback(null);
    setAnswer('');
  }, [activeTask]);

  useEffect(() => {
    if (scanStatus === 'scanning') {
      const interval = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            setScanStatus('complete');
            clearInterval(interval);
            return 100;
          }
          return p + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [scanStatus]);

  const startScan = () => {
    setScanStatus('scanning');
    setScanProgress(0);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Briefing Overlay */}
      <AnimatePresence>
        {showBriefing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_0_100px_rgba(99,102,241,0.15)] overflow-hidden"
            >
              <div className="p-8 border-b border-slate-800 bg-indigo-600/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Shield className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">EV Cyber Academy</span>
                    <h2 className="text-xl font-bold text-slate-300">Operational Link Beta 1.0</h2>
                  </div>
                </div>
                <h1 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">Network Security & SOC Simulation</h1>
                <p className="text-slate-400 mt-4 leading-relaxed">Welcome, Analyst. You have been assigned to the EV Cyber Academy Defensive Unit. Your objective is to monitor enterprise traffic and neutralize 6 active threats to earn your certification.</p>
              </div>
              <div className="p-8 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Identify malicious signatures in SIEM logs.
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Detect exfiltration spikes in Network Flow.
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Apply containment strategies to thwart attackers.
                  </div>
                </div>
                <button 
                  onClick={() => setShowBriefing(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] mt-4"
                >
                  INITIALIZE OPERATIONAL LINK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/90"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-slate-900 border border-indigo-500/30 rounded-[2.5rem] shadow-[0_0_100px_rgba(99,102,241,0.2)] overflow-hidden"
            >
              <div className="p-10 text-center space-y-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                    <Award className="w-12 h-12 text-indigo-400" />
                  </div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2 border-2 border-dashed border-indigo-500/30 rounded-3xl"
                  />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Mission Success</h2>
                  <p className="text-slate-400 leading-relaxed font-medium">
                    YOU HAVE FINISHED BASIC LEVEL OF SOC LAB. YOU ARE NOW READY TO UPSKILL TO THE ELITE LEVEL.
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <a 
                    href="https://wa.me/919789459354?text=DM%20SOC%20FOR%20COURSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 group active:scale-[0.97]"
                  >
                    <Rocket className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    READY TO UPSKILL
                    <ArrowRight className="w-5 h-5 opacity-50" />
                  </a>
                  <button 
                    onClick={() => setShowCompletionModal(false)}
                    className="text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    CLOSE COMMAND CENTER
                  </button>
                </div>
              </div>
              
              <div className="bg-indigo-500/5 p-4 border-t border-slate-800 text-center">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">EV Cyber Academy • Graduate Division</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar 
        currentTaskId={activeTask} 
        completedTasks={completedTasks}
        onSelectTask={setActiveTask}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header / Stats */}
        <header className="h-20 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8 shrink-0 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Operation</span>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-mono text-sm text-slate-300">OP_WHIPLASH_PHASE_{completedTasks.length + 1}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="px-3 py-1 bg-slate-800 rounded-md border border-slate-700 flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", i === 1 ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-slate-600")} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Node {i}</span>
                  </div>
                ))}
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Split Panel: SIEM & Task Instructions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Task & Verification */}
              <div className="space-y-6">
                <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-full">
                  <div className="p-6 border-b border-slate-800 bg-indigo-600/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mission Intelligence</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100">{currentTask.title}</h2>
                    <p className="text-slate-400 mt-2 leading-relaxed">{currentTask.description}</p>
                  </div>
                  
                  <div className="p-8 flex-1">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <TerminalIcon className="w-3.5 h-3.5" />
                          Field Instructions
                        </h4>
                        <ul className="space-y-4">
                          {currentTask.instructions.map((step, i) => (
                            <li key={i} className="flex gap-4 items-start group">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 text-xs flex items-center justify-center font-bold">
                                {i + 1}
                              </span>
                              <span className="text-sm text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                                {step}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <div className="flex gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Concept: {currentTask.concept}</p>
                            <p className="text-[13px] text-amber-200/70 mt-1 italic">"{currentTask.hint}"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-900/50 border-t border-slate-800">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="INPUT VERIFICATION CODE OR IP..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-sm font-mono focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                        />
                        <button 
                          type="submit"
                          className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-indigo-500/20"
                        >
                          Verify
                        </button>
                      </div>
                      
                      {feedback && (
                        <div className={cn(
                          "p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-1",
                          feedback.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        )}>
                          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                          <p className="text-sm font-medium">{feedback.message}</p>
                        </div>
                      )}
                    </form>
                  </div>
                </section>
              </div>

              {/* Right Column: SIEM View */}
              <div className="space-y-6">
                {/* Traffic Monitor Card */}
                <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <Network className="w-5 h-5 text-indigo-400" />
                       <h3 className="font-bold text-slate-100 uppercase tracking-widest text-xs">Network Flow Real-Time</h3>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold">
                       <div className="flex items-center gap-1.5"><div className="w-2 h-0.5 bg-indigo-500" /> INBOUND</div>
                       <div className="flex items-center gap-1.5"><div className="w-2 h-0.5 bg-emerald-500" /> OUTBOUND</div>
                    </div>
                  </div>
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trafficData}>
                        <defs>
                          <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#475569" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false} 
                          interval={4}
                        />
                        <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
                          itemStyle={{ fontSize: '10px' }}
                        />
                        <Area type="monotone" dataKey="inbound" stroke="#6366f1" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
                        <Area type="monotone" dataKey="outbound" stroke="#10b981" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* SIEM Log Console */}
                <section className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl min-h-[400px]">
                  <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-bold text-slate-100 uppercase tracking-widest text-[10px]">SIEM Console / Enterprise Logs</h3>
                    </div>
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[11px] outline-none focus:border-indigo-500 transition-colors w-48"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm shadow-sm">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">Status</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">Source IP</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">Event</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {filteredLogs.map(log => (
                          <tr key={log.id} className="hover:bg-indigo-500/5 transition-colors group">
                            <td className="px-4 py-3">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter",
                                log.status === 'info' && "bg-slate-800 text-slate-400",
                                log.status === 'warning' && "bg-amber-500/10 text-amber-500",
                                log.status === 'critical' && "bg-rose-500/10 text-rose-500",
                              )}>
                                <div className={cn(
                                  "w-1 h-1 rounded-full",
                                  log.status === 'info' && "bg-slate-400",
                                  log.status === 'warning' && "bg-amber-500",
                                  log.status === 'critical' && "bg-rose-500 animate-pulse",
                                )} />
                                {log.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-indigo-300">{log.sourceIp}</td>
                            <td className="px-4 py-3 font-bold text-[10px] tracking-tight">{log.action}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-slate-500 font-mono italic truncate max-w-[200px] block group-hover:text-slate-300">
                                {log.payload}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>

            {/* Bottom Panel: Assets / Inventory Tracking */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <Search className="w-4 h-4 text-indigo-400" />
                       <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Vuln Scanner</h4>
                    </div>
                    {scanStatus === 'scanning' && <Activity className="w-3 h-3 text-indigo-400 animate-spin" />}
                  </div>
                  
                  {scanStatus === 'idle' ? (
                    <button 
                      onClick={startScan}
                      type="button"
                      className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400 text-[10px] font-bold uppercase transition-all"
                    >
                      Run Global Audit
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
                        <span>{scanStatus === 'scanning' ? 'Scanning...' : 'Audit Complete'}</span>
                        <span>{scanProgress}%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all", scanStatus === 'scanning' ? "bg-indigo-500" : "bg-emerald-500")} 
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      {scanStatus === 'complete' && (
                        <p className="text-[9px] text-rose-400 font-bold uppercase mt-1">2 VULNERABILITIES FOUND</p>
                      )}
                    </div>
                  )}
               </div>

               <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                    <Database className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Asset Status</h4>
                    <p className="text-xl font-bold text-slate-100">8 Critical Servers</p>
                    <div className="text-[10px] text-emerald-500 font-bold uppercase mt-1 flex items-center gap-1">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full" /> ALL NODES SECURE
                    </div>
                  </div>
               </div>
               <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                    <Globe className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">External Traffic</h4>
                    <p className="text-xl font-bold text-slate-100">0.4 Gbit/s</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Normal Volume</p>
                  </div>
               </div>
               <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                    <Cpu className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Compute Load</h4>
                    <p className="text-xl font-bold text-slate-100">14.2% Avg</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Balanced Architecture</p>
                  </div>
               </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
