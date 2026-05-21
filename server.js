const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

const candidatesRouter = require('./routes/candidates');

app.use('/api', candidatesRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n✓ Server running on port ${PORT}`);
  console.log(`✓ Test it: curl http://localhost:${PORT}/health`);
  console.log(`✓ If using ngrok, expose it: ngrok http ${PORT}\n`);
});
