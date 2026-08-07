# knuspii.net [![Deploy static content to Pages](https://github.com/Knuspii/knuspii.net/actions/workflows/static.yml/badge.svg)](https://github.com/Knuspii/knuspii.net/actions/workflows/static.yml)
My Status Page

## 🔒 Privacy Notice (Datenschutzerklärung)

Since this project is operated from Germany, this notice complies with the European General Data Protection Regulation (**GDPR** / **DSGVO**).

### 1. No Direct Personal Data Collection
This website is a **client-side application** designed with privacy in mind.
* **No Database / No Analytics:** We do not track, profile, or collect any of your personal data on this website.

### 2. Third-Party Services & Technical Data Processing
When you visit this website, data is processed by the following third-party infrastructure components:

* **Hosting (GitHub Pages):** This website is hosted by GitHub, Inc. (88 Colin P. Kelly Jr. St, San Francisco, CA 94107, USA). To serve the website securely, GitHub automatically collects standard server log files (including your IP address, browser type, date, and time of access). For more information, please check the [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement).
* **Status File Storage (Supabase):** The status data displayed on this site is stored on and fetched directly from Supabase, Inc. (970 Toa Payoh North, Singapore / USA). When your browser fetches the `status.json` file, Supabase processes your IP address and connection metadata to serve the file over HTTPS. Read the [Supabase Privacy Policy](https://supabase.com/privacy) for details.
* **Backend Automation (n8n & BetterStack):** The status data is automatically fetched from the BetterStack API and pushed to Supabase via an isolated **n8n** workflow on the server side. This background process runs entirely decoupled from website visitors; no visitor data or IP addresses are sent to BetterStack or processed by n8n.

### 3. Your Rights
Under the GDPR, you have the right to request access to, rectification of, or deletion of any logs held by the hosting and storage providers (GitHub, Supabase), as well as the right to object to processing. Since we do not log or store any user data ourselves, we cannot directly view or modify your data.
