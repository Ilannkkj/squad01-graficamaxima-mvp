// Chama o arquivo de configuração do pacote de gerenciamento SQL (mysql2)
const db = require('../config/db');
const { renderOrcamentoPdf } = require('../services/orcamentoPdf.service');

// 🚀 1. Arrow Function de criar orçamento
const criarOrcamento = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const {
            id_usuario, 
            valor_total, 
            prazo_entrega, 
            observacoes,
            status,
            cliente,      
            item,         
            acabamentos   
        } = req.body; 

        // 🛡️ BLINDAGEM AUTOMÁTICA DAS CHAVES ESTRANGEIRAS (Papel e Impressão)
        // Se o banco foi resetado e não tiver o id 1, isso injeta na hora para não dar erro 500
        const [papeis] = await connection.query("SELECT id_papel FROM papel WHERE id_papel = 1");
        if (papeis.length === 0) {
            await connection.query(`
                INSERT INTO papel (id_papel, nome, tipo, largura_folha, altura_folha, custo_por_folha) 
                VALUES (1, 'Couchê Brilho', 'Papel', 21.0, 29.7, 0.50)
            `);
        }

        const [impressoes] = await connection.query("SELECT id_impressao FROM impressao WHERE id_impressao = 1");
        if (impressoes.length === 0) {
            await connection.query(`
                INSERT INTO impressao (id_impressao, tipo, custo_por_folha) 
                VALUES (1, 'Offset Colorido', 0.80)
            `);
        }

        // ==========================================
        // 🛠️ PASSO 1: Inserir o Cliente Completo
        // ==========================================
        const sqlCliente = `
            INSERT INTO cliente (nome, cpf_cnpj, telefone, email, endereco) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [resultCliente] = await connection.query(sqlCliente, [
            cliente?.nome || "Cliente Sem Nome",
            cliente?.cpf_cnpj || null,
            cliente?.telefone || null,
            cliente?.email || null,
            cliente?.endereco || null
        ]);
        const idClienteGerado = resultCliente.insertId;

        // ==========================================
        // 🛠️ PASSO 2: Inserir o Orçamento Principal
        // ==========================================
        const sqlOrcamento = `
            INSERT INTO orcamento 
            (id_usuario, id_cliente, valor_total, valor_unitario, status, prazo_entrega, observacoes) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const dataEntrega = prazo_entrega ? prazo_entrega : null;
        const vUnitarioCalculado = item?.valor_unitario || 0.0000;

        const [resultOrcamento] = await connection.query(sqlOrcamento, [
            id_usuario || 1, 
            idClienteGerado,
            parseFloat(valor_total) || 0.0000, 
            parseFloat(vUnitarioCalculado), 
            status || "Aberto", 
            dataEntrega, 
            observacoes || ""
        ]);
        const idOrcamentoGerado = resultOrcamento.insertId;

        // ==========================================
        // 🛠️ PASSO 3: Inserir o Item Relacional
        // ==========================================
        const sqlItem = `
            INSERT INTO item 
            (id_orcamento, id_papel, id_impressao, tipo_produto, quantidade, largura, altura, valor_unitario, valor_total) 
            VALUES (?, 1, 1, ?, ?, ?, ?, ?, ?)
        `;

        const [resultItem] = await connection.query(sqlItem, [
            idOrcamentoGerado,
            item?.tipo_produto || "Impressão Gráfica",
            parseInt(item?.quantidade) || 1,
            parseFloat(item?.largura) || 0.00,
            parseFloat(item?.altura) || 0.00,
            parseFloat(vUnitarioCalculado),
            parseFloat(valor_total) || 0.0000
        ]);
        const idItemGerado = resultItem.insertId;

        // ==========================================
        // 🛠️ PASSO 4: Vincular Acabamentos na Tabela 'acabamento_item'
        // ==========================================
        if (acabamentos && Array.isArray(acabamentos) && acabamentos.length > 0) {
            const sqlAcabamentoItem = `
                INSERT INTO acabamento_item (id_acabamento, id_item, quantidade, custo_aplicado) 
                VALUES (?, ?, ?, ?)
            `;

            for (const acab of acabamentos) {
                if (parseInt(acab.quantidade) > 0) {
                    // Evita crash de constraint caso o ID do Acabamento mude na Etapa 3
                    const [existeAcab] = await connection.query("SELECT id_acabamento FROM acabamento WHERE id_acabamento = ?", [acab.id_acabamento]);
                    
                    if (existeAcab.length > 0) {
                        await connection.query(sqlAcabamentoItem, [
                            parseInt(acab.id_acabamento),
                            idItemGerado,
                            parseInt(acab.quantidade),
                            parseFloat(acab.custo_aplicado) || 0.0000
                        ]);
                    }
                }
            }
        }

        await connection.commit();

        return res.status(201).json({ 
            message: "Gravado com sucesso de forma relacional!", 
            id: idOrcamentoGerado,
            id_orcamento: idOrcamentoGerado
        });

    } catch (error) {
        await connection.rollback();
        console.error("====== ERRO INTERNO DETECTADO NO MYSQL ======");
        console.error(error.message);
        console.error("==============================================");
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// Arrow Function listar orçamentos

const listarOrcamentos = async (req, res) => {
    try {
        // 🛠️ MUDANÇA AQUI: Trocamos 'c.id' por 'c.id_cliente' na linha do ON
        const sql = `
    SELECT 
        o.*, 
        c.nome AS nome_cliente 
    FROM orcamento o
    LEFT JOIN cliente c ON o.id_cliente = c.id_cliente
    ORDER BY o.id_orcamento DESC
`;
        
        const [rows] = await db.query(sql);
        return res.status(200).json(rows);

    } catch (error) {
        console.error("Erro crítico ao buscar no banco:", error.message);
        
        // Se o JOIN falhar por qualquer outro motivo, roda a de contingência pro front não sumir
        try {
            const [rowsSimples] = await db.query('SELECT * FROM orcamento ORDER BY id_orcamento DESC');
            return res.status(200).json(rowsSimples);
        } catch (erroFatal) {
            return res.status(500).json({ error: "Erro interno no servidor." });
        }
    }
};

// Arrow Function editar orçamento (COMPLETADA)
const editarOrcamento = async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL (ex: /api/orcamentos/:id)
        const { 
            id_usuario, 
            id_cliente, 
            valor_total, 
            valor_unitario, 
            status, 
            prazo_entrega, 
            observacoes 
        } = req.body;

        const sql = `
            UPDATE orcamento 
            SET id_usuario = ?, id_cliente = ?, valor_total = ?, valor_unitario = ?, status = ?, prazo_entrega = ?, observacoes = ? 
            WHERE id_orcamento = ?
        `;

        const [resultado] = await db.query(sql, [id_usuario, id_cliente, valor_total, valor_unitario, status, prazo_entrega, observacoes, id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Orçamento não encontrado para atualizar." });
        }

        res.status(200).json({ message: "Orçamento atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao editar no banco:", error);
        res.status(500).json({ error: "Erro interno ao editar orçamento." });
    }
};

// 🚀 4. Função Completa Deletar Orçamento (AJUSTADA)
const deletarOrcamento = async (req, res) => {
  try {
    const { id } = req.params; 

    // Ajustei o nome da tabela de 'orcamentos' para 'orcamento' e a coluna para 'id_orcamento' para bater com o seu padrão
    const sql = 'DELETE FROM orcamento WHERE id_orcamento = ?';
    const [resultado] = await db.query(sql, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Orçamento não encontrado no banco." });
    }

    console.log(`🗑️ Orçamento #${id} deletado do Banco de Dados.`);
    return res.status(200).json({ message: "Orçamento deletado com sucesso!" });

  } catch (error) {
    console.error("Erro ao deletar no banco:", error);
    return res.status(500).json({ error: "Erro interno ao deletar orçamento." });
  }
};

const obterStatusOrcamento = async (req, res) => {
    const { id } = req.params;
    try {
        // 🚀 O INNER JOIN junta a tabela orcamento com a tabela cliente usando o id_cliente!
        const query = `
            SELECT 
                o.id_orcamento AS id, 
                c.nome AS nomeCliente, 
                o.valor_total AS valor, 
                o.status 
            FROM orcamento o
            INNER JOIN cliente c ON o.id_cliente = c.id_cliente
            WHERE o.id_orcamento = ?
        `;
        
        const [rows] = await db.query(query, [id]);

        if (rows.length > 0) {
            res.json(rows[0]); // Entrega o objeto perfeito para o React do seu amigo
        } else {
            res.status(404).json({ error: "Orçamento não encontrado no banco." });
        }
    } catch (error) {
        console.error("====== ERRO NO JOIN DO BANCO ======");
        console.error(error.message);
        console.error("===================================");
        res.status(500).json({ error: error.message });
    }
};

// 💾 Garantir que a atualização do status também use a chave primária certa

const atualizarStatusOrcamento = async (req, res) => {
        const { id } = req.params;
    const { status } = req.body;
    try {
        const query = 'UPDATE orcamento SET status = ? WHERE id_orcamento = ?';
        await db.query(query, [status, id]);
        res.json({ message: "Status atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro no atualizarStatusOrcamento:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const gerarPdfOrcamento = async (req, res) => {
    const { id } = req.params;

    try {
        const queryOrcamento = `
            SELECT
                o.*,
                c.nome AS nome_cliente,
                c.cpf_cnpj,
                c.telefone,
                c.email,
                c.endereco
            FROM orcamento o
            LEFT JOIN cliente c ON o.id_cliente = c.id_cliente
            WHERE o.id_orcamento = ?
        `;

        const [orcamentos] = await db.query(queryOrcamento, [id]);

        if (!orcamentos.length) {
            return res.status(404).json({ error: "Orcamento nao encontrado no banco." });
        }

        const orcamento = orcamentos[0];
        const statusNormalizado = String(orcamento.status || "").toLowerCase();
        const statusFinal = statusNormalizado.includes("aprovado") || statusNormalizado.includes("finalizado");

        if (!statusFinal) {
            return res.status(409).json({
                error: "Marque as etapas finais e salve o status antes de gerar o PDF."
            });
        }

        const [itensBanco] = await db.query(
            `
                SELECT
                    tipo_produto,
                    quantidade,
                    valor_unitario,
                    valor_total
                FROM item
                WHERE id_orcamento = ?
            `,
            [id]
        );

        const itens = itensBanco.length > 0 ? itensBanco : [{
            tipo_produto: orcamento.observacoes || "Impressao",
            quantidade: orcamento.quantidade || 1,
            valor_unitario: orcamento.valor_unitario || orcamento.valor_total || 0,
            valor_total: orcamento.valor_total || 0
        }];

        const dadosPdf = {
            ...orcamento,
            cliente: {
                nome: orcamento.nome_cliente,
                cpf_cnpj: orcamento.cpf_cnpj,
                telefone: orcamento.telefone,
                email: orcamento.email,
                endereco: orcamento.endereco
            },
            itens
        };

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="orcamento-${orcamento.id_orcamento}.pdf"`
        );

        return renderOrcamentoPdf(dadosPdf, res);
    } catch (error) {
        console.error("Erro ao gerar PDF do orcamento:", error);
        return res.status(500).json({ error: error.message || "Erro interno ao gerar PDF." });
    }
};
    
module.exports = {
    criarOrcamento,
    listarOrcamentos,
    editarOrcamento,
    deletarOrcamento,
    obterStatusOrcamento,
    atualizarStatusOrcamento,
    gerarPdfOrcamento
};
