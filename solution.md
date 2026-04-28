# EV CYBER LABS - SOC Simulation v1.2 Solution Guide

This document contains the step-by-step solutions for the tasks in the SOC Simulation lab. It is intended for instructors and students who need guidance.

---

### Task 1: Normal Login Attempt
**Target:** baseline system activity.
**Action:** 
1. Open the **Victim System** (main dashboard or new tab).
2. Enter the credentials:
   - **Username:** `admin`
   - **Password:** `password123`
3. Click "Authenticate".
4. Result: "Login Successful" alert appears.

---

### Task 2: SIEM Log Observation
**Target:** verify logging mechanisms.
**Analysis:**
1. Navigate to the **SOC Dashboard**.
2. Look at the top log entries.
3. Locate the entry with:
   - **Action:** `LOGIN_SUCCESS`
   - **IP Source:** `45.122.1.22`
4. **Answer to submit:** `45.122.1.22`

---

### Task 3: Manual Brute-Force (Hydra)
**Target:** simulate an external threat via command line.
**Action:**
1. Open the **Attacker Console** (main dashboard or new tab).
2. Terminal input field-la indha command type pannu:
   `hydra -l admin -P passlist.txt 192.168.1.45`
3. Enter key press pannu.
4. Logic: Attack start aagy constant-ah constant failures `192.168.1.45`-ku poga aarambikum.

---

### Task 4: Identify Attacker IP
**Target:** identify the source of the attack.
**Analysis:**
1. **SOC Dashboard**-ku poga.
2. Continuous-ah varra `LOGIN_FAILURE` logs-ah monitor pannu.
3. Attacker-oda IP 103.45.21.9 check pannu.
4. **Answer to submit (Attacker IP):** `103.45.21.9`

---

### Task 5: Security Alert Trigger
**Target:** monitor system health.
**Action:**
1. Keep the attack running.
2. Monitor the **"Threat Status"** in the header.
3. Once the failed attempts cross the threshold (15 attempts), the status will change to **BREACH**.
4. **Answer to submit:** `BREACH`

---

### Task 6: Block and Verify
**Target:** threat containment (Incident Response).
**Action:**
1. In the **SOC Dashboard**, go to the **Defense Actions** panel.
2. Input the IP: `103.45.21.9`.
3. Click the **Block** button.
4. **Verification:**
   - Observe that the `LOGIN_FAILURE` logs stop appearing in the SIEM.
   - Switch to the **Attacker Console** tab and observe the `CONNECTION_TERMINATED` message.
   - The status in the header will reset/stabilize.

---

### Final Outcome
Once all tasks are verified, the **SOC Certified** award will be unlocked, indicating successful completion of the basic Incident Response lifecycle: Detection -> Analysis -> Containment -> Recovery.
