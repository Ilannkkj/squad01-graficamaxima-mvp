const fs = require('fs');
const path = require('path');

// Caminho real para o arquivo JSON de preços
const caminhoJson = path.join(__dirname, 'precos.json');

// Função auxiliar para ler os preços atualizados do arquivo de texto
function obterPrecosBase() {
    try {
        const dadosBrutos = fs.readFileSync(caminhoJson, 'utf8');
        return JSON.parse(dadosBrutos);
    } catch (error) {
        // Se der algum erro ao ler o arquivo, usa esses valores de contingência
        return { adesivo: 60.0, banner: 60.0, lona: 60.0, adesivo_recorte: 120.0 };
    }
}

function arredondar(valor) {
    return Math.round(valor * 10000) / 10000;
}

function validarDados(dados) {
    const erros = [];
    const precosAtuais = obterPrecosBase();
    const tiposValidos = Object.keys(precosAtuais);

    if (!dados || typeof dados !== 'object') {
        erros.push({ campo: 'body', mensagem: 'Corpo da requisição inválido.' });
        return erros;
    }

    if (!dados.tipo_servico) {
        erros.push({ campo: 'tipo_servico', mensagem: 'Campo obrigatório.' });
    } else if (!tiposValidos.includes(dados.tipo_servico.toLowerCase())) {
        erros.push({
            campo: 'tipo_servico',
            mensagem: `Tipo inválido. Valores aceitos: ${tiposValidos.join(', ')}.`,
        });
    }

    const largura = Number(dados.largura);
    if (!dados.largura && dados.largura !== 0) {
        erros.push({ campo: 'largura', mensagem: 'Campo obrigatório.' });
    } else if (isNaN(largura) || largura <= 0) {
        erros.push({ campo: 'largura', mensagem: 'Deve ser um número maior que zero (em metros).' });
    }

    const altura = Number(dados.altura);
    if (!dados.altura && dados.altura !== 0) {
        erros.push({ campo: 'altura', mensagem: 'Campo obrigatório.' });
    } else if (isNaN(altura) || altura <= 0) {
        erros.push({ campo: 'altura', mensagem: 'Deve ser um número maior que zero (em metros).' });
    }

    const quantidade = Number(dados.quantidade);
    if (!dados.quantidade && dados.quantidade !== 0) {
        erros.push({ campo: 'quantidade', mensagem: 'Campo obrigatório.' });
    } else if (!Number.isInteger(quantidade) || quantidade <= 0) {
        erros.push({ campo: 'quantidade', mensagem: 'Deve ser um inteiro maior que zero.' });
    }

    return erros;
}

function calcularMetroQuadrado(dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) {
        return { sucesso: false, erros };
    }

    const precosAtuais = obterPrecosBase(); // Puxa os valores salvos do arquivo
    const tipo = dados.tipo_servico.toLowerCase();
    const largura     = Number(dados.largura);
    const altura      = Number(dados.altura);
    const quantidade  = Number(dados.quantidade);
    const margemPct   = dados.margem_lucro !== undefined && dados.margem_lucro !== null ? Number(dados.margem_lucro) : 0;

    const precoPorM2  = dados.preco_por_m2 !== undefined && dados.preco_por_m2 !== null
                        ? Number(dados.preco_por_m2)
                        : precosAtuais[tipo];

    const areaPorPeca    = arredondar(largura * altura);
    const areaTotalM2    = arredondar(areaPorPeca * quantidade);
    const custoPorPeca   = arredondar(areaPorPeca * precoPorM2);
    const custoTotal     = arredondar(custoPorPeca * quantidade);
    const valorMargem    = arredondar(custoTotal * (margemPct / 100));
    const valorTotalFinal = arredondar(custoTotal + valorMargem);
    const valorUnitario  = arredondar(valorTotalFinal / quantidade);

    const resultado = {
        tipo_servico: tipo,
        dimensoes: {
            largura_m: largura,
            altura_m: altura,
            area_por_peca_m2: areaPorPeca,
        },
        quantidade,
        area_total_m2: areaTotalM2,
        preco_por_m2: precoPorM2,
        custo_por_peca: custoPorPeca,
        custo_total: custoTotal,
        margem_lucro_pct: margemPct,
        valor_margem: valorMargem,
        valor_unitario: valorUnitario,
        valor_total: valorTotalFinal,
        observacoes: dados.observacoes || null,
    };

    return { sucesso: true, resultado };
}

function listarTiposEPrecos() {
    const precosAtuais = obterPrecosBase();
    return Object.keys(precosAtuais).map(tipo => ({
        tipo,
        preco_base_m2: precosAtuais[tipo],
    }));
}

module.exports = { calcularMetroQuadrado, listarTiposEPrecos };