import React, { useEffect, useState } from 'react';
import "../estilo/statusOrcamento.css";
import { useParams } from "react-router-dom";
import StepItem from "../Componentes/stepItens";
import api from "../services/api";

const StatusOrcamento = () => {
  const { id } = useParams();
  
  const [nomeClienteReal, setNomeClienteReal] = useState("Carregando...");
  const [valorOrcamento, setValorOrcamento] = useState(0);
  const [etapaSalva, setEtapaSalva] = useState(0);
  const [checkAnalise, setCheckAnalise] = useState(false);
  const [checkAprovado, setCheckAprovado] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const ordemEtapas = ["Pré-Orçamento", "Em análise", "Aprovado"];

  // 🔍 BUSCAR DADOS DO BACK-END
  useEffect(() => {
    if (!id) return;

    api.get(`/api/orcamentos/status-orcamento/${id}`)
      .then((res) => {
        const dadosReaisBanco = res.data;

        if (dadosReaisBanco) {
          setNomeClienteReal(
            dadosReaisBanco.nomeCliente || 
            dadosReaisBanco.nome_cliente || 
            dadosReaisBanco.cliente || 
            dadosReaisBanco.nome || 
            "Orçamento Sem Nome"
          );

          setValorOrcamento(Number(dadosReaisBanco.valor || dadosReaisBanco.valor_total || 0));

          // Garante a correspondência do texto vindo do banco (tratando maiúsculas/minúsculas)
          const statusBanco = dadosReaisBanco.status || "Pré-Orçamento";
          const indexValido = ordemEtapas.findIndex(
            e => e.toLowerCase() === statusBanco.toLowerCase()
          );
          const passoBanco = indexValido !== -1 ? indexValido : 0;

          setEtapaSalva(passoBanco);
          setCheckAnalise(passoBanco >= 1);
          setCheckAprovado(passoBanco === 2);
          setErroCarregamento(false);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar dados do orçamento:", err);
        setNomeClienteReal("Erro ao carregar orçamento");
        setErroCarregamento(true);
      });
  }, [id]); 

  // 💾 ATUALIZAR STATUS REAL NO BANCO DE DADOS
  const salvarStatus = async (mostrarAlerta = true) => {
    const novoStatusTexto = ordemEtapas[etapaSalva];

    try {
      await api.put(`/api/orcamentos/status-orcamento/${id}`, {
        status: novoStatusTexto
      });
      if (mostrarAlerta) {
        alert(`Status atualizado e salvo no banco como: ${novoStatusTexto}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar o status no back-end:", error);
      alert("Erro ao salvar o novo status no servidor.");
      throw error;
    }
  };

  const handleAtualizar = () => {
    salvarStatus(true).catch(() => {});
  };

  const handleGerarPdf = async () => {
    if (!checkAnalise || !checkAprovado) {
      alert("Marque as caixinhas finais antes de gerar o PDF.");
      return;
    }

    try {
      setGerandoPdf(true);
      await salvarStatus(false);

      const response = await api.get(`/api/orcamentos/${id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `orcamento-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Nao foi possivel gerar o PDF do orcamento.");
    } finally {
      setGerandoPdf(false);
    }
  };

  if (erroCarregamento) {
    return (
      <div className="main-content">
        <div className="card-detalhe" style={{ padding: "20px", textAlign: "center" }}>
          <h2>Orçamento não encontrado</h2>
          <p>Verifique o código informado ou retorne à listagem da Gráfica.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <header className="header-principal">
        <h1>{nomeClienteReal}</h1>
        <p>{ordemEtapas[etapaSalva]}!</p>
      </header>

      <hr className="barra-divisora" />

      <section className="card-andamento">
        <div className="faixa-amarela">
          <h2>Andamento</h2>
        </div>
        <div className="stepper-container">
          {ordemEtapas.map((nome, index) => (
            <StepItem
              key={nome}
              label={nome}
              index={index}
              ativo={index === etapaSalva}
              concluido={index <= etapaSalva}
              isLast={index === ordemEtapas.length - 1}
            />
          ))}
        </div>
      </section>

      <div className="grid-inferior">
        {/* PLANEJAMENTO */}
        <section className="card-detalhe">
          <header className="card-header">
            <h2>Planejamento</h2>
          </header>
          <div className="card-body">
            <label>
              <input
                type="checkbox"
                checked={checkAnalise}
                onChange={(e) => {
                  const val = e.target.checked;
                  setCheckAnalise(val);
                  if (val) {
                    setEtapaSalva(1); // Muda o visual para "Em análise" na hora!
                  } else {
                    setCheckAprovado(false);
                    setEtapaSalva(0); // Volta para "Pré-Orçamento"
                  }
                }}
              />
              Análise
            </label>
            <label>
              <input
                type="checkbox"
                checked={checkAprovado}
                disabled={!checkAnalise}
                onChange={(e) => {
                  const val = e.target.checked;
                  setCheckAprovado(val);
                  if (val) {
                    setEtapaSalva(2); // Muda o visual para "Aprovado" na hora!
                  } else {
                    setEtapaSalva(1); // Retorna para "Em análise"
                  }
                }}
              />{" "}
              Aprovado
            </label>
            <button className="btn-finalizar" onClick={handleAtualizar}>
              Atualizar Sistema
            </button>
            {checkAnalise && checkAprovado && (
              <button
                className="btn-gerar-pdf"
                disabled={gerandoPdf}
                onClick={handleGerarPdf}
              >
                {gerandoPdf ? "Gerando PDF..." : "Gerar PDF"}
              </button>
            )}
          </div>
        </section>

        {/* PROCESSO */}
        <section className="card-detalhe">
          <header className="card-header">
            <h2>Processo</h2>
          </header>
          <div className="card-body processo-flex">
            <div className="processo-info">
              <span className="passo-label">Passo {etapaSalva + 1}</span>
              <p className="status-atual">{ordemEtapas[etapaSalva]}</p>
            </div>
            <div className={`status-icon-grande ${etapaSalva === 2 ? "sucesso" : ""}`}>
              {etapaSalva === 2 ? "✅" : "⚙️"}
            </div>
            <div className={`info-box ${etapaSalva === 2 ? "sucesso" : ""}`}>
              {etapaSalva === 2
                ? "Orçamento finalizado e pronto para produção."
                : "Aguardando atualizações do setor de planejamento."}
            </div>
          </div>
        </section>

        {/* FINANCEIRO */}
        <section className="card-detalhe">
          <header className="card-header">
            <h2>Financeiro</h2>
          </header>
          <div className="card-body financeiro-dados">
            <p>
              Custo Total:{" "}
              <span>
                {valorOrcamento.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </p>
            <p>
              Revenda:{" "}
              <span>
                {(valorOrcamento * 1.2).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StatusOrcamento;
