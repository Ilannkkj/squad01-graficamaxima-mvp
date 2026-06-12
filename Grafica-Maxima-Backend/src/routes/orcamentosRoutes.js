const express = require('express');
const router = express.Router();

// Variável de requerimento do Controller de Orçamento
const orcamentoController = require('../controllers/orcamentoController');

// ==========================================
// CRUD dos Orçamentos
// ==========================================

// Rota de CRIAR orçamento
router.post("/", orcamentoController.criarOrcamento);

// Rota de LISTAR orçamentos
router.get("/", orcamentoController.listarOrcamentos);

router.get("/:id/pdf", orcamentoController.gerarPdfOrcamento);

// Rota de EDITAR orçamento (Corrigido para PUT com :id que é o padrão de mercado)
router.put("/:id", orcamentoController.editarOrcamento);

// Rota de DELETAR orçamento
router.delete('/:id', orcamentoController.deletarOrcamento);


// ==========================================
// 🚨 AS ROTAS QUE ESTAVAM FALTANDO PARA O STATUS:
// ==========================================

// Rota para BUSCAR o status do orçamento específico (GET)
router.get('/status-orcamento/:id', orcamentoController.obterStatusOrcamento);

// Rota para ATUALIZAR o status do orçamento específico (PUT)
router.put('/status-orcamento/:id', orcamentoController.atualizarStatusOrcamento);


// Exportação das Rotas para o sistema.
module.exports = router;
