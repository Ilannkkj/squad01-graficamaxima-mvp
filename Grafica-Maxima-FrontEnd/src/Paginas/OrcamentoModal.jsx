import { useState, useEffect } from "react";
import api from "../services/api";

function NovoOrcamentoModal() {
  // Guarda todos os acabamentos que existem na tela de configurações
  const [acabamentosCatalogo, setAcabamentosCatalogo] = useState([]);
  
  // Guarda quais acabamentos o administrador selecionou para ESTE orçamento
  const [acabamentosSelecionados, setAcabamentosSelecionados] = useState([]);
  
  // Quantidade de itens do pedido (ex: 100 panfletos)
  const [quantidade, setQuantidade] = useState(1);
  const [custoPapel, setCustoPapel] = useState(10.00); // Exemplo de valor que vem da tela de papéis
  const [valorTotalOrcamento, setValorTotalOrcamento] = useState(0);

  // 🔄 1. BUSCA O CARDÁPIO ATUALIZADO DE ACABAMENTOS
  useEffect(() => {
    async function carregarAcabamentos() {
      try {
        // Puxa a aba Geral (onde está o seu "Púrpura-Rosa", "Laminação Fosca", etc.)
        const response = await api.get("/configuracoes/Geral");
        setAcabamentosCatalogo(response.data);
      } catch (error) {
        console.error("Erro ao buscar acabamentos para o orçamento:", error);
      }
    }
    carregarAcabamentos();
  }, []);

  // 🧮 2. CÁCULO EM TEMPO REAL
  useEffect(() => {
    let somaAcabamentos = 0;

    acabamentosSelecionados.forEach(item => {
      // Soma o custo unitário multiplicado pela quantidade + custo fixo se houver
      const unitario = Number(item.custoUnitario) || 0;
      const fixo = Number(item.custoFixo) || 0;
      
      somaAcabamentos += (unitario * quantidade) + fixo;
    });

    // Valor total = Custo do Papel Base + Adicionais (Acabamentos)
    setValorTotalOrcamento(custoPapel + somaAcabamentos);
  }, [acabamentosSelecionados, quantidade, custoPapel]);

  // 🔀 3. GERENCIA QUANDO O ADM MARCA/DESMARCA UM ACABAMENTO
  function handleCheckboxChange(item) {
    const jaSelecionado = acabamentosSelecionados.find(a => a.id === item.id);

    if (jaSelecionado) {
      // Se já estava marcado, remove da lista do pedido
      setAcabamentosSelecionados(acabamentosSelecionados.filter(a => a.id !== item.id));
    } else {
      // Se não estava, adiciona o objeto completo (com o custo junto)
      setAcabamentosSelecionados([...acabamentosSelecionados, item]);
    }
  }

  return (
    <div className="modal-orcamento">
      <h2>Montando Orçamento (Comanda)</h2>

      <div className="input-grupo">
        <label>Quantidade de Exemplares:</label>
        <input 
          type="number" 
          value={quantidade} 
          onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))} 
        />
      </div>

      {/* 📋 SEÇÃO DINÂMICA DE ACABAMENTOS */}
      <div className="secao-acabamentos">
        <h3>Selecione os Acabamentos Adicionais:</h3>
        
        {acabamentosCatalogo.map(item => (
          <div key={item.id} className="checkbox-item">
            <label>
              <input 
                type="checkbox"
                checked={!!acabamentosSelecionados.find(a => a.id === item.id)}
                onChange={() => handleCheckboxChange(item)}
              />
              {/* Mostra o nome real atualizado no banco (Ex: Púrpura-Rosa) */}
              <strong>{item.subCategoria}</strong> - {item.tamFolha} 
              <span className="preco-tag"> (+ R$ {Number(item.custoUnitario).toFixed(2)}/un)</span>
            </label>
          </div>
        ))}
      </div>

      <hr />
      <div className="total-box">
        <h3>Valor Total Estimado: R$ {valorTotalOrcamento.toFixed(2)}</h3>
      </div>
    </div>
  );
}