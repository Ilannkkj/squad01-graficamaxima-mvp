const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// GET /api/clientes -> Chama a função listarClientes
router.get('/', clienteController.listarClientes);

module.exports = router;