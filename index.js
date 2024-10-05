const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pg = require('pg');
const { Pool } = pg;


const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,  // Verifique o nome correto
});

pool.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao PostgreSQL!');
});

// Rota para obter todos os dados (READ)
app.get('/api/dados', (req, res) => {
  pool.query('SELECT * FROM dados', (err, results) => {
    if (err) throw err;
    res.json(results.rows);
  });
});

// Rota para inserir novo dado (CREATE)
app.post('/api/dados', (req, res) => {
  const { campo1, campo2 } = req.body;
  pool.query('INSERT INTO dados (campo1, campo2) VALUES ($1, $2) RETURNING *', [campo1, campo2], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(201).send(result.rows[0]);
  });
});

// Rota para atualizar dado existente (UPDATE)
app.put('/api/dados/:id', (req, res) => {
  const id = req.params.id;
  const { campo1, campo2 } = req.body;
  pool.query('UPDATE dados SET campo1 = $1, campo2 = $2 WHERE id = $3 RETURNING *', [campo1, campo2, id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Dado não encontrado' });
    }
    res.send(result.rows[0]);
  });
});

// Rota para deletar dado existente (DELETE)
app.delete('/api/dados/:id', (req, res) => {
  const id = req.params.id;
  pool.query('DELETE FROM dados WHERE id = $1 RETURNING *', [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Dado não encontrado' });
    }
    res.send({ message: 'Dado deletado com sucesso' });
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`API rodando na porta ${process.env.PORT || 5000}`);
});
