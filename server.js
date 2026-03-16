import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { addEntry, getEntries } from './contact-store.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5173;

const smtpConfig =
  process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
    : null;
const mailTransporter = smtpConfig ? nodemailer.createTransport(smtpConfig) : null;
const notificationRecipient = process.env.EMAIL_TO || process.env.EMAIL_USER;

const sendNotificationEmail = async (entry) => {
  if (!mailTransporter || !notificationRecipient) return;
  const body = [
    `Name: ${entry.name}`,
    `Email: ${entry.email}`,
    `Subject: ${entry.subject}`,
    'Message:',
    entry.message,
  ].join('\n');

  await mailTransporter.sendMail({
    from: `"CV Site" <${process.env.EMAIL_USER}>`,
    to: notificationRecipient,
    subject: `New CV message: ${entry.subject}`,
    text: body,
    html: `<p><strong>Name:</strong> ${entry.name}</p>
      <p><strong>Email:</strong> ${entry.email}</p>
      <p><strong>Subject:</strong> ${entry.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${entry.message.replace(/\n/g, '<br>')}</p>
      <p><em>Sent via CV landing page.</em></p>`,
  });
};

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname)));

app.get('/api/contact', async (req, res) => {
  try {
    const entries = await getEntries();
    res.json(entries.slice(-10).reverse());
  } catch (error) {
    console.error('Error reading contacts:', error);
    res.status(500).json({ message: 'Unable to read submissions.' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }
  const newEntry = {
    name: name.trim(),
    email: email.trim(),
    subject: subject?.trim() || 'General inquiry',
    message: message.trim(),
    timestamp: new Date().toISOString(),
  };

  try {
    await addEntry(newEntry);
    sendNotificationEmail(newEntry).catch((error) => {
      console.error('Email notification failed', error);
    });
    res.status(201).json({ message: 'Submission received.', entry: newEntry });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ message: 'Unable to save your submission.' });
  }
});

app.use((_, res) => {
  res.status(404).send('Endpoint not found.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

if (req.path.startsWith('/api/')) {
  return res.status(404).json({ message: 'Endpoint not found.' });
}
return res.sendFile(path.join(__dirname, 'index.html'));
