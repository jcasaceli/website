# Website — Netlify + Chat Integration

This folder contains a single-page HTML site and helper files to deploy on Netlify with weekly automatic builds and an optional SMS-forwarding function.

Quick setup checklist:

1. Create a GitHub repo and push this `website` folder (root contains `addiction-rehab-center.html`).

2. Connect the GitHub repo to Netlify (Site > Import from Git) and deploy the `main` branch.

3. Create a Netlify Build Hook (Site settings > Build & deploy > Build hooks) and save the URL as the GitHub secret `NETLIFY_BUILD_HOOK`.

4. Tawk.to chat widget (recommended):
   - Create a free account at https://dashboard.tawk.to/ and add a property.
   - In the widget admin, copy the embed script or the property ID.
   - Replace `YOUR_PROPERTY_ID` in `addiction-rehab-center.html` with the Tawk.to property ID.
   - Install the Tawk.to mobile app to receive messages on your phone.
   - Configure pre-chat prompts and quick reply buttons in Tawk.to:
     * "Are you seeking help for yourself or a loved one?"
     * "What type of treatment do you need today?"
     * "Would you like a confidential callback or text message?"

5. (Optional) SMS forwarding via Twilio + Netlify Function:
   - Purchase a Twilio phone number and get `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.
   - In Netlify dashboard set environment variables: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `TO_NUMBER`.
   - Configure Tawk.to Admin > Webhooks to POST new messages to `https://<your-site>.netlify.app/.netlify/functions/send-sms`.

6. Update SEO placeholders:
   - Replace `https://nyshipdetox.com/` and image paths in the HTML head with your real asset URLs.
   - Verify the site in Google Search Console and submit the `sitemap.xml`.
   - The site now includes a weekly Bing sitemap ping workflow to help search engines discover new content automatically.

Files added:
- `.github/workflows/bing-sitemap-ping.yml` — scheduled workflow to ping Bing with your sitemap.
- `.github/workflows/netlify-weekly-deploy.yml` — scheduled workflow to POST the Netlify build hook weekly.
- `netlify/functions/send-sms.js` — example serverless function to forward webhook messages as SMS via Twilio.
- `package.json` — declares `twilio` dependency for Netlify functions.
- `sitemap.xml` and `robots.txt` — basic SEO files.

If you want, I can now:
- Replace placeholders directly in `addiction-rehab-center.html` with your real domain and OG images.
- Initialize a local git repo and create a GitHub repo and push for you (I can prepare commands to run locally).
- Configure the Netlify function to parse Tawk.to's precise webhook shape (I need a sample payload).

Which step should I do next? (I can prepare the git commands to run on your machine.)
