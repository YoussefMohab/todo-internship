import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors'; // Import CORS middleware

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const JWT_SECRET = process.env.SECRET_KEY;

if (!JWT_SECRET) {
  throw new Error('JWT secret key is not defined in environment variables.');
}

// Enable CORS middleware
app.use(cors());

interface AuthRequest extends Request {
  user?: { userId: string };
}

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      }
      req.user = user as { userId: string };
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Error handling middleware
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', err);
  res.status(500).json({ error: 'Internal server error' });
};

app.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashedPassword } });
    res.json(user);
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

app.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;    
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

app.get('/todos', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const todos = await prisma.todo.findMany({ where: { userId: req.user?.userId } });
    res.json(todos);
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

app.post('/todos', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title } = req.body;
    const todo = await prisma.todo.create({ data: { title, userId: req.user!.userId } });
    res.json(todo);
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

app.put('/todos/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    const todo = await prisma.todo.update({
      where: { id },
      data: { title, completed },
    });
    res.json(todo);
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

app.delete('/todos/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.todo.delete({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

// Error handler middleware must be the last middleware added
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
