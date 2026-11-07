import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import routinesRouter from './routes/routines.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/routines', routinesRouter);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
});

export default app;
