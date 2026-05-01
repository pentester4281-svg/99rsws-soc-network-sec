/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  HashRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
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
  ArrowRight,
  ShieldOff,
  User,
  Fingerprint,
  Zap,
  RefreshCcw,
  Monitor,
  Skull,
  ExternalLink,
  BookOpen
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
type ViewType = 'dashboard' | 'victim' | 'attacker' | 'tasks';
type LogStatus = 'info' | 'warning' | 'critical' | 'success';

interface LogEntry {
  id: string;
  timestamp: string;
  sourceIp: string;
  action: string;
  payload: string;
  status: LogStatus;
  userAgent?: string;
  protocol?: string;
}

interface LabTask {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: string;
  validation: (state: SimulationState, answer: string) => boolean;
  instructions: string[];
  hint: string;
}

interface SimulationState {
  logs: LogEntry[];
  isAttacking: boolean;
  blockedIps: string[];
  alertLevel: 'normal' | 'low' | 'high' | 'breach';
  completedTasks: string[];
  failedAttempts: number;
}

// --- Constants & Config ---
const ATTACKER_IP = '103.45.21.9';
const VICTIM_IP = '192.168.1.45';
const USER_IP = '45.122.1.22';

const INITIAL_LOGS: LogEntry[] = [
  { id: 'start-1', timestamp: new Date().toLocaleTimeString(), sourceIp: '127.0.0.1', action: 'SYSTEM_START', payload: 'SOC Kernel Simulation Initialized', status: 'info', userAgent: 'SystemInternal/v1.0', protocol: 'KERNEL' },
  { id: 'start-2', timestamp: new Date().toLocaleTimeString(), sourceIp: '192.168.1.1', action: 'FIREWALL_UP', payload: 'Ruleset v4.2 applied', status: 'success', userAgent: 'iptables/v1.8.7', protocol: 'NETLINK' },
];

const LAB_TASKS: LabTask[] = [
  {
    id: 'login-test',
    title: 'Normal Login Attempt',
    description: 'Login to the Victim Portal using valid credentials to establish a baseline.',
    difficulty: 'Easy',
    reward: 'Access Baseline',
    instructions: [
      'Open the VICTIM SYSTEM tab.',
      'Login with Username: admin | Password: password123',
      'Check logic: SIEM-la successful record aagudha-nu paru.'
    ],
    validation: (state) => state.logs.some(l => l.action === 'LOGIN_SUCCESS' && l.sourceIp === USER_IP),
    hint: 'Go to Victim tab and use admin/password123.'
  },
  {
    id: 'recon-scan',
    title: 'Network Reconnaissance',
    description: 'Identify the target server and open ports using Nmap.',
    difficulty: 'Easy',
    reward: 'Recon Specialist',
    instructions: [
      'Open ATTACKER CONSOLE tab.',
      'Type panni scan pannu: nmap -sV 192.168.1.45',
      'Wait for the results to show Port 80 (HTTP) is OPEN.'
    ],
    validation: (state) => state.logs.some(l => l.action === 'RECON_SCAN'),
    hint: 'Type "nmap -sV 192.168.1.45" in the attacker terminal.'
  },
  {
    id: 'start-attack',
    title: 'Manual Brute-Force (Hydra)',
    description: 'Use the Hydra tool to crack the admin password.',
    difficulty: 'Medium',
    reward: 'Password Cracker',
    instructions: [
      'Attacker terminal-la hydra command execute pannu:',
      'hydra -l admin -P passlist.txt 192.168.1.45'
    ],
    validation: (state) => state.isAttacking,
    hint: 'Type "hydra -l admin -P passlist.txt 192.168.1.45" to start the attack.'
  },
  {
    id: 'detect-pattern',
    title: 'Identify Attacker IP',
    description: 'Catch the automated attack in the SOC Dashboard.',
    difficulty: 'Medium',
    reward: 'Pattern Recon',
    instructions: [
      'SOC Dashboard logs-ah monitor pannu.',
      'LOGIN_FAILURE rapid-ah varum.',
      'Attacker-oda Source IP-ah kandu pudichi input pannu.'
    ],
    validation: (_, ans) => ans.trim() === ATTACKER_IP,
    hint: 'Look for the external IP 103.45.21.9 causing the failures.'
  },
  {
    id: 'detect-alert',
    title: 'Security Alert Triage',
    description: 'Detect the high-severity alert triggered by SIEM.',
    difficulty: 'Medium',
    reward: 'Alert Responder',
    instructions: [
      'Threat Status-ah check pannu.',
      'Alert Level "BREACH" aagura varai wait pannu.',
      'Verification keyword "CRITICAL_BREACH" submit pannu.'
    ],
    validation: (state, ans) => state.alertLevel === 'breach' || ans.toUpperCase() === 'CRITICAL_BREACH',
    hint: 'Wait for the header to turn red and pulsate "BREACH".'
  },
  {
    id: 'containment',
    title: 'Incident Containment',
    description: 'Block the IP to stop the attack flow.',
    difficulty: 'Medium',
    reward: 'Incident Commander',
    instructions: [
      'Defense Actions panel-la Attacker IP (103.45.21.9) block pannu.',
      'Verify: Logs nikudha nu check pannu.'
    ],
    validation: (state) => state.blockedIps.includes(ATTACKER_IP),
    hint: 'Block 103.45.21.9 in the SOC dashboard.'
  },
  {
    id: 'ua-fingerprint',
    title: 'Advanced Forensic Fingerprinting',
    description: 'Analyze the specific User-Agent string used by the brute-force tool.',
    difficulty: 'Hard',
    reward: 'Forensic Expert',
    instructions: [
      'SOC Dashboard logs-ah deep-ah analyze pannu.',
      'Attacker IP 103.45.21.9 panna brute-force attempts-ku irrukurra "User Agent" (UA) exact-ah kandu pudinga.',
      'Detailed Fingerprint column-la clear-ah UA value irrukkum.',
      'Enter the EXACT User Agent string (Case Sensitive).'
    ],
    validation: (_, ans) => ans.trim() === 'Hydra/v9.5 (Kali Linux ARM64)',
    hint: 'Look for the "UA:" prefix in the Detailed Fingerprint column for failed attempts.'
  },
  {
    id: 'service-version',
    title: 'Reconnaissance Signature Analysis',
    description: 'Verify the exact software version running on the victim server from scan results.',
    difficulty: 'Hard',
    reward: 'Recon Architect',
    instructions: [
      'Attacker Console terminal-la nmap scan results-ah check pannu.',
      'Victim system (192.168.1.45) Port 80-la enna version Apache run aagudhu?',
      'Exact software version-ah enter pannu (Ex: Apache 2.X.XX).'
    ],
    validation: (_, ans) => ans.trim() === 'Apache 2.4.41',
    hint: 'Check the Nmap output line for "80/tcp open http" and find the version code.'
  }
];

