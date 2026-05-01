# EV CYBER ACADEMY: Lab Solutions & Walkthrough

## Task 1: Baseline Establishment
- **Target:** Login to the Victim Portal.
- **Solution:** Navigate to `Victim System` tab. Enter `admin` / `password123`.

## Task 2: Network Recon (Nmap)
- **Target:** Scan the target system.
- **Solution:** In `Attacker Console`, type `nmap -sV 192.168.1.45`.

## Task 3: Manual Brute-Force (Hydra)
- **Target:** Initiate a brute-force attack.
- **Solution:** In `Attacker Console`, type `hydra -l admin -P passlist.txt 192.168.1.45`.

## Task 4: Source Attribution
- **Target:** Identify the Attacker's IP.
- **Solution:** Check `SOC Dashboard` logs. Look for the IP making multiple failed login attempts.
- **Answer:** `103.45.21.9`

## Task 5: Alert Level Logic
- **Target:** Trigger a 'CRITICAL_BREACH' alert.
- **Solution:** Keep the Hydra scan running until the "Alert Level" top bar turns RED and shows "BREACH" (occurs after 15 failed attempts).

## Task 6: Incident Containment
- **Target:** Block the offending IP.
- **Solution:** In `SOC Dashboard`, scroll to "Defense Actions". Enter `103.45.21.9` and click "Block IP".

## Task 7: Advanced Forensic Fingerprinting (Hard)
- **Target:** Extract the exact User-Agent from logs.
- **Solution:** Look at the `Detailed Fingerprint` column in the SOC Dashboard for a `LOGIN_FAILURE` log.
- **Answer:** `Hydra/v9.5 (Kali Linux ARM64)`

## Task 8: Reconnaissance Signature Analysis (Hard)
- **Target:** Identify the exact Apache version from scan logs.
- **Solution:** Look at the `Attacker Console` (Terminal) output after running the `nmap -sV` command. Locate the line: `80/tcp open http Apache 2.4.41`.
- **Answer:** `Apache 2.4.41`
