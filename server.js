import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const tinyApi = axios.create({
  baseURL: 'https://api.tiny.com.br/api2',
});

app.get('/api/products', async (req, res) => {
  try {
    const { token } = req.query;
    const response = await tinyApi.get('/produtos.pesquisa.php', {
      params: {
        token,
        formato: 'json',
        pesquisa: '',
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});