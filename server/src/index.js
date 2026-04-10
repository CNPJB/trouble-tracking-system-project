import express from 'express';
import cors from 'cors';
import ticketRoutes from '../routes/ticketRoutes.js';  
import managementRoutes from '../routes/managementRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// api add
app.use('/api/tickets', ticketRoutes);
app.use('/api/manage', managementRoutes);


// api get
app.get('/api/gettickets', ticketRoutes);
app.get('/', (req, res) => {
  res.send('Hello from server testest!!');
});

// api update
app.use('/api/updateTicket',ticketRoutes)


app.post('/api/users', async (req, res) => {
  try {
    const { email, fullName, role } = req.body;
    const newUser = await prisma.user.create({
      data: { email, fullName, role },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { userId: Number(id) }, // แปลง id จาก URL เป็นตัวเลข
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, fullName, role } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { userId: Number(id) },
      data: { email, fullName, role },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { userId: Number(id) },
    });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});