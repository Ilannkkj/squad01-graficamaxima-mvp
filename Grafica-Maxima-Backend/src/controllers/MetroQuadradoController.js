const MetroQuadradoService = require('../services/MetroQuadradoService');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Caminho do arquivo JSON de persistência de preços
const caminhoJson = path.join(__dirname, '../services/precos.json');

const calcular = async (req, res) => {
    try {
        const dados = req.body;
        // Roda a lógica padrão limpa do seu amigo
        const retorno = MetroQuadradoService.calcularMetroQuadrado(dados);

        if (!retorno.sucesso) {
            return res.status(422).json({ error: 'Dados inválidos.', detalhes: retorno.erros });
        }

        const { resultado } = retorno;
        let id_item_salvo = null;

        if (dados.id_orcamento) {
            const sqlItem = `
                INSERT INTO item (id_orcamento, tipo_produto, quantidade, largura, altura, valor_unitario, valor_total)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const [itemResult] = await db.query(sqlItem, [
                dados.id_orcamento, resultado.tipo_servico, resultado.quantidade,
                resultado.dimensoes.largura_m, resultado.dimensoes.altura_m,
                resultado.valor_unitario, resultado.valor_total
            ]);
            id_item_salvo = itemResult.insertId;

            await db.query(
                `UPDATE orcamento SET valor_total = COALESCE(valor_total, 0) + ? WHERE id_orcamento = ?`,
                [resultado.valor_total, dados.id_orcamento]
            );
        }

        return res.status(200).json({ message: 'Cálculo realizado.', id_item: id_item_salvo, calculo: resultado });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const listarTipos = (req, res) => {
    try {
        const tipos = MetroQuadradoService.listarTiposEPrecos();
        return res.status(200).json({ tipos });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const simular = (req, res) => {
    try {
        const retorno = MetroQuadradoService.calcularMetroQuadrado(req.body);
        if (!retorno.sucesso) return res.status(422).json({ error: 'Dados inválidos.' });
        return res.status(200).json({ message: 'Simulação realizada.', calculo: retorno.resultado });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// 🚀 O GERENCIADOR DINÂMICO VIA ARQUIVO SEM BANCO DE DADOS!
const atualizarPreco = (req, res) => {
    try {
        const { tipo, preco_base_m2 } = req.body;

        if (!tipo || isNaN(preco_base_m2)) {
            return res.status(422).json({ error: 'Dados inválidos para atualização.' });
        }

        // 1. Lê o arquivo JSON existente
        const dadosBrutos = fs.readFileSync(caminhoJson, 'utf8');
        const precosAtuais = JSON.parse(dadosBrutos);

        // 2. Modifica o preço forçando a chave para minúsculo
        precosAtuais[tipo.toLowerCase()] = parseFloat(preco_base_m2);

        // 3. Salva de volta no arquivo
        fs.writeFileSync(caminhoJson, JSON.stringify(precosAtuais, null, 2), 'utf8');

        return res.status(200).json({ message: `Preço do ${tipo.toUpperCase()} atualizado para R$ ${preco_base_m2} com sucesso!` });
    } catch (error) {
        console.error('Erro ao atualizar arquivo de preços:', error.message);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { calcular, simular, listarTipos, atualizarPreco };