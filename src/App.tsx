/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  BrowserRouter,
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
  ExternalLink
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
}

interface LabTask {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium';
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
  { id: 'start-1', timestamp: new Date().toLocaleTimeString(), sourceIp: '127.0.0.1', action: 'SYSTEM_START', payload: 'SOC Kernel Simulation Initialized', status: 'info' },
  { id: 'start-2', timestamp: new Date().toLocaleTimeString(), sourceIp: '192.168.1.1', action: 'FIREWALL_UP', payload: 'Ruleset v4.2 applied', status: 'success' },
];

const LAB_TASKS: LabTask[] = [
  {
    id: 'login-test',
    title: 'Normal Login Attempt',
    description: 'Login to the Victim Portal using valid credentials to establish a baseline.',
    difficulty: 'Easy',
    reward: 'Access Baseline',
    instructions: [
      'Open the VICTIM SYSTEM (preferably in a new tab).',
      'Login with Username: admin | Password: password123',
      'Verify you see "Login Successful".'
    ],
    validation: (state) => state.logs.some(l => l.action === 'LOGIN_SUCCESS' && l.sourceIp === USER_IP),
    hint: 'Open the "Victim System" and use the provided credentials.'
  },
  {
    id: 'observe-logs',
    title: 'SIEM Log Observation',
    description: 'Verify that your login event was recorded in the SOC Dashboard.',
    difficulty: 'Easy',
    reward: 'Log Analyst',
    instructions: [
      'Navigate to SOC DASHBOARD.',
      'Locate the LOGIN_SUCCESS entry from your IP (45.122.1.22).',
      'Enter the Source IP recorded for this login.'
    ],
    validation: (_, ans) => ans.trim() === USER_IP,
    hint: 'Check the Log Console in the Dashboard. The IP you used to login should be there.'
  },
  {
    id: 'start-attack',
    title: 'Initiate Brute-Force',
    description: 'Exploit the Victim system from the Attacker Console.',
    difficulty: 'Easy',
    reward: 'Script Kiddie',
    instructions: [
      'Open the ATTACKER CONSOLE (preferably in a new tab).',
      'Click on "START BRUTE-FORCE SCRIPT".',
      'Verify the script is running in the terminal.'
    ],
    validation: (state) => state.isAttacking,
    hint: 'Go to the "Attacker Console" and initiate the automated script.'
  },
  {
    id: 'detect-pattern',
    title: 'Identify Abnormal Pattern',
    description: 'Spot the automated attack in the SOC Dashboard.',
    difficulty: 'Medium',
    reward: 'Pattern Recon',
    instructions: [
      'Monitor the SOC logs.',
      'Find the recurring LOGIN_FAILURE attempts.',
      'Identify and enter the Attacker\'s Source IP.'
    ],
    validation: (_, ans) => ans.trim() === ATTACKER_IP,
    hint: 'Look for the external IP that is generating rapid failed login attempts.'
  },
  {
    id: 'detect-alert',
    title: 'Security Alert Trigger',
    description: 'The SOC system should have triggered an automated alert.',
    difficulty: 'Medium',
    reward: 'Alert Responder',
    instructions: [
      'Check the Simulation Status in the top header.',
      'Wait for the Alert Level to reach "BREACH" or "HIGH".',
      'Submit the word "BREACH" when you see it.'
    ],
    validation: (state, ans) => state.alertLevel === 'breach' || ans.toUpperCase() === 'BREACH',
    hint: 'The failed attempts will eventually trigger the security threshold.'
  },
  {
    id: 'containment',
    title: 'Block and Verify',
    description: 'Contain the threat by blocking the malicious IP.',
    difficulty: 'Medium',
    reward: 'Incident Commander',
    instructions: [
      'In the SOC Dashboard, find the "Defense Actions" panel.',
      'Input the Attacker IP (' + ATTACKER_IP + ') and click Block.',
      'Verify the logs stop appearing and system status resets.'
    ],
    validation: (state) => state.blockedIps.includes(ATTACKER_IP),
    hint: 'Block the IP you identified in Task 4. Once blocked, the attacker script will automatically stop.'
  }
];

// --- Broadcast Channel for Cross-Tab Sync ---
const SYNC_CHANNEL = 'ev_cyber_lab_sync';
const broadcast = new BroadcastChannel(SYNC_CHANNEL);

// --- Components ---

