import { useState, useEffect } from "react";
import axios from "axios";
import Card from "../Componentes/cards";
import Grafico from "../Componentes/grafico";
import UltimosOrcamentos from "../Componentes/tabela";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navegacao = useNavigate();
  const [orcamentos, setOrcamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  function irParaOrcamentos() {
    navegacao("/orcamentos", {
      state: { abrirModal: true }
    });
  }

  useEffect(() => {

    api.get("api/orcamentos")
      .then((resposta) => {
        setOrcamentos(resposta.data);
        setCarregando(false);
      })
      .catch((erro) => {
        console.error("Erro ao buscar orçamentos:", erro);
        setCarregando(false);
      });
  }, []);


  const orcamentosAtivos = orcamentos.filter(
    (item) => item.status?.toLowerCase() === "aberto" || item.status?.toLowerCase() === "ativo"
  );

  const totalValorAtivos = orcamentosAtivos.reduce((acc, item) => {
    return acc + (parseFloat(item.valor_total) || 0);
  }, 0);

    const orcamentosAprovados = orcamentos.filter(
    (item) => item.status?.toLowerCase() === "aprovado"
  );

  const totalValorAprovados = orcamentosAprovados.reduce((acc, item) => {
    return acc + (parseFloat(item.valor_total) || 0);
  }, 0);

  const valorFormatadoAtivos = totalValorAtivos.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

    const valorFormatadoAprovados = totalValorAprovados.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="ConteudoD">
      <div className="titulo">
        <h1>Dashboard</h1>
        <button onClick={irParaOrcamentos}> + Criar Orçamento</button>
      </div>

      <div className="cards">
        <Card
          titulo="Orçamentos Ativos"
          valor={carregando ? "Carregando..." : valorFormatadoAtivos}
          cor="#d5e6fc"
          border="1px solid #64a5f9"
          img="./iconeOrcamento.svg"
        />
        <Card
          titulo="Novos Orçamentos"
          valor={orcamentosAtivos.length} 
          cor="#fef4e6"
          border="1px solid #feb07f"
          img="./iconeNovos0.svg"
        />
        <Card
          titulo="Aprovados"
          valor={carregando ? "Carregando..." : valorFormatadoAprovados}
          cor="#e6fee8"
          border="1px solid #61d86b"
          img="./iconeAtivos.svg"
        />
      </div>

      <div><Grafico /></div>
      <div><UltimosOrcamentos orcamentos={orcamentos} exibirAcoes={false} /></div>
    </div>
  );
}

export default Dashboard; 