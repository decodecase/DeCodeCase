# TECHNICAL ANALYSIS REPORT

**Subject:** Analysis of System Activity Logs – HERA Radio Broadcast Studio B
**Date of Incident:** 12 March 2025
**Report Compiled:** 14 March 2025
**Prepared By:** Eng. Cem Gürsoy, Digital Forensics Unit – Istanbul Cybercrime Division
**Case Reference No:** HERA-DA-0301-25-TAR

## I. INTRODUCTION
This report documents and interprets the technical activity recorded by the primary broadcast workstation located in Studio B of HERA Radio on 12 March 2025, between 19:15 and 19:57. The data analyzed originates from the internal system log file retrieved post-incident and securely extracted by forensic imaging from the local hard drive.

The investigation aims to determine whether unauthorized or malicious digital activity occurred during or prior to the suspected time of death of Onur Aydın.

## II. METHOD OF ACQUISITION
*   System unit (ID: STDB-HR-07B) was seized by forensic personnel on 13.03.2025 at 08:52.
*   Hard disk imaged using FTK Imager v7.2 (write-blocked)
*   Log file `cihaz_log_12mart.txt` recovered from `/System/Logs/internal/`
*   SHA256 hash: `f47c8ae9b563bcb77d10d8164a5e5f6de79fa7a1a0f3d9aa0ce6b9237a9e3f29` (verified)

## III. TIMELINE OF EVENTS (EXTRACTED LOG ENTRIES)
*(Note: Specific log entries would be detailed here in a full report; for the narrative, assume key events are summarized below)*

## IV. TECHNICAL INTERPRETATION
*   **Concurrent Session Conflict (19:47):** The log shows that an attempt was made to establish a second remote connection under the user "frekans11" — possibly using a spoofed identity or unauthorized access key. The system blocked this attempt due to Beril Yaman's existing active session.
*   **USB Activity Chain (19:50–19:52):**
    *   An external USB audio interface previously registered in the system (ext-usb-07x3n9) was remotely reactivated.
    *   Less than 2 minutes later, an unrecognized USB device (ID: XLR-SH1F-PVT) was detected, triggering an immediate system reaction (audio interface response + voltage spike).
*   **Voltage Surge (19:53:03):**
    *   The spike recorded on INPUT_CHANNEL_03 is consistent with a targeted electrical overload, possibly used to disable or manipulate sound equipment.
    *   No hardware burnout detected, but a temporary overload could have interfered with nearby equipment or even induced a health risk (as supported by autopsy report).
*   **System Shutdown (19:57:16):**
    *   The system did not shut down through normal procedures; crash was triggered internally, possibly as a failsafe after overload.

## V. CONCLUSIONS
1.  Beril Yaman's remote login was real and successful, granting her full access to the system prior to the incident.
2.  A second actor attempted unauthorized access but was blocked — identity unknown, but the alias "frekans11" was used.
3.  The log confirms active tampering with audio hardware via USB ports, likely without physical presence.
4.  The voltage spike was not system-generated and matches patterns observed in previous cases of intentional overload through modified audio channels.
5.  A forensic hardware inspection is recommended for all USB ports and power supplies associated with INPUT_CHANNEL_03.

## VI. RECOMMENDATION
*   Further investigation of remote login history, DNS and MAC tracing from IP `37.221.61.92`
*   Interview all personnel with access to the broadcast USB gear
*   Deep forensic recovery of `last_mix.wav` (referenced but unaired audio file)
*   Full spectrum EMI test for potential sabotage instrumentation 