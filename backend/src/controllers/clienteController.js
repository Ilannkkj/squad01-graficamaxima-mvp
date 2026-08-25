const db = require('../config/db'); 

exports.listarClientes = async (req, res) => {
  try {
    // Busca id, nome, email, telefone e cpf_cnpj dos clientes
    const [clientes] = await db.query(
      "SELECT * FROM cliente ORDER BY nome ASC"
    );
    
    return res.status(200).json(clientes);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return res.status(500).json({ mensagem: "Erro interno ao buscar lista de clientes." });
  }
};