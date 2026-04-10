import express from 'express';
import cors from 'cors';
import cookiesParser from 'cookie-parser';
import authRoutes from '../routes/authRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL, // Allow requests from this origin
  credentials: true // Allow cookies to be sent with requests
}));
app.use(express.json());
app.use(cookiesParser()); // Parse cookies
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello from server testest!!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});