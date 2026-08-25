-- --------------------------------------------------------
-- Script SQL Completo: Limpeza (TRUNCATE) e Povoamento com Dados Reais
-- Incluindo TODOS os Papéis, Acabamentos e Configurações Originais da Planilha Excel
-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Truncar todas as tabelas na ordem correta para evitar conflito de FK
TRUNCATE TABLE acabamento_item;
TRUNCATE TABLE item_corte;
TRUNCATE TABLE servico_item;
TRUNCATE TABLE documento;
TRUNCATE TABLE historico_log;
TRUNCATE TABLE item;
TRUNCATE TABLE orcamento;
TRUNCATE TABLE acabamento;
TRUNCATE TABLE cliente;
TRUNCATE TABLE corte;
TRUNCATE TABLE impressao;
TRUNCATE TABLE papel;
TRUNCATE TABLE servico;
TRUNCATE TABLE usuario;

-- --------------------------------------------------------
-- 2. Popular Tabelas Base (Usuários, Papéis, Impressões, Cortes, Acabamentos e Serviços)
-- --------------------------------------------------------

-- Tabela: usuario
INSERT INTO usuario (id_usuario, nome, email, senha_hash, tipo, data_criacao, ativo) VALUES
(1, 'Admin Principal', 'admin@grafica.com', 'hash_seguro_123', 'admin', '2026-04-23 14:15:25', 1);

-- Tabela: papel (Com todos os papéis padrão extraídos do Excel)
INSERT INTO papel (id_papel, nome, tipo, largura_folha, altura_folha, custo_por_folha) VALUES
(1, 'Couchê Brilho 115g', 'Papel', 66.00, 96.00, 0.5000),
(2, 'Couchê Brilho 150g', 'Papel', 66.00, 96.00, 0.7500),
(3, 'Couchê Brilho 250g', 'Papel', 66.00, 96.00, 1.2500),
(7, 'COUCHE 300 GR BRILHO/FOSCO', 'Papel', 66.00, 96.00, 1.9500),
(8, 'DUPLEX 250 GR', 'Papel', 66.00, 96.00, 1.5000),
(11, 'TRIPLEX SUPER WHITE 240 GR', 'Papel', 66.00, 96.00, 1.9500),
(12, 'ENVELOPE OFÍCIO 16x22', 'Papel', 16.00, 22.00, 0.8000),
(13, 'ENV. OF. C/ JANELA 20x28', 'Papel', 20.00, 28.00, 1.1500);

-- Tabela: impressao
INSERT INTO impressao (id_impressao, tipo, custo_por_folha) VALUES
(1, 'Offset Colorido', 0.8000),
(2, 'Digital Colorida', 1.0000);

-- Tabela: corte
INSERT INTO corte (id_corte, tipo, descricao, valor_fixo, custo_unitario, lucro_fixo, lucro_unitario) VALUES
(1, 'Corte Reto', 'Corte simples guilhotina', 10.0000, 0.0000, 0.0000, 0.0000),
(2, 'Corte Especial', 'Corte personalizado / faca', 15.0000, 0.0000, 0.0000, 0.0000);

-- Tabela: acabamento (Com todos os acabamentos e configurações da planilha)
INSERT INTO acabamento (id_acabamento, nome, tipo, descricao, custo, tipo_cobranca, custo_fixo, lucro_fixo, lucro_unitario) VALUES
(1, 'Laminação Fosca', 'Papel', 'Laminação fosca BOPP', 0.5000, 'unitario', 0.0000, 0.0000, 0.0000),
(2, 'Blocagem', 'Bloco', 'Blocagem padrão com cola', 0.0000, 'Unit', 0.0000, 0.0000, 0.0000),
(4, 'Verniz Localizado', 'Especial', 'Verniz UV localizado frente', 87.0000, 'Unit', 0.0000, 0.0000, 0.0000),
(11, 'Corte Especial', 'Laser', 'Corte personalizado a laser', 0.3000, 'Unit', 0.0000, 0.0000, 10.0000);

-- Tabela: servico
INSERT INTO servico (id_servico, nome, descricao, tipo, tipo_cobranca, custo_fixo, custo_unitario) VALUES
(1, 'Design de Arte', 'Criação de layout e fechamento de arquivo', 'design', 'fixo', 50.0000, 0.0000),
(2, 'Impressão e Acabamento', 'Serviço completo de produção gráfica', 'producao', 'variavel', 0.0000, 0.0000);

-- --------------------------------------------------------
-- 3. Popular Clientes (Dados realistas e corporativos)
-- --------------------------------------------------------

