# CyberSOC Lab Admin & Teaching Guide (399rs Workshop)
> **CONFIDENTIAL: FOR INSTRUCTOR USE ONLY**

This document contains the answers for the validation challenges and ASCII-based visual explanations for the concepts taught in each module.

---

## 🔑 Lab Answer Key

| Task # | Module Name | Answer (Input) | Concept |
| :--- | :--- | :--- | :--- |
| **01** | Brute Force Detection | `103.45.21.9` | Identity Security |
| **02** | SQL Injection Signature | `185.12.33.4` | Input Validation |
| **03** | Data Exfiltration Hunt | `18:00` | Network Anomaly Detection |
| **04** | Internal Reconnaissance | `192.168.1.20` | Lateral Movement |
| **05** | Digital Forensics 101 | `1` | Alert Triage |
| **06** | Incident Response | `B` | Containment Strategy |

---

## 📊 Module Concept Explanations (ASCII)

### Module 1: Brute Force Detection
Teaching point: Attackers automate login attempts to guess passwords.

```text
ATTACKER (103.45.21.9)         SERVER LOGS
       |                           |
       |--- Attempt: root/123 ---> | [FAILURE]
       |--- Attempt: root/pwd ---> | [FAILURE]
       |--- Attempt: admin/123 --> | [FAILURE] <--- SOC ALARM TRIGGERS
       |--- Attempt: guest/123 --> | [FAILURE]
       |                           |
[ RULE: IF 3+ FAILURES PER SEC -> MARK CRITICAL ]
```

### Module 2: SQL Injection (SQLi)
Teaching point: Manipulating database queries via web forms.

```text
WAF (Web App Firewall)         DATABASE QUERY
       |                           |
       |--- Input: "' OR 1=1" ---> | SELECT * FROM users
       |      [ MALICIOUS ]        | WHERE id = '' OR 1=1;
       |            |              |        ^---[ ALWAYS TRUE ]
       |            v              |
       |--- BLOCK & LOG IP --------| Result: ALL USERS EXPOSED!
```

### Module 3: Data Exfiltration
Teaching point: Identifying "The Spike" in outbound traffic.

```text
TRAFFIC FLOW (Gbps)
      ^
      |           [!] 18:00 SPIKE
      |            |
      |            |   /|
      |   _______/|  / |
      |__/       \|_/  |____
      +----------------------> TIME
        12:00     15:00    18:00
[ FINDING: 450Mbps outbound = DATABASE DUMP SHIPPED OUT ]
```

### Module 4: Internal Reconnaissance
Teaching point: Once inside, attackers "look around" (Port Scanning).

```text
COMPROMISED HOST (192.168.1.20)      TARGET SERVER (.1.1)
       |                                |
       |--- SYN (Port 21: FTP) ------>  | [CLOSED]
       |--- SYN (Port 22: SSH) ------>  | [CLOSED]
       |--- SYN (Port 80: HTTP) ----->  | [OPEN] <--- PATH FOUND!
       |                                |
[ LATERAL MOVEMENT: Mapping internal assets for next pivot ]
```

### Module 5: Digital Forensics & Triage
Teaching point: Sorting signal from noise.

```text
LOG SOURCES               SOC WORKFLOW
 [INFO]    \             1. Collect
 [WARN] ----> [ SIEM ]   2. Filter: Find [CRITICAL]
 [CRITICAL] /            3. Count Impacted Systems
 [INFO]   /              4. Assign Incident Priority
```

### Module 6: Incident Response (Containment)
Teaching point: The OODA Loop (Observe, Orient, Decide, Act).

```text
PROBLEM: SQLi Attack In Progress
   |
   |--- Option A: Reboot (X) - Too slow, loss of evidence
   |--- Option B: Block IP (O) - STOP THE BLEEDING (Containment)
   |--- Option C: Delete DB (X) - Overkill / Denial of Service
   |--- Option D: Ignore (X) - Data breach expands
   v
[ IR RULE: CONTAIN FIRST, CLEAN SECOND. ]
```

---
*Generated for the EV Cyber Academy Workshop Edition.*
