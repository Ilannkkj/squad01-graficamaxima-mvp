import Card from "../Componentes/cards";
import UltimosOrcamentos from "../Componentes/tabela"; 
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NovoOrcamento from "./NovoOrcamentos";    
import api from "../services/api"; 

function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [orcamentoEmEdicao, setOrcamentoEmEdicao] = useState(null);
  const [loading, setLoading] = useState(true); 
  const location = useLocation();
  
  // Função para Deletar (Blindada contra erros de tipo)
  const deletarOrcamento = async (id) => {
    if (!window.confirm(`Tem certeza que deseja deletar o orçamento #${id}?`)) return;

    try {
      const response = await api.delete(`/api/orcamentos/${id}`);

      if (response.status === 200) {
        alert("Orçamento deletado com sucesso!");
        // Garante que o prev é um array antes de rodar o filter
        setOrcamentos(prev => Array.isArray(prev) ? prev.filter(orc => orc.id_orcamento !== id) : []);
      }
    } catch (error) {
      console.error("Erro ao deletar orçamento:", error);
      alert("Não foi possível deletar o orçamento.");
    }
  };

  // Função de Edição
  const prepararEdicaoOrcamento = (orcamento) => {
    setOrcamentoEmEdicao(orcamento);
    setModalAberto(true);
  };

  // Função assíncrona que busca do banco de dados
  const carregarOrcamentosDoBanco = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/orcamentos");
      
      // LOG TEMPORÁRIO: Abra o F12 no navegador para inspecionar o que está vindo aqui
      console.log("Retorno da API Gráfica Máxima:", response.data);
      
      setOrcamentos(response.data); 
    } catch (error) {
      console.error("Erro ao carregar orçamentos da API:", error);
      alert("Não foi possível carregar os orçamentos do banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.abrirModal) {
      setModalAberto(true);
    }
    carregarOrcamentosDoBanco();
  }, [location.state]);

  // Facilita a leitura nos filtros dos cards garantindo que sempre seja uma lista
  const listaOrcamentos = Array.isArray(orcamentos) ? orcamentos : [];

  return (
    <div className="ConteudoD">
      
      {/* Título e Botão */}
      <div className="titulo">
        <h1>Orçamentos</h1>
        <button onClick={() => setModalAberto(true)}>
          + Criar Orçamento
        </button>
      </div>

      {/* Grid de Cards Superiores limpos e protegidos */}
      <div className="cards">
        <Card
          titulo="Pré Orçamentos"
          valor={listaOrcamentos.filter(o => {
            const status = String(o.status).toLowerCase();
            return status === "aberto" || status === "pré orçamento" || status === "pré-orçamento";
          }).length}
          border="1px solid #24de13"
          img="/ativos.svg"
        />
        <Card
          titulo="Em Análise"
          valor={listaOrcamentos.filter(o => {
            const status = String(o.status).toLowerCase();
            return status === "em análise" || status === "em analise";
          }).length}
          cor="#fef4e6"
          border="1px solid #feb07f"
          img="/analise.svg"
        />
        <Card
          titulo="Inativos"
          valor={listaOrcamentos.filter(o => String(o.status).toLowerCase() === "inativo").length}
          border="1px solid #ec390c"
          img="/inativos.svg"
        />
        <Card
          titulo="Finalizados"
          valor={listaOrcamentos.filter(o => String(o.status).toLowerCase() === "finalizado").length}
          border="1px solid #2d119f"
          img="/finalizados.svg"
        />
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Carregando dados da Gráfica Máxima...
        </div>
      ) : (
        /* Tabela protegida */
        <UltimosOrcamentos 
          orcamentos={listaOrcamentos} 
          deletarOrcamento={deletarOrcamento}
          prepararEdicaoOrcamento={prepararEdicaoOrcamento}
        />  
      )}

      {/* Modal conectado à lista tratada */}
      <NovoOrcamento 
        aberto={modalAberto} 
        fechar={() => {
          setModalAberto(false);
          setOrcamentoEmEdicao(null);
        }}
        orcamentos={listaOrcamentos}
        setOrcamentos={setOrcamentos}
        orcamentoEmEdicao={orcamentoEmEdicao}
      />

    </div>
  );
}

export default Orcamentos;