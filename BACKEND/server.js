import express from 'express';
import cors from 'cors'; // Already imported, good!
import 'dotenv/config';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoute.js';
import taskRouter from './routes/taskRoute.js';

const app = express();
const port = process.env.PORT || 4000;

// MIDDLEWARE
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// FIX: Add CORS middleware here.
// This allows your frontend (http://localhost:5173) to make requests to this backend.
app.use(cors({
    origin: ['http://localhost:5173', "https://taskflow-1-frontend.onrender.com"],// IMPORTANT: Specify the exact origin of your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow common HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow common headers
}));

// db connect
connectDB();

// routes
app.use('/api/user', userRouter);
app.use('/api/tasks', taskRouter);

// Simple root route to check if API is working
app.get('/', (req, res) => {
    res.send('API working');
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
