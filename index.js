const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(bodyParser.json());

const { Pool } = require('pg')
    
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});

pool.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao MySQL!');
});

// Rota para obter todos os dados (READ)
app.get('/api/dados', (req, res) => {
    pool.query('SELECT * FROM dados', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Rota para inserir novo dado (CREATE)
app.post('/api/dados', (req, res) => {
    const novoDado = req.body;
    pool.query('INSERT INTO dados SET ?', novoDado, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ id: result.insertId, ...novoDado });
    });
});

// Rota para atualizar dado existente (UPDATE)
app.put('/api/dados/:id', (req, res) => {
    const id = req.params.id;
    const dadoAtualizado = req.body;
    pool.query('UPDATE dados SET ? WHERE id = ?', [dadoAtualizado, id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Dado não encontrado' });
        }
        res.send({ id, ...dadoAtualizado });
    });
});

// Rota para deletar dado existente (DELETE)
app.delete('/api/dados/:id', (req, res) => {
    const id = req.params.id;
    pool.query('DELETE FROM dados WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Dado não encontrado' });
        }
        res.send({ message: 'Dado deletado com sucesso' });
    });
});

const port = proces.env.PORT || 3001;

app.listen(port, () => {
    console.log('API rodando na porta', port);
});
