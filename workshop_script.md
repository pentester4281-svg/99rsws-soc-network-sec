# EV CYBER ACADEMY: SOC & Network Security 3-Hour Workshop Script
**Language:** Thanglish (Tamil + English)
**Objective:** Hands-on experience in Attacker methodology and SOC response.

---

## 🕒 Hour 1: The Foundation & Recon (00:00 - 01:00)

### 00:00 - 00:15 | Welcome & Induction
*   **Script:** "Hello everyone! Welcome to EV Cyber Academy. Iniku namba real-world-la oru company security epadi operate panni, attack-ah handle pannuvanga-nu paka porom. Browser open pannunga, namba lab-ku login pannunga."
*   **Action:** Students login using `EVSOCV1LAB`.
*   **Key Point:** Explain that the lab used a state-of-the-sync system. "Oru tab-la neenga attack panna, SIEM dashboard-la alert varum. Everything is real-time."

### 00:15 - 00:30 | Blueprint & Tech Stack Intro
*   **Script:** "Namba stacks.md file-ah parunga. Namba use panradhu React with BroadcastChannel API. Server illama tabs connect aagum. SOC Dashboard-na enna? Attacker Console-na enna? Indha fundamentals-ah clear-ah purinjikonga."

### 00:30 - 00:45 | Task 1: Establishing the Baseline
*   **Script:** "First, Task 1-ah parunga. Victim System portal open pannunga. User: admin | Pass: password123 panni login pannunga. Idhu edhuku? Oru normal user behavior log-la epadi vizhudhu-nu SOC analyst-ah monitor pannanum."
*   **Action:** Check logs for `LOGIN_SUCCESS` with `USER_IP`.

### 00:45 - 01:00 | Task 2: Network Recon (Nmap)
*   **Script:** "Ipa context switch pannunga. Think like a hacker. Attacker Console (Kali) terminal-ku ponga. Namba target IP 192.168.1.45.
*   **Command:** `nmap -sV 192.168.1.45`
*   **Explanation:** 'Enna ports open-ah iruku? Port 80 open-ah? SIEM-la reconnaissance scan detection trigger aagicha-nu dashboard parunga'."

---

## 🕒 Hour 2: The Attack - Exploitation (01:00 - 02:00)

### 01:00 - 01:20 | Introduction to Brute Force (Hydra)
*   **Script:** "Namba victim login portal-la dictionary attack panna porom. Common-ah use panra passwords-ah automate panna Hydra tool use pannuvom."
*   **Explanation:** "Dictionary attack-na simply list of passwords-ah oru script moolama fast-ah try panradhu."

### 01:20 - 01:45 | Task 3: Manual Brute-Force Execution
*   **Script:** "Kali terminal-la indha command type pannunga:
*   **Command:** `hydra -l admin -P passlist.txt 192.168.1.45`
*   **Action:** Students watch the terminal log failure attempts. 
*   **Discussion:** "SIEM dashboard-ku shift panni parunga, logs rapid fire maari kottum! Protocol 'HTTP-POST' and User-Agent 'Hydra' detect aagudha?"

### 01:45 - 02:00 | Alert Level Logic
*   **Script:** "Failed attempts 5 mela pona 'HIGH' alert varum. 15 mela pona 'BREACH'! Red color pulsate aagum dashboard-la. Idhu thaan SIEM-oda threshold logic."

---

## 🕒 Hour 3: Incident Response & Certification (02:00 - 03:00)

### 02:00 - 02:20 | Task 4 & 5: Pattern Identification
*   **Script:** "Ipa namba Analyst role-ku varalam. Dashboard-la rapid failed attempts varra IP edhu? Attacker console-la `ifconfig` panni confirm pannunga. 103.45.21.9 correct-ah?"
*   **Action:** Input identified Attacker IP in Task 4 input field.

### 02:20 - 02:40 | Task 6: Containment (The Kill Switch)
*   **Script:** "Incident Response Team activity start aagudhu! Defense Actions panel-la Attacker IP (103.45.21.9) type panni 'BLOCK' button click pannunga."
*   **Result:** "Check how the Attacker tab instantly stops. Firewall automation working!"

### 02:40 - 02:55 | Hard Tasks: Forensic & Recon Deep Dive
*   **Task 7 (Forensic):** "SIEM Dashboard-la log detail-ah parunga. Attacker enna version tool use panran? Detailed Fingerprint-la explicit-ah version irrukkum. Idhu tool-based fingerprinting!"
*   **Task 8 (Recon):** "Attacker console-ku thirumba ponga. Nmap list panna service version logic-ah read pannunga. Target web server-oda exact version kandu pudichatha thaan real-world exploitation planning start aagum."

### 02:55 - 03:10 | Final Assessment & Wrap-up
*   **Script:** "Assessment tab-ku ponga. Lab concepts + indha deep dive forensic concepts purinjirundha mattum thaan full-ah answer panna mudiyum."
*   **Action:** Students complete the quiz.
*   **Final Words:** "Lab configuration reset panni practice pannunga. Reset button thaan 'Infrastructure Recovery' logic."

---
**Workshop Notes:**
- Total Lab Reset count monitored by SIEM.
- Encourage students to open Attacker and Dashboard side-by-side to see the live impact.