// --- Broadcast Channel for Cross-Tab Sync ---
const SYNC_CHANNEL = 'ev_cyber_lab_sync';
const broadcast = new BroadcastChannel(SYNC_CHANNEL);

// --- Components ---

interface TaskCardProps {
  task: LabTask;
  isActive: boolean;
  isCompleted: boolean;
  onSelect: () => void;
  index: number;
  key?: string | number;
}

const TaskCard = ({ task, isActive, isCompleted, onSelect, index }: TaskCardProps) => (
  <button
    onClick={onSelect}
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
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter",
          task.difficulty === 'Easy' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
        )}>
          {task.difficulty}
        </span>
      </div>
    </div>
    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <ChevronRight className="w-4 h-4" />}
  </button>
);

// --- State Provider Hook ---
const useSimulation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('ev_lab_auth'));
  const [studentName, setStudentName] = useState(() => localStorage.getItem('ev_student_name') || '');
  
  const [state, setState] = useState<SimulationState>(() => {
    const saved = localStorage.getItem('ev_cyber_lab_state');
    return saved ? JSON.parse(saved) : {
      logs: INITIAL_LOGS,
      isAttacking: false,
      blockedIps: [],
      alertLevel: 'normal',
      completedTasks: [],
      failedAttempts: 0
    };
  });

  const login = (name: string) => {
    localStorage.setItem('ev_lab_auth', 'true');
    localStorage.setItem('ev_student_name', name);
    setStudentName(name);
    setIsAuthenticated(true);
    broadcast.postMessage({ type: 'AUTH_SYNC', name });
  };

  const logout = () => {
    localStorage.removeItem('ev_lab_auth');
    localStorage.removeItem('ev_student_name');
    setIsAuthenticated(false);
    setStudentName('');
  };

  const updateState = useCallback((partial: Partial<SimulationState>) => {
    setState(prev => {
      const newState = { ...prev, ...partial };
      // ... (existing derived state logic)
      const failed = newState.logs.filter(l => l.action === 'LOGIN_FAILURE').length;
      newState.failedAttempts = failed;
      if (failed > 15) newState.alertLevel = 'breach';
      else if (failed > 5) newState.alertLevel = 'high';
      else if (failed > 0) newState.alertLevel = 'low';
      else newState.alertLevel = 'normal';

      if (newState.blockedIps.includes(ATTACKER_IP)) {
        newState.isAttacking = false;
      }

      localStorage.setItem('ev_cyber_lab_state', JSON.stringify(newState));
      broadcast.postMessage({ type: 'STATE_SYNC', state: newState });
      return newState;
    });
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'STATE_SYNC') setState(event.data.state);
      if (event.data.type === 'AUTH_SYNC') {
        setIsAuthenticated(true);
        setStudentName(event.data.name);
      }
    };
    broadcast.addEventListener('message', handleMessage);
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ev_cyber_lab_state' && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
      if (e.key === 'ev_lab_auth') {
        setIsAuthenticated(!!e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      broadcast.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const addLog = useCallback((ip: string, action: string, payload: string, status: LogStatus, userAgent?: string, protocol?: string) => {
    setState(prev => {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        sourceIp: ip,
        action,
        payload,
        status,
        userAgent: userAgent || 'N/A',
        protocol: protocol || 'TCP'
      };
      const newLogs = [newLog, ...prev.logs].slice(0, 50);
      const newState = { ...prev, logs: newLogs };
      
      const failed = newState.logs.filter(l => l.action === 'LOGIN_FAILURE').length;
      newState.failedAttempts = failed;
      if (failed > 15) newState.alertLevel = 'breach';
      else if (failed > 5) newState.alertLevel = 'high';
      else if (failed > 0) newState.alertLevel = 'low';
      else newState.alertLevel = 'normal';

      localStorage.setItem('ev_cyber_lab_state', JSON.stringify(newState));
      broadcast.postMessage({ type: 'STATE_SYNC', state: newState });
      return newState;
    });
  }, []);

  const reset = useCallback(() => {
    const defaultState: SimulationState = {
      logs: INITIAL_LOGS,
      isAttacking: false,
      blockedIps: [],
      alertLevel: 'normal',
      completedTasks: [],
      failedAttempts: 0
    };
    setState(defaultState);
    localStorage.setItem('ev_cyber_lab_state', JSON.stringify(defaultState));
    broadcast.postMessage({ type: 'STATE_SYNC', state: defaultState });
  }, []);

  return { state, updateState, addLog, reset, isAuthenticated, studentName, login, logout };
};

