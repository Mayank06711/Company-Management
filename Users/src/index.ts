import express, { Request, Response } from 'express';

const app = express();

app.get('/', (req: Request, res: Response) :  void  => {
    res.status(201).send('Hello Now my application is working!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});