// src/routes/configuracoesRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ========================================================
// 🔍 GET: Busca os dados REAIS salvos em cada coluna do banco
// ========================================================
const buscarDadosAba = async (req, res) => {
    const { aba } = req.params;
    try {
        let query = '';
        if (aba === "Geral") {
            // 🔥 FILTRO ANTIZUMBI: Só traz registros onde a descrição não seja nula, não esteja em branco e não seja a palavra 'NULL'
            query = `
                SELECT 
                    id_acabamento AS id, 
                    descricao AS subCategoria, 
                    tipo AS tamFolha, 
                    custo_fixo AS custoFixo, 
                    custo AS custoUnitario, 
                    lucro_fixo AS lucroFixo, 
                    lucro_unitario AS lucroUnitario 
                FROM acabamento 
                WHERE (nome = "Geral" OR descricao IS NOT NULL)
                  AND descricao != '' 
                  AND descricao != 'NULL'
                  AND descricao IS NOT NULL
            `;
        } else if (aba === "Corte. Esp" || aba === "Corte e Vinco") {
            query = 'SELECT id_corte AS id, tipo AS subCategoria, descricao AS tamFolha, valor_fixo AS custoFixo, custo_unitario AS custoUnitario, lucro_fixo AS lucroFixo, lucro_unitario AS lucroUnitario FROM corte WHERE tipo != "Item Sem Subcategoria" AND tipo IS NOT NULL';
        } else {
            query = 'SELECT id_acabamento AS id, descricao AS subCategoria, tipo AS tamFolha, custo_fixo AS custoFixo, custo AS custoUnitario, lucro_fixo AS lucroFixo, lucro_unitario AS lucroUnitario FROM acabamento WHERE nome = ? AND descricao != "" AND descricao IS NOT NULL';
        }

        const [rows] = await db.query(query, [aba]);
        res.json(rows);
    } catch (error) {
        console.error("Erro no GET de Configurações:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Mapeia tanto com /api quanto sem, matando a chance de dar erro 404 no notebook
router.get('/configuracoes/:aba', buscarDadosAba);
router.get('/api/configuracoes/:aba', buscarDadosAba);


// ========================================================
// ➕ POST: Salva todos os campos preenchidos na tela direto no banco
// ========================================================
const criarConfiguracao = async (req, res) => {
    const { aba } = req.params;
    
    // Tratamento de segurança: aceita tanto camelCase do front novo quanto snake_case do antigo
    const subCategoria = req.body.subCategoria || req.body.sub_categoria || "Item Sem Subcategoria";
    const tamFolha = req.body.tamFolha || req.body.tam_folha || "Unit";
    const custoFixo = parseFloat(req.body.custoFixo || req.body.custo_fixo || 0);
    const custoUnitario = parseFloat(req.body.custoUnitario || req.body.custo_unitario || req.body.custo || 0);
    const lucroFixo = parseFloat(req.body.lucroFixo || req.body.lucro_fixo || 0);
    const lucroUnitario = parseFloat(req.body.lucroUnitario || req.body.lucro_unitario || 0);

    try {
        if (aba === "Corte. Esp" || aba === "Corte e Vinco") {
            const sql = 'INSERT INTO corte (tipo, descricao, valor_fixo, custo_unitario, lucro_fixo, lucro_unitario) VALUES (?, ?, ?, ?, ?, ?)';
            await db.query(sql, [subCategoria, tamFolha, custoFixo, custoUnitario, lucroFixo, lucroUnitario]);
        } else {
            const nomeAba = aba === "Geral" ? "Geral" : aba;
            
            // Inserção alinhada milimetricamente com a tabela 'acabamento' do seu dump físico
            const sql = 'INSERT INTO acabamento (nome, tipo, descricao, custo_fixo, custo, lucro_fixo, lucro_unitario, tipo_cobranca) VALUES (?, ?, ?, ?, ?, ?, ?, "Unit")';
            
            // Força strings curtas para caber nos limites VARCHAR do MySQL sem estourar restrição
            await db.query(sql, [
                String(nomeAba).substring(0, 50), 
                String(tamFolha).substring(0, 30), 
                String(subCategoria), 
                custoFixo, 
                custoUnitario, 
                lucroFixo, 
                lucroUnitario
            ]);
        }
        res.status(201).json({ message: "Criado com sucesso!" });
    } catch (error) {
        console.error("Erro real no POST de Configurações:", error.message);
        res.status(500).json({ error: error.message });
    }
};

router.post('/configuracoes/:aba', criarConfiguracao);
router.post('/api/configuracoes/:aba', criarConfiguracao);


// ========================================================
// 💾 PUT: Atualiza as informações modificadas no banco real
// ========================================================
const atualizarConfiguracao = async (req, res) => {
    const { aba, id } = req.params;
    
    const subCategoria = req.body.subCategoria || req.body.sub_categoria || "";
    const tamFolha = req.body.tamFolha || req.body.tam_folha || "";
    const custoFixo = parseFloat(req.body.custoFixo || req.body.custo_fixo || 0);
    const custoUnitario = parseFloat(req.body.custoUnitario || req.body.custo_unitario || req.body.custo || 0);
    const lucroFixo = parseFloat(req.body.lucroFixo || req.body.lucro_fixo || 0);
    const lucroUnitario = parseFloat(req.body.lucroUnitario || req.body.lucro_unitario || 0);

    try {
        if (aba === "Corte. Esp" || aba === "Corte e Vinco") {
            await db.query(
                'UPDATE corte SET tipo = ?, descricao = ?, valor_fixo = ?, custo_unitario = ?, lucro_fixo = ?, lucro_unitario = ? WHERE id_corte = ?', 
                [subCategoria, tamFolha, custoFixo, custoUnitario, lucroFixo, lucroUnitario, id]
            );
        } else {
            await db.query(
                'UPDATE acabamento SET tipo = ?, descricao = ?, custo_fixo = ?, custo = ?, lucro_fixo = ?, lucro_unitario = ? WHERE id_acabamento = ?', 
                [tamFolha, subCategoria, custoFixo, custoUnitario, lucroFixo, lucroUnitario, id]
            );
        }
        res.json({ message: "Atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro no PUT de Configurações:", error.message);
        res.status(500).json({ error: error.message });
    }
};

router.put('/configuracoes/:aba/:id', atualizarConfiguracao);
router.put('/api/configuracoes/:aba/:id', atualizarConfiguracao);


// ========================================================
// 🗑️ DELETE: Limpa o registro permanentemente
// ========================================================
const removerConfiguracao = async (req, res) => {
    const { aba, id } = req.params;
    try {
        if (aba === "Corte. Esp" || aba === "Corte e Vinco") {
            await db.query('DELETE FROM corte WHERE id_corte = ?', [id]);
        } else {
            await db.query('DELETE FROM acabamento WHERE id_acabamento = ?', [id]);
        }
        res.json({ message: "Item removido com sucesso!" });
    } catch (error) {
        console.error("Erro no DELETE de Configurações:", error.message);
        res.status(500).json({ error: error.message });
    }
};

router.delete('/configuracoes/:aba/:id', removerConfiguracao);
router.delete('/api/configuracoes/:aba/:id', removerConfiguracao);

module.exports = router;