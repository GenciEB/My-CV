# Genc Balisha CV Site

Static landing page with both a local Node/Express server and a Vercel serverless API. Contact submissions are logged to `data/contacts.json` locally and kept in memory on Vercel, with optional SMTP email delivery.

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

### Environment variables

| Variable | Description |
| --- | --- |
| `EMAIL_HOST` | SMTP host (e.g., `smtp.gmail.com`). |
| `EMAIL_PORT` | Port number (587 for TLS). |
| `EMAIL_SECURE` | `true` for SSL (465), `false` for STARTTLS (587). |
| `EMAIL_USER` | Sender address (must match the account for `EMAIL_PASS`). |
| `EMAIL_PASS` | App password or SMTP credential for `EMAIL_USER`. |
| `EMAIL_TO` | Recipient (defaults to `EMAIL_USER`). |

Set the vars before running the server or deploying to Vercel:

```
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false   # true for 465
EMAIL_USER=you@example.com
EMAIL_PASS=<app-password>
EMAIL_TO=notify@example.com
```

Any free SMTP provider works (Gmail app passwords, Outlook, etc.). The backend only sends emails when these vars exist; otherwise submissions are just logged locally (or in-memory on Vercel).
