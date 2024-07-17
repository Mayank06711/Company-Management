import dotenv from 'dotenv';
import express, { Request, Response } from 'express';

dotenv.config()
const app = express();

// Middleware
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(201).send('Hello Now my application is working!');
});

app.listen(process.env.PORT, ()  => {
  console.log(`Server is running on port ${process.env.PORT}`);
});