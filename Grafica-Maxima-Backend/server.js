const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express(); // 🚨 REPARADO: Criado primeiro de tudo para poder usar embaixo!

// Puxa a porta do .env, caso ela nn funcione ele usa a 3301 (conforme seu log antigo)
const port = process.env.PORT || 3301;

// ==========================================
// 1. MIDDLEWARES (Precisam vir antes das rotas!)
// ==========================================
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());

// ==========================================
// 2. IMPORTANDO AS ROTAS
// ==========================================
const orcamentoRoutes = require('./src/routes/orcamentosRoutes');
const configuracoesRoutes = require('./src/routes/configuracoesRoutes'); 
const clienteRoutes = require('./src/routes/clienteRoutes');
// const authRotas = require('./src/routes/authRoutes');

const calculoRoutes = require('./src/routes/CalculoRoutes'); 

// ==========================================
// 3. VINCULANDO AS ROTAS NO EXPRESS
// ==========================================
app.use('/api/orcamentos', orcamentoRoutes);
app.use('/api/calculo', calculoRoutes); 
app.use(configuracoesRoutes);
app.use('/api/clientes', clienteRoutes);
// app.use('/api/auth', authRotas);

// Rota de teste padrão
app.get('/', (req, res) => {
    res.send('Servidor da Gráfica Máxima rodando com sucesso.');
});

app.listen(port, () => {
    console.log(`Servidor funcionando na porta ${port}`);
});