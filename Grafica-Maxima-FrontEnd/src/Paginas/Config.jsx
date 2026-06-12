import { useState, useEffect } from "react"
import api from "../services/api"
import "../estilo/config.css"

// 🚀 "Metro Quadrado" integrado no catálogo de abas
const abas = ["Geral", "Corte. Esp", "Laminação", "Vinco", "Serrilha", "Furo", "Grampo", "Cantos Arredondados", "Corte e Vinco", "Bloco", "Metro Quadrado"]

function Configuracao() {
  const [abaAtiva, setAbaAtiva] = useState("Geral")
  const [itens, setItens] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  // Estados específicos para controlar os 4 preços do JSON do m²
  const [precosM2, setPrecosM2] = useState([])
  const [inputPrecoM2, setInputPrecoM2] = useState("")
  const [editandoMaterialM2, setEditandoMaterialM2] = useState(null)

  const [form, setForm] = useState({
    subCategoria: "",
    tamFolha: "Unit",
    custoFixo: 0,
    custoUnitario: 0,
    lucroFixo: 0,
    lucroUnitario: 0,
  })

  // 🚀 BUSCAR DADOS (Banco de dados comum OR arquivo JSON do Metro Quadrado)
  async function carregarDados() {
    try {
      if (abaAtiva === "Metro Quadrado") {
        // 🔥 Bate direto na porta 3301 do back-end com axios limpo
        const response = await api.get('/api/calculo/tipos');
        
        setItens([]); // Limpa a lista do banco normal
        setPrecosM2(response.data?.tipos || []);
      } else {
        // Suas abas padrão do banco de dados continuam usando a instância 'api' local
        const response = await api.get(`/configuracoes/${abaAtiva}`);
        setPrecosM2([]); 
        setItens(response.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados na configuração:", error);
      // Evita travar a tela em caso de falha de conexão na API local
      setItens([]);
      setPrecosM2([]);
    }
  }

  useEffect(() => {
    carregarDados()
  }, [abaAtiva])

  // Abre o modal de criar novo (apenas para tabelas do banco)
  function abrirModalNovo() {
    setEditandoId(null)
    setEditandoMaterialM2(null)
    setForm({ subCategoria: "", tamFolha: "Unit", custoFixo: 0, custoUnitario: 0, lucroFixo: 0, lucroUnitario: 0 })
    setModalAberto(true)
  }

  // Abre o modal de editar (Gerencia dinamicamente se veio do MySQL ou do JSON do m²)
  function abrirModalEditar(item, tipoConfig = "banco") {
    if (tipoConfig === "m2") {
      setEditandoMaterialM2(item.tipo)
      setInputPrecoM2(item.preco_base_m2)
      setModalAberto(true)
    } else {
      setEditandoMaterialM2(null)
      setEditandoId(item.id)
      setForm({
        subCategoria: item.subCategoria || item.sub_categoria || "",
        tamFolha: item.tamFolha || item.tam_função || item.tam_folha || "Unit",
        custoFixo: item.custoFixo !== undefined ? item.custoFixo : (item.custo_fixo || 0),
        custoUnitario: item.custoUnitario !== undefined ? item.custoUnitario : (item.custo_unitario || 0),
        lucroFixo: item.lucroFixo !== undefined ? item.lucroFixo : (item.lucro_fixo || 0),
        lucroUnitario: item.lucroUnitario !== undefined ? item.lucroUnitario : (item.lucro_unitario || 0),
      })
      setModalAberto(true)
    }
  }

  // 🚀 SALVAR UNIFICADO
  async function salvar() {
    try {
      if (abaAtiva === "Metro Quadrado" && editandoMaterialM2) {
        const novoPrecoNum = parseFloat(inputPrecoM2);
        if (isNaN(novoPrecoNum) || novoPrecoNum <= 0) {
          alert("Insira um preço válido.");
          return;
        }
        
        await api.put('/api/calculo/tipos/atualizar', {
          tipo: editandoMaterialM2,
          preco_base_m2: novoPrecoNum
        });
        
        alert(`Preço do ${editandoMaterialM2.replace('_', ' ')} atualizado com sucesso!`);
        fecharModal();
        carregarDados();
        return;
      }

      if (!form.subCategoria) return

      const dadosFormatados = {
        sub_categoria: form.subCategoria,
        tam_folha: form.tamFolha,
        custo_fixo: parseFloat(form.custoFixo) || 0,
        custo_unitario: parseFloat(form.custoUnitario) || 0,
        lucro_fixo: parseFloat(form.lucroFixo) || 0,
        lucro_unitario: parseFloat(form.lucroUnitario) || 0
      }

      if (editandoId !== null) {
        await api.put(`/configuracoes/${abaAtiva}/${editandoId}`, dadosFormatados)
        alert("Edição salva com sucesso!")
      } else {
        await api.post(`/configuracoes/${abaAtiva}`, dadosFormatados)
        alert("Novo item criado com sucesso!")
      }
      
      fecharModal()
      carregarDados()
    } catch (error) {
      console.error("Erro completo ao salvar no banco:", error)
      alert("Erro ao salvar as informações.")
    }
  }

  // 🚀 DELETAR DO BANCO
  async function deletar(id) {
    if (window.confirm("Tem certeza que deseja remover este item do catálogo?")) {
      try {
        await api.delete(`/configuracoes/${abaAtiva}/${id}`)
        carregarDados() 
      } catch (error) {
        console.error("Erro ao deletar item:", error)
        alert("Erro ao remover o item.")
      }
    }
  }

  function fecharModal() {
    setModalAberto(false)
    setEditandoMaterialM2(null)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function formatarReal(valor) {
    return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`
  }

  // 🛡️ Garante tratamento de arrays para a renderização segura das tabelas
  const listaItensBanco = Array.isArray(itens) ? itens : [];
  const listaPrecosM2 = Array.isArray(precosM2) ? precosM2 : [];

  return (
    <div className="ConteudoD">

      <div className="titulo">
        <h1>Configurações</h1>
        {abaAtiva !== "Metro Quadrado" && <button onClick={abrirModalNovo}>+ Criar</button>}
      </div>

      <div className="abas">
        {abas.map(aba => (
          <button
            key={aba}
            className={`aba ${abaAtiva === aba ? "abaAtiva" : ""}`}
            onClick={() => setAbaAtiva(aba)}
          >
            {aba}
          </button>
        ))}
      </div>

      <div className="fundoUtimosO">
        <h2>{abaAtiva}</h2>

        <table>
          {abaAtiva === "Metro Quadrado" ? (
            /* LAYOUT DA TABELA DO METRO QUADRADO (JSON) */
            <>
              <thead>
                <tr>
                  <th>Material / Serviço</th>
                  <th>Preço Atual (M²)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listaPrecosM2.map((item, idx) => (
                  <tr key={idx}>
                    <td className="nome" style={{ textTransform: "uppercase" }}>{item?.tipo?.replace('_', ' ') || "Sem Nome"}</td>
                    <td style={{ color: "#2ecc71", fontWeight: "bold" }}>{formatarReal(item?.preco_base_m2 || 0)}</td>
                    <td className="acoes">
                      <button className="btnEditar" onClick={() => abrirModalEditar(item, "m2")}>✏️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          ) : (
            /* LAYOUT DA TABELA PADRÃO DAS SUAS OUTRAS ABAS (MYSQL) */
            <>
              <thead>
                <tr>
                  <th>Sub-Categoria</th>
                  <th>Tam Folha</th>
                  <th>Custo Fixo</th>
                  <th>Custo Unitário</th>
                  <th>Lucro Fixo</th>
                  <th>Lucro Unitário</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listaItensBanco.map(item => (
                  <tr key={item.id}>
                    <td className="nome">{item.subCategoria || item.sub_categoria}</td>
                    <td>{item.tamFolha || item.tam_folha}</td>
                    <td>{formatarReal(item.custoFixo !== undefined ? item.custoFixo : item.custo_fixo)}</td>
                    <td>{formatarReal(item.custoUnitario !== undefined ? item.custoUnitario : item.custo_unitario)}</td>
                    <td>{formatarReal(item.lucroFixo !== undefined ? item.lucroFixo : item.lucro_fixo)}</td>
                    <td>{formatarReal(item.lucroUnitario !== undefined ? item.lucroUnitario : item.lucro_unitario)}</td>
                    <td className="acoes">
                      <button className="btnEditar" onClick={() => abrirModalEditar(item, "banco")}>✏️</button>
                      <button className="btnDeletar" onClick={() => deletar(item.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </div>

      {/* MODAL CONFIGURADO PARA RENDERIZAR O INPUT CERTO DEPENDENDO DA ABA */}
      {modalAberto && (
        <div className="fundoDesfoque">
          <div className="fundoOrcamento">

            <div className="tituloebutao">
              <div>
                <h2>{editandoMaterialM2 ? "Editar Preço de Tabela" : (editandoId !== null ? "Editar Item" : "Novo Item")}</h2>
                <p>{abaAtiva}</p>
              </div>
              <button onClick={fecharModal}>✕ Fechar</button>
            </div>

            <form onSubmit={e => e.preventDefault()}>
              {editandoMaterialM2 ? (
                /* SE FOR EDIÇÃO DE METRO QUADRADO MOSTRA APENAS O CAMPO DE VALOR */
                <div className="input">
                  <label>Preço do Metro Quadrado para: <strong style={{ textTransform: "uppercase", color: "#f39c12" }}>{editandoMaterialM2.replace('_', ' ')}</strong></label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={inputPrecoM2} 
                    onChange={(e) => setInputPrecoM2(e.target.value)} 
                    placeholder="Ex: 60.00" 
                    autoFocus
                  />
                </div>
              ) : (
                /* SE FOR ABA NORMAL DO BANCO MOSTRA SEUS INPUTS ORIGINAIS */
                <>
                  <div className="input">
                    <label>Sub-Categoria</label>
                    <input name="subCategoria" value={form.subCategoria} onChange={handleChange} placeholder="Ex: Bolsa Para Pasta" />
                  </div>

                  <div className="input">
                    <label>Tam Folha</label>
                    <input name="tamFolha" value={form.tamFolha} onChange={handleChange} placeholder="Ex: Unit" />
                  </div>

                  <div className="input">
                    <label>Custo Fixo</label>
                    <input name="custoFixo" type="number" value={form.custoFixo} onChange={handleChange} />
                  </div>

                  <div className="input">
                    <label>Custo Unitário</label>
                    <input name="custoUnitario" type="number" step="0.01" value={form.custoUnitario} onChange={handleChange} />
                  </div>

                  <div className="input">
                    <label>Lucro Fixo</label>
                    <input name="lucroFixo" type="number" step="0.01" value={form.lucroFixo} onChange={handleChange} />
                  </div>

                  <div className="input">
                    <label>Lucro Unitário</label>
                    <input name="lucroUnitario" type="number" step="0.01" value={form.lucroUnitario} onChange={handleChange} />
                  </div>
                </>
              )}

              <button className="btnSalvar" onClick={salvar}>Salvar</button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Configuracao;