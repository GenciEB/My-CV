import nodemailer from 'nodemailer';
import { addEntry, getEntries } from '../contact-store.js';

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

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const entries = await getEntries();
      return res.status(200).json(entries.slice(-10).reverse());
    } catch (error) {
      console.error('Error reading contacts (Vercel):', error);
      return res.status(500).json({ message: 'Unable to read submissions.' });
    }
  }

  if (req.method === 'POST') {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const newEntry = {
      name: String(name).trim(),
      email: String(email).trim(),
      subject: subject ? String(subject).trim() : 'General inquiry',
      message: String(message).trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      await addEntry(newEntry);
      sendNotificationEmail(newEntry).catch((error) => {
        console.error('Email notification failed (Vercel):', error);
      });
      return res.status(201).json({ message: 'Submission received.', entry: newEntry });
    } catch (error) {
      console.error('Error saving contact (Vercel):', error);
      return res.status(500).json({ message: 'Unable to save your submission.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: 'Method not allowed.' });
}

import nodemailer from 'nodemailer';
import { addEntry, getEntries } from '../lib/contact-store.js';

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

const handleNotification = async (entry) => {
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

const parseBody = async (req) => {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const entries = await getEntries();
      return res.status(200).json(entries.slice(-10).reverse());
    } catch (error) {
      console.error('GET /api/contact failed', error);
      return res.status(500).json({ message: 'Unable to read submissions.' });
    }
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await parseBody(req);
    } catch (error) {
      console.error('Failed to parse body', error);
      return res.status(400).json({ message: 'Unable to parse request body.' });
    }
    const { name, email, subject, message } = body || {};
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
      await handleNotification(newEntry);
      return res.status(201).json({ message: 'Submission received.', entry: newEntry });
    } catch (error) {
      console.error('POST /api/contact failed', error);
      return res.status(500).json({ message: 'Unable to save submission.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
};

export default handler;
