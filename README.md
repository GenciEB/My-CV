# Genc Balisha CV Site

Static landing page with a Node/Express backend that stores contact submissions in `data/contacts.json` and can optionally email new submissions.

## Setup

```
npm install
npm run dev    # use nodemon during development
npm start      # run production
```

The backend serves the static files from the project root and exposes:

- `GET /api/contact` — returns the last 10 submissions
- `POST /api/contact` — accepts `{ name, email, subject?, message }`, validates required fields, and appends entries to `data/contacts.json`

Submissions are stored with timestamps for easy review. Update CORS or logging as needed.
Access `/admin` in the browser to view the most recent 10 submissions in a simple dashboard.

### Email notifications (optional, free SMTP)

Set the following environment variables before running the server:

```
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false   # true for 465
EMAIL_USER=you@example.com
EMAIL_PASS=your-password
EMAIL_TO=notify@example.com  # defaults to EMAIL_USER if missing
```

Any free SMTP provider works (Gmail with an app password, Outlook, etc.), and the backend only sends notices when these vars are configured—otherwise it silently skips emailing.
