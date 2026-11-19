# Contact form setup (Formspree, about 3 minutes, free)

The form sends through Formspree, so no server and no secret key is needed.
The form ID is public by design. Never paste a Formspree *secret* or API key into the site.

1. Go to https://formspree.io and sign up with the email address that should RECEIVE messages.
2. Click **New Form**, name it "IDP Group 9 Contact", and set the recipient email.
3. Copy the form address, which looks like `https://formspree.io/f/xyzabcde`.
4. In `index.html`, find `<form id="contactForm" action="https://formspree.io/f/YOUR_FORM_ID"`
   and replace `YOUR_FORM_ID` with your ID (`xyzabcde`). That is the only change needed.
5. Host the site (Netlify, GitHub Pages, etc.). Open the live site and send one test message.
   Formspree emails you a one-time confirmation on the first submission; confirm it.
6. In the Formspree dashboard, Settings, add your live domain under allowed domains (optional, stops other sites using your form).

Also change `EMAIL` at the top of `script.js` to your real address (shown in error messages).

Notes
- Until step 4 is done, the form shows "not set up yet" instead of a fake success.
- Free plan: about 50 submissions a month. Spam protection: hidden honeypot field plus Formspree's filtering.
- Messages are only reported as delivered when Formspree confirms receipt.