const TaskCard = ({ task, isActive, isCompleted, onSelect, index }: { 
  task: LabTask, 
  isActive: boolean, 
  isCompleted: boolean, 
  onSelect: () => void,
  index: number
}) => (
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

  const updateState = useCallback((partial: Partial<SimulationState>) => {
    setState(prev => {
      const newState = { ...prev, ...partial };
      
      // Enforce Derived State
      const failed = newState.logs.filter(l => l.action === 'LOGIN_FAILURE').length;
      newState.failedAttempts = failed;
      if (failed > 15) newState.alertLevel = 'breach';
      else if (failed > 5) newState.alertLevel = 'high';
      else if (failed > 0) newState.alertLevel = 'low';
      else newState.alertLevel = 'normal';

      // Auto-stop attack if blocked
      if (newState.blockedIps.includes(ATTACKER_IP)) {
        newState.isAttacking = false;
      }

      localStorage.setItem('ev_cyber_lab_state', JSON.stringify(newState));
      broadcast.postMessage(newState);
      return newState;
    });
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      setState(event.data);
    };
    broadcast.addEventListener('message', handleMessage);
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ev_cyber_lab_state' && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      broadcast.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const addLog = useCallback((ip: string, action: string, payload: string, status: LogStatus) => {
    setState(prev => {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        sourceIp: ip,
        action,
        payload,
        status
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
      broadcast.postMessage(newState);
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
    broadcast.postMessage(defaultState);
  }, []);

  return { state, updateState, addLog, reset };
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
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">IP Source</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Detail</th>
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
                    <td className="px-6 py-4 font-mono text-xs text-indigo-300">{log.sourceIp}</td>
                    <td className="px-6 py-4 font-bold text-[11px] tracking-tight text-slate-200">{log.action}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500 font-mono italic truncate max-w-[250px] block group-hover:text-slate-300">
                        {log.payload}
                      </span>
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
                        addLog('127.0.0.1', 'FIREWALL_BLOCK', `IP ${el.value} blacklisted`, 'critical');
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
            addLog(USER_IP, 'LOGIN_SUCCESS', `User: ${u}`, 'success');
            alert('Login Successful! Baseline Established in SIEM.');
          } else {
            addLog(USER_IP, 'LOGIN_FAILURE', `User: ${u}`, 'warning');
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
  const [terminal, setTerminal] = useState<string[]>(['$ msfconsole initialized...', '$ ready for payload injection...']);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isAttacking && !state.blockedIps.includes(ATTACKER_IP)) {
      interval = setInterval(() => {
        const password = ['12345', 'admin', 'god', 'qwerty', 'root'][Math.floor(Math.random() * 5)];
        addLog(ATTACKER_IP, 'LOGIN_FAILURE', `Attempted credentials: admin / ${password}`, 'warning');
        setTerminal(prev => [...prev, `[FAIL] Credential Spray: admin:${password} to ${VICTIM_IP}`].slice(-12));
      }, 900);
    }
    return () => clearInterval(interval);
  }, [state.isAttacking, state.blockedIps, addLog]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col p-8 bg-slate-950"
    >
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-12 flex-1 shadow-2xl flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f43f5e 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/10">
              <Skull className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 uppercase tracking-tighter">OFFENSIVE SECURITY CONSOLE</h2>
              <p className="text-xs text-rose-500 font-mono font-bold tracking-widest animate-pulse">SESSION_STATUS: {state.isAttacking ? 'ACTIVE_EXPLOIT' : 'IDLE'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
            onClick={() => {
              if (state.blockedIps.includes(ATTACKER_IP)) {
                alert('CRITICAL ERROR: IP ' + ATTACKER_IP + ' has been blacklisted by the target SIEM.');
                return;
              }
              updateState({ isAttacking: true });
              setTerminal(prev => [...prev, '$ module login_spray --start', '$ load payloads/common.txt', '$ targeting victim asset...']);
            }}
            className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
            >
              Start Brute-Force Script
            </button>
            <button 
            onClick={() => {
              updateState({ isAttacking: false });
              setTerminal(prev => [...prev, '$ module stop', '$ cleaning traces...']);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all"
            >
              Kill Process
            </button>
          </div>
        </div>

        <div className="flex-1 bg-black rounded-2xl border border-slate-800 p-8 font-mono text-sm overflow-auto shadow-inner custom-scrollbar">
           {terminal.map((line, i) => (
             <div key={i} className={cn("mb-1", line.includes('[FAIL]') ? 'text-rose-500/80' : 'text-emerald-500/80')}>
               <span className="opacity-30 mr-3">[{new Date().toLocaleTimeString()}]</span> {line}
             </div>
           ))}
           {state.isAttacking && !state.blockedIps.includes(ATTACKER_IP) && (
             <motion.div 
               animate={{ opacity: [1, 0] }}
               transition={{ repeat: Infinity, duration: 0.8 }}
               className="w-2 h-4 bg-emerald-500 inline-block align-middle ml-1"
             />
           )}
           {state.blockedIps.includes(ATTACKER_IP) && (
             <div className="text-rose-500 font-bold border-2 border-rose-500/30 p-8 rounded-2xl mt-8 bg-rose-500/10 flex items-center gap-6 justify-center text-center flex-col">
                <ShieldOff className="w-16 h-16 opacity-50" />
                <div>
                  <h3 className="text-xl font-black mb-2 uppercase">CONNECTION TERMINATED</h3>
                  <p className="text-sm opacity-70">Target system is no longer reachable from this IP.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Layout ---

const MainLayout = ({ children, state, activeTaskId, setActiveTaskId, reset }: any) => {
  const [showBriefing, setShowBriefing] = useState(() => !localStorage.getItem('ev_briefing_seen'));
  const location = useLocation();
  
  const handleStart = () => {
    setShowBriefing(false);
    localStorage.setItem('ev_briefing_seen', 'true');
  };

  const navItems = [
    { name: 'SOC Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Victim System', path: '/victim', icon: Monitor },
    { name: 'Attacker Console', path: '/attacker', icon: TerminalIcon },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 relative z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg leading-tight uppercase tracking-wider">EV CYBER LABS</h1>
            <p className="text-xs text-indigo-400 font-mono font-bold">CROSS-TAB SIM v1.2</p>
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
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
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
            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest"
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
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    location.pathname === item.path ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" /> {item.name}
                </Link>
                <a 
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
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
  const { state, updateState, addLog, reset } = useSimulation();
  const [activeTaskId, setActiveTaskId] = useState(LAB_TASKS[0].id);

  return (
    <BrowserRouter>
      <MainLayout state={state} activeTaskId={activeTaskId} setActiveTaskId={setActiveTaskId} reset={reset}>
        <Routes>
          <Route path="/" element={<DashboardView state={state} addLog={addLog} updateState={updateState} activeTaskId={activeTaskId} setActiveTaskId={setActiveTaskId} />} />
          <Route path="/victim" element={<VictimView addLog={addLog} />} />
          <Route path="/attacker" element={<AttackerView state={state} updateState={updateState} addLog={addLog} />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
