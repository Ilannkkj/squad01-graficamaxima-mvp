// src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configurações básicas padrão do XAMPP
const dbConfigBase = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'graficamaxima',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// 🚀 FUNÇÃO DE CONEXÃO MULTI-PORTA COMPATÍVEL COM QUALQUER PC
async function inicializarBanco() {
  const portaPadrao = parseInt(process.env.DB_PORT) || 3306;
  const portaAlternativa = 3312; // Caso o XAMPP do professor mude por conflito

  try {
    // 1️⃣ Tentativa na porta padrão (3306)
    pool = mysql.createPool({ ...dbConfigBase, port: portaPadrao });
    const conn = await pool.getConnection();
    console.log(`Conexão com o Banco na porta: ${portaPadrao}!`);
    conn.release();
  } catch (error) {
    // Se o erro for de conexão/porta, tenta a alternativa automatizada
    if (error.code === 'ECONNREFUSED' && !process.env.DB_PORT) {
      console.warn(`Porta ${portaPadrao} fechada. Tentando porta alternativa do banco (${portaAlternativa})...`);
      
      try {
        // 2️⃣ Tentativa na porta secundária do XAMPP (3312)
        pool = mysql.createPool({ ...dbConfigBase, port: portaAlternativa });
        const connAlt = await pool.getConnection();
        console.log(`Conexão porta alternativa: ${portaAlternativa}!`);
        connAlt.release();
      } catch (errAlt) {
        console.error(`Erro: O XAMPP parece fechado nas portas ${portaPadrao} e ${portaAlternativa}.`);
        console.error(`Detalhe do erro: ${errAlt.message}`);
      }
    } else {
      console.error("🔴 Erro de configuração no MySQL:", error.message);
    }
  }
}

// Executa a estratégia de descoberta de porta assim que o Node inicia
inicializarBanco();

// Proxy para garantir que os controllers consigam usar o pool mesmo ele sendo criado assincronamente
module.exports = {
  query: async (sql, params) => {
    if (!pool) {
      // Pequena espera de segurança caso o banco demore milissegundos a mais para testar as portas
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return pool.query(sql, params);
  },
  getConnection: async () => {
    if (!pool) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return pool.getConnection();
  }
};