// --- Access Gate Component ---
const AccessGate = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name, student.");
      return;
    }
    if (pass === 'EVSOCV1LAB') {
      onLogin(name);
    } else {
      setError("Invalid Lab Access Password. Critical Failure.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full terminal-scanlines opacity-50" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-600/20">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">EV CYBER ACADEMY</h2>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">LAB ENTRY PORTAL</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Student Identifier</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Ex: John Doe" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-all text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Lab Access Password</label>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={pass}
                onChange={e => setPass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-all text-white"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase p-3 rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all uppercase tracking-widest text-xs">
            Unlock Simulation
          </button>
        </form>

        <p className="mt-8 text-center text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
          Authorized personnel only. <br /> Unauthorized access is strictly logged by the SOC server.
        </p>
      </motion.div>
    </div>
  );
};

// --- View Components ---

const DashboardView = ({ state, addLog, updateState, activeTaskId, setActiveTaskId }: any) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  
  const currentTask = LAB_TASKS.find(t => t.id === activeTaskId)!;
  
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTask.validation(state, answer)) {
      setFeedback({ type: 'success', message: `Verified! Reward unlocked: [${currentTask.reward}]` });
      if (!state.completedTasks.includes(activeTaskId)) {
        updateState({ completedTasks: [...state.completedTasks, activeTaskId] });
      }
      setAnswer('');
    } else {
      setFeedback({ type: 'error', message: 'Verification failed. Review symbols and IP addresses.' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl min-h-[600px]">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-slate-100 uppercase tracking-widest text-xs">Live SIEM Console | Enterprise Logs</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Monitoring</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Origin / Protocol</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Detailed Fingerprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {state.logs.map((log: LogEntry) => (
                  <tr key={log.id} className="hover:bg-indigo-500/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter",
                        log.status === 'info' && "bg-slate-800 text-slate-400",
                        log.status === 'warning' && "bg-amber-500/10 text-amber-500",
                        log.status === 'critical' && "bg-rose-500/10 text-rose-500",
                        log.status === 'success' && "bg-emerald-500/10 text-emerald-500",
                      )}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-indigo-300">{log.sourceIp}</span>
                        <span className="text-[9px] font-bold text-slate-600 uppercase mt-0.5">{log.protocol}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[11px] tracking-tight text-slate-200">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-[300px]">
                        <span className="text-xs text-slate-400 font-mono italic truncate group-hover:text-slate-200">
                          {log.payload}
                        </span>
                        <span className="text-[9px] text-slate-600 truncate mt-1 group-hover:text-indigo-400/50">
                          UA: {log.userAgent}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="bg-indigo-900/20 rounded-3xl border border-indigo-500/30 p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 blur-xl">
               <Shield className="w-40 h-40 text-indigo-400" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-5 h-5 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Operational Intel</span>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight uppercase mb-4">{currentTask.title}</h2>
              <ul className="space-y-2 mb-8">
                {currentTask.instructions.map((ins, i) => (
                  <li key={i} className="text-xs text-slate-400 flex gap-2">
                    <span className="text-indigo-500 font-bold">{i+1}.</span> {ins}
                  </li>
                ))}
              </ul>

              <form onSubmit={handleVerify} className="mt-auto space-y-4">
                <div className="relative">
                  <input 
                    type="text"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="ANALYSIS INPUT..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:opacity-30"
                  />
                  <button type="submit" className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl text-xs font-bold uppercase shadow-lg shadow-indigo-500/20">
                    Verify
                  </button>
                </div>
                {feedback && (
                  <div className={cn(
                    "p-4 rounded-xl flex items-center gap-3 text-xs font-bold border",
                    feedback.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  )}>
                    {feedback.message}
                  </div>
                )}
              </form>
            </div>
          </section>

          <section className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-rose-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Defense Actions</h4>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Block Malicious IP</label>
                <div className="flex gap-2">
                  <input 
                    id="block-ip-input"
                    type="text" 
                    placeholder="Identify & Block IP"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-rose-500 transition-colors"
                  />
                  <button 
                    onClick={() => {
                      const el = document.getElementById('block-ip-input') as HTMLInputElement;
                      if (el.value) {
                        updateState({ blockedIps: [...state.blockedIps, el.value] });
                        addLog('127.0.0.1', 'FIREWALL_BLOCK', `IP ${el.value} blacklisted`, 'critical', 'SIEM_Orchestrator/v1.0', 'NETCONF');
                        el.value = '';
                      }
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-5 rounded-xl text-xs font-bold uppercase transition-colors"
                  >
                    Block
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Active Blocks</p>
                <div className="flex flex-wrap gap-2">
                  {state.blockedIps.length === 0 ? (
                    <span className="text-[10px] text-slate-600 italic">No active blocks</span>
                  ) : (
                    state.blockedIps.map((ip: string) => (
                      <span key={ip} className="px-2 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-[10px] font-mono flex items-center gap-1.5">
                        <ShieldOff className="w-3 h-3" /> {ip}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

const VictimView = ({ addLog }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex items-center justify-center p-8 bg-slate-950/50"
    >
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl text-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
            <Zap className="w-8 h-8 text-indigo-600 opacity-20" />
        </div>
        <div className="mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-600/30">
             <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 text-center">EV CORP LOGIN</h2>
          <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest">Internal Control Module</p>
        </div>
        
        <form 
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const u = formData.get('user') as string;
          const p = formData.get('pass') as string;
          if (u === 'admin' && p === 'password123') {
            addLog(USER_IP, 'LOGIN_SUCCESS', `User: ${u}`, 'success', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 'HTTPS/TLSv1.3');
            alert('Login Successful! Baseline Established in SIEM.');
          } else {
            addLog(USER_IP, 'LOGIN_FAILURE', `User: ${u}`, 'warning', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 'HTTPS/TLSv1.3');
            alert('Invalid Credentials.');
          }
        }} 
        className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Employee ID</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input name="user" type="text" placeholder="Username" className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-600 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all font-semibold" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Access Token</label>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input name="pass" type="password" placeholder="••••••••" className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-600 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all font-semibold" />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] mt-4 uppercase tracking-[0.2em] text-xs">
            Authenticate
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">Remote Client IP: <span className="text-indigo-600 not-italic font-mono">{USER_IP}</span></p>
        </div>
      </div>
    </motion.div>
  );
};

const AttackerView = ({ state, updateState, addLog }: any) => {
  const [terminal, setTerminal] = useState<string[]>([
    'Kali GNU/Linux Rolling 2024.1', 
    'root@kali:~# msfconsole -q', 
    'msf6 > welcome back, operator.',
    'msf6 > type "help" for a list of available manual exploits.',
    'msf6 > training module: "Network Breach v1.2" loaded.'
  ]);
  const [cmd, setCmd] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminal]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isAttacking && !state.blockedIps.includes(ATTACKER_IP)) {
      interval = setInterval(() => {
        const passwords = ['12345', 'admin', 'god', 'qwerty', 'root', 'kali', 'security', 'password', '654321', 'welcome'];
        const password = passwords[Math.floor(Math.random() * passwords.length)];
        addLog(ATTACKER_IP, 'LOGIN_FAILURE', `Hydra brute-force: admin / ${password}`, 'warning', 'Hydra/v9.5 (Kali Linux ARM64)', 'HTTP-POST');
        setTerminal(prev => [...prev, `[FAIL] Hydra attempt [${Math.floor(Math.random() * 1000)}]: user:admin  pass:${password}  target:${VICTIM_IP}`].slice(-30));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [state.isAttacking, state.blockedIps, addLog]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmd.trim()) return;

    const input = cmd.toLowerCase().trim();
    const newLogs = [...terminal, `<span class="text-indigo-400 font-bold">root@kali</span>:<span class="text-white">~#</span> ${cmd}`];
    setCmd('');

    if (state.blockedIps.includes(ATTACKER_IP)) {
      setTerminal([...newLogs, '<span class="text-rose-500 font-bold">[!] ERROR: Network connection reset by peer. (SIEM_FIREWALL_ACTIVE)</span>', '<span class="text-rose-400 italic">Target 192.168.1.45 has blacklisted our ingress point. Kill chain broken.</span>']);
      return;
    }

    if (input.startsWith('nmap')) {
      if (input.includes('192.168.1.45')) {
        setTerminal([...newLogs, 
          '[*] Starting Nmap 7.94 ( https://nmap.org ) at ' + new Date().toLocaleTimeString(),
          'Nmap scan report for 192.168.1.45',
          'Host is up (0.005s latency).',
          'PORT   STATE SERVICE VERSION',
          '80/tcp open  http    Apache 2.4.41',
          '|_http-server-header: Apache/2.4.41 (Ubuntu)',
          '|_http-title: EV CORP - Internal Portal',
          '[+] Scan complete. Vulnerable entry point found on Port 80.'
        ]);
        addLog(ATTACKER_IP, 'RECON_SCAN', 'Syn-Scan identifying Port 80/tcp as OPEN', 'info', 'Nmap/v7.94 (https://nmap.org)', 'TCP/SYN');
      } else {
        setTerminal([...newLogs, '[-] usage: nmap -sV [target_ip]', 'Hint: Try scanning the target 192.168.1.45']);
      }
    } else if (input.startsWith('hydra')) {
      if (input.includes('192.168.1.45')) {
        updateState({ isAttacking: true });
        setTerminal([...newLogs, 
          '[+] Hydra v9.5 (c) 2024 by van Hauser',
          '[*] Dictionary attack started on: 192.168.1.45',
          '[*] Protocol: HTTP-POST-FORM | User: admin | Passlist: /root/tools/passlist.txt',
          '[+] [ATTACK_SEQUENCE_INITIALIZED] - Monitoring output strings...'
        ]);
      } else {
        setTerminal([...newLogs, '[-] hydra: Target system not found. Command structure incorrect.']);
      }
    } else if (input === 'ls') {
      setTerminal([...newLogs, 'exploit.sh  nmap_results.txt  <span class="text-indigo-400 font-bold">passlist.txt</span>  payloads/']);
    } else if (input === 'cat passlist.txt') {
      setTerminal([...newLogs, '12345', 'admin', 'password', 'god', 'qwerty', '12345678', 'root', 'kali', 'security', 'welcome', '...[truncated for privacy]']);
    } else if (input === 'whoami') {
      setTerminal([...newLogs, 'root (Superuser Access)']);
    } else if (input === 'ifconfig' || input === 'ip a') {
      setTerminal([...newLogs, 
        'eth0: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500',
        '        inet ' + ATTACKER_IP + '  netmask 255.255.255.0  broadcast 103.45.21.255',
        '        ether 00:0c:29:4f:a1:03  txqueuelen 1000  (Ethernet)'
      ]);
    } else if (input === 'clear') {
      setTerminal(['<span class="text-slate-500 italic">Terminal session refreshed. root@kali ready.</span>']);
    } else if (input === 'help') {
      setTerminal([...newLogs, 
        '<span class="text-amber-400 font-bold underline">AVAILABLE OFFENSIVE TOOLS:</span>',
        ' <span class="text-indigo-300">nmap -sV 192.168.1.45</span>      : Info gathering (Recon)',
        ' <span class="text-indigo-300">hydra -l admin -P ...</span>     : Brute-force credentials',
        ' <span class="text-indigo-300">whoami</span>                      : Check local identity',
        ' <span class="text-indigo-300">ifconfig</span>                    : Network configuration',
        ' <span class="text-indigo-300">ls / cat</span>                    : File system navigation',
        ' <span class="text-indigo-300">clear</span>                       : Wipe terminal screen',
        ' <span class="text-slate-400 font-bold mt-2 block">WORKSHOP TIP (Thanglish):</span>',
        ' Target IP-ah (192.168.1.45) use panni exploitation sequence-ah start pannu da.'
      ]);
    } else if (input === 'kill' || input.includes('stop')) {
      updateState({ isAttacking: false });
      setTerminal([...newLogs, '[*] Terminating active exploit processes...', '[*] Process 8842 killed. Session clean.']);
    } else {
      setTerminal([...newLogs, `<span class="text-rose-500">zsh: command not found: ${cmd}</span>`, 'Type "help" to see available kali tools.']);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col p-6 bg-[#050505] font-mono selection:bg-indigo-500/40"
    >
      <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c0c] rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/5 relative group">
        
        {/* Terminal Title Bar */}
        <div className="bg-[#1a1a1a] px-5 py-3 border-b border-white/10 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-4">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.3)] cursor-pointer hover:bg-rose-400" />
               <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.3)] cursor-pointer hover:bg-amber-400" />
               <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)] cursor-pointer hover:bg-emerald-400" />
             </div>
             <div className="h-4 w-px bg-white/10 mx-1" />
             <div className="flex items-center gap-2">
               <Skull className="w-3.5 h-3.5 text-slate-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Kali v2024.1 - 103.45.21.9</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <Activity className={cn("w-3 h-3", state.isAttacking ? "text-emerald-500 animate-pulse" : "text-slate-600")} />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CPU: 42%</span>
            </div>
            <div className="flex items-center gap-2">
               <div className={cn("w-1.5 h-1.5 rounded-full", state.isAttacking ? "bg-emerald-500" : "bg-slate-600")} />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{state.isAttacking ? 'RUNNING' : 'IDLE'}</span>
            </div>
          </div>
        </div>

        {/* Action / Context Bar */}
        <div className="px-8 py-5 flex items-center justify-between bg-[#111] border-b border-white/5 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-white uppercase tracking-tighter terminal-glow">Offensive Security Framework</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-[9px] font-bold text-rose-500/80 font-mono tracking-[0.2em]">SPOOFED_GATEWAY: 103.45.21.1</p>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <p className="text-[9px] font-bold text-slate-500 font-mono tracking-[0.2em]">TARGET_ASSET: 192.168.1.45</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-[9px] font-black text-indigo-400/50 uppercase border border-indigo-500/20 px-3 py-1.5 rounded bg-indigo-500/5">
              Workshop Exclusive v1.2
            </div>
          </div>
        </div>

        {/* Terminal Output Area */}
        <div className="flex-1 min-h-0 relative">
          {/* Scanlines Effect */}
          <div className="absolute inset-0 terminal-scanlines opacity-20 pointer-events-none" />
          
          <div 
            ref={scrollRef}
            className="absolute inset-0 p-8 font-mono text-sm overflow-auto custom-scrollbar selection:bg-indigo-500/30"
          >
            {terminal.map((line, i) => (
              <div key={i} className="mb-1 text-slate-300 leading-relaxed font-medium">
                <span className="opacity-10 mr-4 text-[10px] select-none">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span> 
                <span dangerouslySetInnerHTML={{ __html: line }} />
              </div>
            ))}
            
            {!state.blockedIps.includes(ATTACKER_IP) ? (
              <form onSubmit={handleCommand} className="flex items-center gap-2 mt-4 group">
                  <span className="text-indigo-400 font-bold shrink-0">root@kali<span className="text-white">:~#</span></span>
                  <div className="relative flex-1">
                    <input 
                      ref={inputRef}
                      autoFocus
                      type="text" 
                      value={cmd}
                      onChange={e => setCmd(e.target.value)}
                      onBlur={() => setTimeout(() => inputRef.current?.focus(), 10)}
                      className="bg-transparent border-none outline-none text-slate-200 w-full caret-transparent placeholder:opacity-20"
                      placeholder="Enter exploitation command..."
                    />
                    {/* Custom Cursor */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 pointer-events-none flex items-center"
                      style={{ transform: `translateX(${cmd.length}ch)` }}
                    >
                      <div className="w-2.5 h-5 bg-indigo-500/80 cursor-blink shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                  </div>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-12 p-10 rounded-3xl bg-rose-500/5 border-2 border-rose-500/20 flex flex-col items-center text-center max-w-lg mx-auto relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
                <ShieldOff className="w-20 h-20 text-rose-500/40 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
                <h3 className="text-rose-500 font-black text-3xl uppercase tracking-tighter mb-4 terminal-glow">ACCESS_REVOKED</h3>
                <p className="text-rose-400/70 text-sm font-mono leading-relaxed px-4">
                  SIEM Automated Response: <br />
                  Malicious signature detected from {ATTACKER_IP}. <br />
                  Node blacklisted globally via Enterprise Firewall.
                </p>
                <div className="mt-8 flex gap-4">
                   <div className="text-[10px] font-black text-rose-500/50 uppercase tracking-widest border border-rose-500/20 px-4 py-2 rounded">
                      Connection Status: BLOCKED
                   </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Info Bar */}
      <div className="mt-5 flex items-center justify-between px-2">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Active Target</span>
            <span className="text-xs font-bold text-indigo-400/80">{VICTIM_IP}</span>
          </div>
          <div className="w-px h-6 bg-white/5 self-center" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Environment</span>
            <span className="text-xs font-bold text-emerald-400/80">Sandboxed Workshop v1.2</span>
          </div>
        </div>
        
        <div className="flex gap-3">
           <button 
             onClick={() => setTerminal([...terminal, '<span class="text-indigo-400 font-bold">INFO:</span> Scanning for automated patches... Done.'])}
             className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black text-slate-400 transition-colors uppercase tracking-widest"
           >
             System Check
           </button>
           <button 
             onClick={() => setTerminal(['<span class="text-indigo-400 font-bold">TERMINAL_WIPE:</span> Resetting console environment...'])}
             className="px-4 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[10px] font-black text-rose-400 transition-colors uppercase tracking-widest"
           >
             Hard Reset
           </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Layout ---

const AssessmentView = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const questions = [
    {
      q: "In a SOC environment, what is the 'True Positive' rate primarily measuring?",
      o: ["Frequency of successful login attempts", "Accuracy of alert detection for real threats", "Number of logs cleared by administrators", "Latency in firewall packet processing"],
      a: 1
    },
    {
      q: "Hydra brute-force attack timing-ah block panna best SOC defense strategy edhu?",
      o: ["Reset server every 10 minutes", "Implement Account Lockout & Rate Limiting", "Delete the admin account", "Disable Port 443"],
      a: 1
    },
    {
      q: "What does the 'S' stand for in SIEM, and what is its core role?",
      o: ["Secure - Encrypting all incoming traffic", "Security - Real-time monitoring and event correlation", "Storage - Long term log archival", "System - Managing OS updates"],
      a: 1
    },
    {
      q: "Nmap scan results-la Port 80 'Filtered' nu vandha what does it usually mean?",
      o: ["Target is offline", "Service is running on Port 8080", "A Firewall is blocking the probe", "The port is wide open"],
      a: 2
    },
    {
      q: "Incident Response Lifecycle-la 'Containment' appuram vara phase edhu?",
      o: ["Preparation", "Detection", "Eradication", "Exfiltration"],
      a: 2
    },
    {
      q: "A sequence of failed login attempts from 50 different IPs targeting one user is called?",
      o: ["Brute Force", "Credential Stuffing", "Password Spraying", "SQL Injection"],
      a: 2
    },
    {
      q: "WAF (Web Application Firewall) logs-la '<script>alert(1)</script>' kanda what is the attack?",
      o: ["XSS (Cross-Site Scripting)", "SQLi", "DDoS", "Buffer Overflow"],
      a: 0
    },
    {
      q: "SOC Analyst rule: Log severity 'Critical' level alert vandha immediate action enna?",
      o: ["Ignore - it's likely a false positive", "Wait for boss to arrive", "Triage, Validate, and Contain", "Send a generic email to everyone"],
      a: 2
    },
    {
      q: "What is the 'False Negative' scenario in SOC?",
      o: ["Alert triggered for a valid user action", "Real exploit happens but NO alert is triggered", "System crashes during a scan", "User enters wrong password"],
      a: 1
    },
    {
      q: "Which protocol is usually exploited in a 'SYN Flood' attack?",
      o: ["UDP", "ICMP", "TCP", "HTTP"],
      a: 2
    }
  ];

  const handleNext = () => {
    if (selected === questions[currentQ].a) setScore(score + 1);
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-slate-900 border border-indigo-500/30 rounded-[3rem] p-12 text-center"
        >
          <Award className="w-20 h-20 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Assessment Results</h2>
          <p className="text-slate-400 font-mono mb-8 uppercase tracking-widest">Score: {score} / 10</p>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl mb-8">
            <p className="text-sm text-indigo-300 font-medium leading-relaxed">
              {score >= 8 ? "Excellent! You are ready for SOC Tier 1 role." : "Good try, but analyze the lab logs again to understand the concepts better."}
            </p>
          </div>
          <button onClick={() => { setCurrentQ(0); setScore(0); setShowResult(false); }} className="px-8 py-4 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white">Retake Test</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full max-w-4xl mx-auto p-12 overflow-auto custom-scrollbar">
      <div className="mb-12">
        <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Final Certification Theory</h2>
        <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">SOC Advanced Assessment</h1>
        <p className="text-slate-400 font-medium">Verify your understanding of the EV Cyber Lab concepts.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-black bg-indigo-600 px-3 py-1 rounded text-white uppercase">Question {currentQ + 1}</span>
            <div className="h-0.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(currentQ / questions.length) * 100}%` }} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-10 leading-snug">{questions[currentQ].q}</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {questions[currentQ].o.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelected(idx)}
                className={cn(
                  "w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group",
                  selected === idx 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" 
                    : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs uppercase", selected === idx ? "border-white bg-white/20" : "border-slate-700 bg-slate-900")}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="font-semibold text-sm">{opt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center px-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Select the most accurate response.</p>
          <button 
            disabled={selected === null}
            onClick={handleNext}
            className="px-10 py-5 bg-indigo-600 disabled:opacity-30 hover:bg-indigo-500 text-white rounded-3xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-indigo-600/20"
          >
            {currentQ === questions.length - 1 ? "Finish Assessment" : "Next Question"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MainLayout = ({ children, state, activeTaskId, setActiveTaskId, reset }: any) => {
  const [showBriefing, setShowBriefing] = useState(() => !localStorage.getItem('ev_briefing_seen'));
  const location = useLocation();
  
  const handleStart = () => {
    setShowBriefing(false);
    localStorage.setItem('ev_briefing_seen', 'true');
  };

  const navItems = [
    { name: 'SOC Dashboard', path: '/', icon: LayoutDashboard, external: false },
    { name: 'Victim System', path: '/victim', icon: Monitor, external: true },
    { name: 'Attacker Console', path: '/attacker', icon: TerminalIcon, external: true },
    { name: 'Theory Test', path: '/assessment', icon: BookOpen, external: false },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 relative z-20 font-sans">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg leading-tight uppercase tracking-wider">EV CYBER LABS</h1>
            <p className="text-xs text-indigo-400 font-mono font-bold">CROSS-TAB SIM v1.2</p>
          </div>
        </div>

        {/* Student Profile Card */}
        <div className="mx-4 mt-6 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Authenticated Analyst</span>
            <span className="text-xs font-bold text-white truncate uppercase tracking-tight">{state.studentName || 'Student_User'}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Training Protocol</p>
          {LAB_TASKS.map((task, idx) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              index={idx}
              isActive={activeTaskId === task.id}
              isCompleted={state.completedTasks.includes(task.id)}
              onSelect={() => setActiveTaskId(task.id)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 font-sans">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mastery</span>
              <span className="text-xs font-mono text-emerald-400">{Math.round((state.completedTasks.length / LAB_TASKS.length) * 100)}%</span>
            </div>
            <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(state.completedTasks.length / LAB_TASKS.length) * 100}%` }}
              />
            </div>
          </div>
          <button 
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest font-sans"
          >
            <RefreshCcw className="w-3 h-3" /> Reset Full Environment
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <header className="h-20 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8 shrink-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-2xl border border-slate-700">
            {navItems.map((item) => (
              <div key={item.path} className="flex items-center group">
                <Link 
                  to={item.path}
                  target={item.external ? "_blank" : "_self"}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    location.pathname === item.path ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" /> {item.name}
                  {item.external && <ExternalLink className="w-3 h-3 ml-1 opacity-50" />}
                </Link>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Threat Status</span>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                    state.alertLevel === 'normal' && "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
                    state.alertLevel === 'low' && "border-indigo-500/30 text-indigo-500 bg-indigo-500/5",
                    state.alertLevel === 'high' && "border-amber-500/30 text-amber-500 bg-amber-500/5 animate-pulse",
                    state.alertLevel === 'breach' && "border-rose-500/30 text-rose-500 bg-rose-500/10 animate-pulse ring-4 ring-rose-500/20",
                  )}>
                    {state.alertLevel}
                  </span>
                  <Activity className={cn("w-4 h-4", state.alertLevel === 'breach' ? "text-rose-500 animate-bounce" : "text-emerald-500")} />
                </div>
              </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto relative">
          {children}
        </div>
      </main>

      <AnimatePresence>
        {showBriefing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/80"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-12 border-b border-slate-800 bg-indigo-600/10 text-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/30">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Enterprise Workshop</h2>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-6">Multi-Tab SOC Simulation</h1>
                <p className="text-slate-400 leading-relaxed font-medium text-sm">
                  This lab environment mimics a real-world Security Operations Center. You are encouraged to open the 
                  <strong className="text-white"> Victim System</strong> and <strong className="text-white">Attacker Console</strong> in 
                  <span className="text-indigo-400 italic font-bold"> separate browser tabs</span>. 
                  All actions across tabs are synchronized in real-time within your browser.
                </p>
              </div>
              <div className="p-10">
                <button 
                  onClick={handleStart}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  Begin Simulation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {state.completedTasks.length === LAB_TASKS.length && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/90"
          >
             <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-[3rem] shadow-2xl text-center p-12"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
                 <Award className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">SOC Certified</h2>
              <p className="text-slate-400 font-medium leading-relaxed mb-10">Verification complete. You have successfully identified, monitored, and neutralized a perimeter breach across multiple system layers.</p>
              
              <a 
                href="https://wa.me/919789459354?text=SOC_LAB_COMPLETE" 
                target="_blank"
                className="w-full inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                Claim Lab Certificate <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- App Root ---

export default function App() {
  const { state, updateState, addLog, reset, isAuthenticated, studentName, login } = useSimulation();
  const [activeTaskId, setActiveTaskId] = useState(LAB_TASKS[0].id);

  if (!isAuthenticated) {
    return <AccessGate onLogin={login} />;
  }

  return (
    <HashRouter>
      <MainLayout state={{ ...state, studentName }} activeTaskId={activeTaskId} setActiveTaskId={setActiveTaskId} reset={reset}>
        <Routes>
          <Route path="/" element={<DashboardView state={state} addLog={addLog} updateState={updateState} activeTaskId={activeTaskId} setActiveTaskId={setActiveTaskId} />} />
          <Route path="/victim" element={<VictimView addLog={addLog} />} />
          <Route path="/attacker" element={<AttackerView state={state} updateState={updateState} addLog={addLog} />} />
          <Route path="/assessment" element={<AssessmentView />} />
        </Routes>
      </MainLayout>
    </HashRouter>
  );
}
