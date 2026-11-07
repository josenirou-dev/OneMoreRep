import 'dotenv/config';
import mongoose from 'mongoose';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import app from './app.js';

const port = Number(process.env.PORT ?? 3000);
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('Falta MONGODB_URI. Configura las variables de backend/.env.');
}

initializeApp({ credential: applicationDefault() });

try {
  await mongoose.connect(mongoUri);
  app.listen(port, '0.0.0.0', () => {
    console.log(`API lista en http://localhost:${port}`);
  });
} catch (error) {
  console.error('No se pudo iniciar el backend:', error);
  process.exitCode = 1;
}
