# EV CYBER ACADEMY: Network Security & SOC Lab - Technical Documentation

## 1. Project Overview
**EV CYBER ACADEMY NETWORK SEC & SOC LAB** is a professional-grade, interactive cybersecurity training environment. It simulates a real-world Security Operations Center (SOC) workflow, allowing students to experience both offensive (Red Team) and defensive (Blue Team) operations in a synchronized multi-tab environment.

## 2. Lab Components
The lab is divided into four primary modules:

*   **Access Gate:** A secure entry portal requiring a student identifier and the lab access password (`EVSOCV1LAB`).
*   **SOC Dashboard (Blue Team):** A SIEM (Security Information and Event Management) console that monitors real-time logs, identifies threats (via IP origin, protocol, and user-agent fingerprinting), and provides incident response tools (IP Blocking).
*   **Attacker Console (Red Team):** A Kali Linux-styled terminal simulation. It supports manual command entry (Nmap for recon, Hydra for brute-force) and visually mimics a command-line interface with realistic output styling and scrollability.
*   **Victim System (Target):** A simulated internal portal representing an enterprise asset. Students use this to establish baselines or observe how user activity looks in the logs.
*   **Theory Assessment:** A 10-question high-difficulty certification test to verify the student's understanding of the concepts practiced in the lab.

## 3. Working Mechanism
### Cross-Tab Synchronization
The core of the simulation is the **BroadcastChannel API**. This allows the application to stay in sync across multiple browser tabs without a backend server:
- Actions in the **Attacker Console** (like starting a Hydra scan) send state updates to the **SOC Dashboard**.
- Defensive actions in the **SOC Dashboard** (like blocking an IP) instantly terminate processes in the **Attacker Console**.
- **LocalStorage** is used as a persistence layer, ensuring that refreshing a page doesn't reset the student's progress or the simulation state.

### Threat Levels
The system features a dynamic **Alert Level** logic:
- **Normal:** System idle or authorized traffic.
- **Low/High:** Detected reconnaissance scans or initial failure bursts.
- **Breach:** Triggered when failed login attempts exceed the security threshold (15 attempts).

## 4. Technology Stack (Tech Stack)

### Core Frontend
- **React 18+**: For building the component-based user interface.
- **Vite**: Ultra-fast build tool and development server.
- **TypeScript**: Ensuring type safety and robust code structure.

### Navigation & State
- **React Router DOM**: Managing the SPA (Single Page Application) routing.
- **BroadcastChannel API**: Native browser API for real-time cross-tab communication.
- **LocalStorage**: Persistent client-side storage for simulation data.

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for high-performance styling.
- **Lucide React**: Vector-based icon library for consistent UI elements.
- **Custom CSS (Scrollbars/Animations)**: Specifically crafted scrollbars and terminal scanline effects in `src/index.css`.

### Animation & Data Viz
- **Framer Motion (`motion/react`)**: Powering smooth route transitions, terminal blinks, and alert animations.
- **Recharts**: Integrated for future-ready data visualization and metric tracking.

### Utilities
- **clsx & tailwind-merge**: Managing dynamic tailwind classes and preventing conflict.

---
**Developed by EV Cyber Academy**
*Advanced SOC Training Simulation v1.2*
