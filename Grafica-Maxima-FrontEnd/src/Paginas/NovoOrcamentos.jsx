import { useEffect, useState } from "react";
import api from "../services/api";

function mascararCEP(valor) {
  let cepFormatado = valor.replace(/\D/g, "");
  if (cepFormatado.length > 5) {
    cepFormatado = cepFormatado.replace(/^(\d{5})(\d)/, "$1-$2");
  }
  return cepFormatado.substring(0, 9);
}

function mascararCpfCnpj(valor) {
  let v = valor.replace(/\D/g, "");

  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return v.substring(0, 14);
  } else {
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
    return v.substring(0, 18);
  }
}

function NovoOrcamento({ aberto, fechar, orcamentos, setOrcamentos, orcamentoEmEdicao }) {

    const [etapa, setEtapa] = useState(1);
    const [cep, setCep] = useState("");

    // 🚀 ESTADOS PARA GESTÃO DE CLIENTES CADASTRADOS
    const [clientesCadastrados, setClientesCadastrados] = useState([]);
    const [clienteSelecionadoId, setClienteSelecionadoId] = useState("");

    // Estados para controlar os inputs do formulário
    const [cliente, setCliente] = useState({ nome: "", telefone: "", email: "", cpfCnpj: "" });
    const [endereco, setEndereco] = useState({ estadoCidade: "", bairro: "", ruaAvenida: "", complemento: "", empresa: false, inscricaoEstadual: "", descricao: "" });
    const [servico, setServico] = useState({ nome: "", entrega: "", formato: "", papel: "", cores: "", quantidade: "", descricao: "" });
    
    const [produtos, setProdutos] = useState([]);

    // 🔄 CARREGAR CLIENTES DO BANCO DE DADOS
    async function carregarClientes() {
      try {
        const response = await api.get("/api/clientes");
        if (Array.isArray(response.data)) {
          setClientesCadastrados(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar lista de clientes:", error);
      }
    }

    // 🔄 FUNÇÃO PARA CARREGAR OS ACABAMENTOS CONFIGURADOS NO BANCO
    async function carregarAcabamentosParaOrcamento() {
      try {
          const response = await api.get("/api/configuracoes/Geral");
          
          const dadosTratados = Array.isArray(response.data) ? response.data : [];

          const acabamentosFormatados = dadosTratados.map((item, index) => {
              const nomeReal = item.subCategoria || item.sub_categoria || item.nome;

              return {
                  id: item.id || item.id_acabamento || index,
                  nome: nomeReal ? String(nomeReal).trim() : `Acabamento ID #${item.id || index}`, 
                  quantidade: 0,          
                  valorUni: Number(item.custoUnitario || item.custo || 0)
              };
          });

          setProdutos(acabamentosFormatados);
      } catch (error) {
          console.error("Erro ao carregar acabamentos para a Etapa 3:", error);
          setProdutos([]);
      }
    }

    useEffect(() => {
        if (orcamentoEmEdicao) {
            setCliente({
                nome: orcamentoEmEdicao.nome_cliente || "",
                telefone: orcamentoEmEdicao.telefone || "",
                email: orcamentoEmEdicao.email || "",
                cpfCnpj: orcamentoEmEdicao.cpfCnpj || ""
            });
            setServico({
                nome: orcamentoEmEdicao.observacoes || orcamentoEmEdicao.produto || "",
                entrega: orcamentoEmEdicao.prazo_entrega ? orcamentoEmEdicao.prazo_entrega.substring(0, 10) : "",
                formato: orcamentoEmEdicao.formato || "",
                papel: orcamentoEmEdicao.papel || "",
                cores: orcamentoEmEdicao.cores || "",
                quantidade: orcamentoEmEdicao.quantidade || "",
                descricao: orcamentoEmEdicao.descricao || ""
            });
            
            carregarAcabamentosParaOrcamento();
        } else {
            setCliente({ nome: "", telefone: "", email: "", cpfCnpj: "" });
            setEndereco({ estadoCidade: "", bairro: "", ruaAvenida: "", complemento: "", empresa: false, inscricaoEstadual: "", descricao: "" });
            setServico({ nome: "", entrega: "", formato: "", papel: "", cores: "", quantidade: "", descricao: "" });
            setCep("");
            setClienteSelecionadoId("");
            setProdutos([]);
            
            if (aberto) {
                carregarAcabamentosParaOrcamento();
                carregarClientes(); // Carrega os clientes do MySQL ao abrir o modal
            }
        }
        setEtapa(1); 
    }, [orcamentoEmEdicao, aberto]);

    // 🎯 MANIPULA A SELEÇÃO DO CLIENTE NO DROPDOWN
    function handleSelectCliente(idSelecionado) {
      setClienteSelecionadoId(idSelecionado);

      if (idSelecionado) {
        // Encontra o cliente na lista cadastrada
        const clienteEncontrado = clientesCadastrados.find(
          c => (c.id || c.id_cliente) === parseInt(idSelecionado)
        );

        if (clienteEncontrado) {
          setCliente({
            nome: clienteEncontrado.nome || "",
            telefone: clienteEncontrado.telefone || "",
            email: clienteEncontrado.email || "",
            cpfCnpj: clienteEncontrado.cpf_cnpj || clienteEncontrado.cpfCnpj || ""
          });
        }
      } else {
        // Se selecionar "Cadastrar Novo Cliente", limpa os campos para digitação
        setCliente({ nome: "", telefone: "", email: "", cpfCnpj: "" });
      }
    }

    // Trava os campos se um cliente já cadastrado foi selecionado
    const ehClienteExistente = Boolean(clienteSelecionadoId);

    async function finalizarOrcamento(e) {
      if (e) e.preventDefault();
      try {
        const valorTotalCalculado = produtos.reduce(
          (acc, p) => acc + (parseInt(p.quantidade || 0) * parseFloat(p.valorUni || 0)), 0
        );

        const acabamentosSelecionados = produtos
          .filter(p => parseInt(p.quantidade) > 0)
          .map(p => ({
             id_acabamento: p.id,
             quantidade: parseInt(p.quantidade),
             custo_aplicado: parseFloat(p.quantidade * p.valorUni)
          }));

        // 🚀 CRIAÇÃO DO PAYLOAD ESTRUTURADO PARA O BACK RELACIONAL
        const novoOrcamentoPayload = {
          id_usuario: 1, 
          valor_total: parseFloat(valorTotalCalculado) || 0.00,
          status: orcamentoEmEdicao ? orcamentoEmEdicao.status : "Aberto",
          prazo_entrega: servico.entrega || null, 
          observacoes: servico.descricao || "Pedido via Painel", 

          cliente: {
            nome: cliente.nome,
            cpf_cnpj: cliente.cpfCnpj || null,
            telefone: cliente.telefone || null,
            email: cliente.email || null,
            endereco: `CEP: ${cep}, ${endereco.estadoCidade}, ${endereco.bairro}, ${endereco.ruaAvenida}`
          },

          item: {
            tipo_produto: servico.nome || "Impressão Digital", 
            quantidade: parseInt(servico.quantidade) || 1,
            largura: parseFloat(servico.formato.split('x')[0]) || 0.00, 
            altura: parseFloat(servico.formato.split('x')[1]) || 0.00,
            valor_unitario: parseInt(servico.quantidade) > 0 ? parseFloat(valorTotalCalculado / parseInt(servico.quantidade)) : 0.00,
            valor_total: parseFloat(valorTotalCalculado) || 0.00
          },

          acabamentos: acabamentosSelecionados
        };

        let itemFormatadoParaATela = {};
        const URL_BACKEND = "/api/orcamentos";

        if (orcamentoEmEdicao) {
          const idParaEditar = orcamentoEmEdicao.id_orcamento || orcamentoEmEdicao.id;
          await api.put(`${URL_BACKEND}/${idParaEditar}`, novoOrcamentoPayload);
          alert("Orçamento atualizado com sucesso.");

          itemFormatadoParaATela = {
            id_orcamento: idParaEditar,
            nome_cliente: cliente.nome,
            produto: servico.nome,
            quantidade: servico.quantidade,
            valor_total: valorTotalCalculado,
            status: orcamentoEmEdicao.status || "Aberto",
            prazo_entrega: servico.entrega 
              ? new Date(servico.entrega + "T00:00:00").toLocaleDateString('pt-BR') 
              : "A combinar"
          };

          if (setOrcamentos) {
            setOrcamentos(prev => prev.map(orc => (orc.id_orcamento === idParaEditar || orc.id === idParaEditar) ? itemFormatadoParaATela : orc));
          }

        } else {
          const response = await api.post(URL_BACKEND, novoOrcamentoPayload);
          alert("Orçamento salvo com sucesso!");

          const orcamentoCriadoNoBanco = response.data?.dados || response.data || {};

          itemFormatadoParaATela = {
            id_orcamento: orcamentoCriadoNoBanco.id_orcamento || orcamentoCriadoNoBanco.id || (Array.isArray(orcamentos) ? orcamentos.length + 1 : 1),
            nome_cliente: cliente.nome || "Cliente Novo",
            produto: servico.nome || "Impressão Digital",
            quantidade: servico.quantidade || 1,
            valor_total: valorTotalCalculado,
            status: "Aberto",
            prazo_entrega: servico.entrega 
              ? new Date(servico.entrega + "T00:00:00").toLocaleDateString('pt-BR') 
              : new Date().toLocaleDateString('pt-BR')
          };

          if (setOrcamentos && Array.isArray(orcamentos)) {
            setOrcamentos(prevOrcamentos => [itemFormatadoParaATela, ...prevOrcamentos]);
          }
        }
          
        setEtapa(1); 
        fechar();
      } catch (error) {
        console.error("Erro ao integrar com a API:", error);
        alert("Não foi possível salvar as alterações do orçamento.");
      }
    } 

    function atualizar(index, campo, valor) {
        const novos = [...produtos];
        novos[index][campo] = valor === "" ? "" : (Number(valor) || 0);
        setProdutos(novos);
    }

    function etapaAnterior() {
        setEtapa(atual => Math.max(atual - 1, 1));
    }

    function proximaEtapa() {
        setEtapa(atual => Math.min(atual + 1, 3));
    }

    useEffect(() => {
        if (aberto) {
            document.body.classList.add("modal-aberto");
        } else {
            document.body.classList.remove("modal-aberto");
        }
        return () => {
            document.body.classList.remove("modal-aberto");
        };
    }, [aberto]);

    if (!aberto) return null;

    return (
        <div className="fundoDesfoque">
            <div className="fundoOrcamento">
                
                {/* ETAPA 1: DADOS DO CLIENTE E ENDEREÇO */}
                {etapa === 1 &&
                    <>
                        <div className="tituloebutao">
                            <div>
                                <h2>{orcamentoEmEdicao ? "Editar Cliente / Orçamento" : "Novo Cliente / Orçamento"}</h2>
                                <p>{orcamentoEmEdicao ? "Modifique os dados do orçamento selecionado" : "Selecione um cliente cadastrado ou preencha para um novo cliente"}</p>
                            </div>
                            <button onClick={fechar}>Fechar</button>
                        </div>

                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="dados">
                                
                                {/* 🚀 SELETOR DE CLIENTES CADASTRADOS */}
                                <div className="input" style={{ width: '100%', marginBottom: '15px' }}>
                                    <label htmlFor="clienteCadastrado">Buscar Cliente Cadastrado</label>
                                    <select 
                                        id="clienteCadastrado"
                                        value={clienteSelecionadoId} 
                                        onChange={(e) => handleSelectCliente(e.target.value)}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                                    >
                                        <option value="">-- Cadastrar Novo Cliente --</option>
                                        {clientesCadastrados.map(c => (
                                            <option key={c.id || c.id_cliente} value={c.id || c.id_cliente}>
                                                {c.nome} {c.cpf_cnpj ? `(${c.cpf_cnpj})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input">
                                    <label htmlFor="nome">Cliente</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex.: Paulo Araújo" 
                                        value={cliente.nome} 
                                        onChange={(e) => setCliente({...cliente, nome: e.target.value})} 
                                        disabled={ehClienteExistente}
                                        readOnly={ehClienteExistente}
                                    />
                                </div>

                                <div className="input">
                                    <label htmlFor="telefone">Telefone</label>
                                    <input 
                                        type="tel" 
                                        placeholder="Ex.: (00) 00000-0000" 
                                        value={cliente.telefone} 
                                        onChange={(e) => setCliente({...cliente, telefone: e.target.value})} 
                                        disabled={ehClienteExistente}
                                        readOnly={ehClienteExistente}
                                    />
                                </div>

                                <div className="input">
                                    <label htmlFor="gmail">E-mail</label>
                                    <input 
                                        type="email" 
                                        placeholder="Ex.: exemplo@email.com" 
                                        value={cliente.email} 
                                        onChange={(e) => setCliente({...cliente, email: e.target.value})} 
                                        disabled={ehClienteExistente}
                                        readOnly={ehClienteExistente}
                                    />
                                </div>

                                <div className="input">
                                    <label htmlFor="cpfCnpj">CPF ou CNPJ</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex.: 000.000.000-00 ou 00.000.000/0000-00" 
                                        value={cliente.cpfCnpj} 
                                        onChange={(e) => setCliente({...cliente, cpfCnpj: mascararCpfCnpj(e.target.value)})} 
                                        disabled={ehClienteExistente}
                                        readOnly={ehClienteExistente}
                                    />
                                </div>
                            </div>

                            <div className="dados">
                                <h3 className="tituloF">ENDEREÇO</h3>

                                <div className="input">
                                    <label htmlFor="cep">CEP</label>
                                    <input 
                                        type="text"
                                        placeholder=" Ex.: 00000-000"
                                        value={cep}
                                        onChange={(e) => setCep(mascararCEP(e.target.value))}
                                     />
                                </div>

                                <div className="input">
                                    <label htmlFor="cidade">Estado ou Cidade</label>
                                    <input type="text" placeholder="Ex: Ceilândia - DF" value={endereco.estadoCidade} onChange={(e) => setEndereco({...endereco, estadoCidade: e.target.value})} />
                                </div>

                                <div className="input">
                                    <label htmlFor="bairro">Bairro</label>
                                    <input type="text" placeholder="Ex: Setor O" value={endereco.bairro} onChange={(e) => setEndereco({...endereco, bairro: e.target.value})} />
                                </div>

                                <div className="input">
                                    <label htmlFor="rua">Rua - Avenida</label>
                                    <input type="text" placeholder="Ex: QNM 10" value={endereco.ruaAvenida} onChange={(e) => setEndereco({...endereco, ruaAvenida: e.target.value})} />
                                </div>

                                <div className="input">
                                    <label htmlFor="complemento">Complemento</label>
                                    <input type="text" placeholder="Ex: Conjunto A, Casa 5" value={endereco.complemento} onChange={(e) => setEndereco({...endereco, complemento: e.target.value})} />
                                </div>

                                <div className="input checkbox">
                                    <label htmlFor="empresa">É empresa?</label>
                                    <input 
                                        type="checkbox" 
                                        name="empresa" 
                                        id="empresa" 
                                        checked={!!endereco.empresa} 
                                        onChange={(e) => {
                                            const ehEmpresa = e.target.checked;
                                            setEndereco({
                                                ...endereco, 
                                                empresa: ehEmpresa,
                                                inscricaoEstadual: ehEmpresa ? endereco.inscricaoEstadual : ""
                                            });
                                        }} 
                                    />
                                </div>

                                <div className="input" style={{ opacity: endereco.empresa ? 1 : 0.5, pointerEvents: endereco.empresa ? "auto" : "none" }}>
                                    <label htmlFor="inscricao">Inscrição Estadual</label>
                                    <input 
                                        type="text" 
                                        placeholder={endereco.empresa ? "Inscrição estadual se houver" : "Bloqueado - Apenas para empresas"} 
                                        value={endereco.inscricaoEstadual || ""} 
                                        onChange={(e) => setEndereco({...endereco, inscricaoEstadual: e.target.value})} 
                                        disabled={!endereco.empresa}
                                        readOnly={!endereco.empresa}
                                    />
                                </div>
                                
                                <div className="input descricao">
                                    <label htmlFor="descricao">Descrição</label>
                                    <textarea name="descrição" placeholder="Ex: Descreva os detalhes do serviço..." value={endereco.descricao} onChange={(e) => setEndereco({...endereco, descricao: e.target.value})} />
                                </div>

                                <div className="botoesFormulario">
                                    <button type="button" className="cancelar" onClick={fechar}>Cancelar</button>
                                    <button type="button" className="proximo" onClick={proximaEtapa}>Próximo</button>
                                </div>
                            </div>
                        </form>
                    </>}

                {/* ETAPA 2: DADOS DO SERVIÇO */}
                {etapa === 2 &&
                <>
                    <div className="tituloebutao">
                        <div>
                            <h2>Dados do Serviço</h2>
                            <p>Informe os dados do serviço</p>
                        </div>
                        <button onClick={fechar}>Fechar</button>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="dados">
                            <div className="input">
                                <label htmlFor="servico">Serviço</label>
                                <input type="text" placeholder="Ex.: Panfleto, Banner" value={servico.nome} onChange={(e) => setServico({...servico, nome: e.target.value})} />
                            </div>
                            <div className="input">
                                <label htmlFor="data">Data de entrega</label>
                                <input type="date" value={servico.entrega} onChange={(e) => setServico({...servico, entrega: e.target.value})} />
                            </div>
                            <div className="input">
                                <label htmlFor="formato">Formato</label>
                                <input type="text" placeholder="Ex.: A4, 10x14cm" value={servico.formato} onChange={(e) => setServico({...servico, formato: e.target.value})} />
                            </div>
                            <div className="input">
                                <label htmlFor="papel">Papel</label>
                                <input type="text" placeholder="Ex.: Couchê 90g, Sulfite" value={servico.papel} onChange={(e) => setServico({...servico, papel: e.target.value})} />
                            </div>
                            <div className="input">
                                <label htmlFor="cores">Cores</label>
                                <input type="text" placeholder="Ex.: 4x0, 4x4" value={servico.cores} onChange={(e) => setServico({...servico, cores: e.target.value})} />
                            </div>
                            <div className="input">
                                <label htmlFor="quantidade">Quantidade</label>
                                <input type="number" placeholder="Ex.: 1000" value={servico.quantidade} onChange={(e) => setServico({...servico, quantidade: e.target.value})} />
                            </div>
                            <div className="input descricao">
                                    <label htmlFor="descricao">Descrição</label>
                                    <input type="text" placeholder="Detalhes adicionais do acabamento" value={servico.descricao} onChange={(e) => setServico({...servico, descricao: e.target.value})} />
                            </div>

                            <div className="botoesFormulario">
                                <button type="button" className="cancelar" onClick={etapaAnterior}>Voltar</button>
                                <button type="button" className="proximo" onClick={proximaEtapa}>Próximo</button>
                            </div>
                        </div>
                    </form>
                </>}

                {/* ETAPA 3: CUSTO DE PRODUÇÃO DINÂMICO */}
                {etapa === 3 && 
                <>
                    <div className="tituloebutao">
                        <div>
                            <h2>Custo de Produção</h2>
                            <p>Informe o custo de cada etapa de produção (Acabamentos cadastrados)</p>
                        </div>
                        <button onClick={fechar}>Fechar</button>
                    </div>

                    <form className="producao" onSubmit={finalizarOrcamento}>
                        <div className="tabelaCusto" style={{ width: '100%', overflowX: 'hidden' }}>
                            
                            <div className="tabelaTitulos" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 5px', fontWeight: 'bold' }}>
                                <p style={{ flex: '2', margin: 0, textAlign: 'left' }}>Produto / Acabamento</p> 
                                <div className="valoresInput" style={{ flex: '3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
                                    <p style={{ flex: '1', textAlign: 'center', margin: 0 }}>Quantidade</p>
                                    <p style={{ flex: '1', textAlign: 'center', margin: 0 }}>Valor Unitário</p>
                                    <p id="tituloTotal" style={{ flex: '1', textAlign: 'right', margin: 0, paddingRight: '5px' }}>Total</p>
                                </div>
                            </div>
                       
                            {produtos.map((produto, index) => (
                                <div className="tabela" key={produto.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 5px', borderBottom: '1px solid #eee' }}>
                                    
                                    <p style={{ flex: '2', margin: 0, textAlign: 'left', paddingRight: '10px', wordBreak: 'break-word', fontWeight: '500' }}>
                                        {produto.nome}
                                    </p>
                                    
                                    <div className="tabelaInput" style={{ flex: '3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        
                                        <input 
                                            type="number"
                                            name="quantidade" 
                                            value={produto.quantidade}
                                            onChange={(e) => atualizar(index, 'quantidade', e.target.value)}
                                            style={{ flex: '1', width: '70px', textAlign: 'center', margin: '0 5px' }}
                                        />
                                        
                                        <span style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', margin: '0 5px' }}>
                                            R$
                                            <input 
                                                type="number"
                                                step="0.01"
                                                name="ValorUnitario"
                                                value={produto.valorUni} 
                                                onChange={(e) => atualizar(index, 'valorUni', e.target.value)}
                                                style={{ width: '70px', textAlign: 'center' }}
                                            />
                                        </span>
                                        
                                        <p className="total" style={{ flex: '1', textAlign: 'right', margin: 0, fontWeight: 'bold', paddingRight: '5px', minWidth: '80px' }}> 
                                            R$ {(produto.quantidade * produto.valorUni).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {produtos.length === 0 && (
                                <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                    Nenhum acabamento cadastrado nas Configurações Gerais.
                                </p>
                            )}
                        </div>

                        <div className="botoesFormulario" style={{ marginTop: '20px' }}>
                            <button type="button" className="cancelar" onClick={etapaAnterior}>Voltar</button>
                            <button type="submit" className="proximo">Finalizar</button>
                        </div>
                    </form>
                </>}

            </div>
        </div>
    );
}

export default NovoOrcamento;