INSERT INTO cliente (id_cliente, nome, cpf_cnpj, telefone, email, endereco, data_cadastro) VALUES
(1, 'João da Silva', '123.456.789-00', '61999999999', 'joao@cliente.com', 'QNN 01 Conjunto B, Ceilândia - DF', '2026-04-23 14:15:25'),
(2, 'Studio Criativo Publicidade', '12.345.678/0001-90', '6133445566', 'contato@studiocriativo.com.br', 'SCN Quadra 2 Bloco D, Asa Norte, Brasília - DF', '2026-05-21 11:28:26'),
(3, 'Panificadora Pão Dourado', '98.765.432/0001-12', '6133557788', 'paodourado@gmail.com', 'QNM 10 Conjunto C, Taguatinga - DF', '2026-05-21 11:37:09'),
(4, 'Clínica Odontológica Sorria', '45.123.789/0001-55', '61988887777', 'contato@clinicasorria.com', 'EQN 204/205 Bloco A, Asa Sul, Brasília - DF', '2026-05-21 11:41:08'),
(5, 'Mariana Costa Advocacia', '234.567.890-11', '61977776655', 'contato@marianacosta.adv.br', 'SAS Quadra 4 Bloco B, Asa Sul, Brasília - DF', '2026-05-21 11:42:13'),
(6, 'Academia Corpo & Vida', '65.432.111/0001-88', '6132223344', 'recepcao@corpovida.com.br', 'QSA 12 Lote 3, Taguatinga - DF', '2026-05-21 12:02:25'),
(7, 'Imobiliária Nova Capital', '33.222.111/0001-44', '6133221100', 'vendas@novacapitalimoveis.com.br', 'SHIS QL 10 Conjunto 3, Lago Sul, Brasília - DF', '2026-05-21 12:06:07'),
(8, 'Paulo Araújo', '555.444.333-22', '61981112233', 'paulo.araujo@email.com', 'CEP: 72145-000, Brasília, Ceilândia Norte, QNM 10', '2026-06-10 16:50:03');

-- --------------------------------------------------------
-- 4. Popular Orçamentos e Itens
-- --------------------------------------------------------

INSERT INTO orcamento (id_orcamento, id_usuario, id_cliente, data_criacao, data_validade, valor_total, valor_unitario, status, prazo_entrega, observacoes, quantidade) VALUES
(22, 1, 2, '2026-05-27 12:32:06', NULL, 300.0000, 0.3000, 'Aberto', NULL, 'Cartões de Visita - Studio Criativo', 1000),
(23, 1, 3, '2026-05-27 12:36:38', NULL, 150.0000, 0.1500, 'Aberto', NULL, 'Panfletos Promocionais - Pão Dourado', 1000),
(25, 1, 5, '2026-06-01 17:26:55', NULL, 450.0000, 0.4500, 'Aprovado', NULL, 'Papel Timbrado - Dra. Mariana', 1000),
(26, 1, 6, '2026-06-10 16:36:10', NULL, 704.5000, 0.1409, 'Aprovado', '2026-06-13', '[Panfleto] Academia Corpo & Vida', 5000),
(29, 1, 8, '2026-06-10 16:50:03', NULL, 730.0000, 0.2086, 'Aprovado', '2026-06-15', 'Banner Promocional', 1),
(30, 1, 7, '2026-06-10 17:17:17', NULL, 1.5000, 1.5000, 'Aprovado', NULL, 'Folders Imobiliária', 1);

INSERT INTO item (id_item, id_orcamento, id_papel, id_impressao, tipo_produto, quantidade, largura, altura, valor_unitario, valor_total) VALUES
(1, 22, 7, 1, 'Cartão de Visita', 1000, 9.00, 5.00, 0.3000, 300.0000),
(4, 29, 8, 1, 'Banner', 3500, 100.00, 70.00, 0.2086, 730.0000),
(5, 30, 11, 1, 'Impressão Digital', 1, 21.00, 29.70, 1.5000, 1.5000);

INSERT INTO acabamento_item (id_acabamento_item, id_acabamento, id_item, quantidade, custo_aplicado) VALUES
(1, 1, 1, 1000, 20.0000),
(2, 1, 4, 6, 3.0000),
(3, 2, 4, 7, 0.0000),
(7, 11, 5, 5, 1.5000);

INSERT INTO item_corte (id_item_corte, id_item, id_corte, quantidade, custo_aplicado) VALUES
(1, 1, 1, 1, 10.0000);

INSERT INTO servico_item (id_servico_item, id_servico, id_item, quantidade, custo_aplicado) VALUES
(1, 1, 1, 1, 50.0000);

SET FOREIGN_KEY_CHECKS = 1;