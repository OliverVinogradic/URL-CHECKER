# URL Security Checker (Google Safe Browsing API Integration)

A secure web application that detects malicious URLs in real-time. This project uses a Node.js web interface that securely runs a compiled C++ binary to communicate with the Google Safe Browsing API.

---

## How to Get a Google Safe Browsing API Key

1. Go to the Google Cloud Console (console.cloud.google.com).
2. Create a new project or select an existing one.
3. Navigate to the "API Library" via the left-side menu.
4. Search for "Safe Browsing API" and click "Enable".
5. Navigate to "APIs & Services" > "Credentials".
6. Click "Create Credentials" and select "API key".
7. Copy the generated key.
8. (Recommended) Click "Restrict key", and under "API restrictions", select "Safe Browsing API" to ensure the key cannot be used for other services.

---

## Installation and Setup

### 1. Install Prerequisites (Ubuntu/Linux)
Install the C++ compiler, cURL development libraries, and Node.js:
```bash
sudo apt update
sudo apt install g++ libcurl4-openssl-dev nodejs npm -y
