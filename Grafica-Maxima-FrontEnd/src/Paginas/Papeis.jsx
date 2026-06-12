import { useState } from "react";
import "../estilo/papeis.css";

const dadosIniciaisPapeis = [
  { id_papel: 1, nome: "Couché 250g", largura_folha: 66, altura_folha: 96, custo_por_folha: 3.5 },
  { id_papel: 2, nome: "Offset 180g", largura_folha: 64, altura_folha: 88, custo_por_folha: 2.8 },
  { id_papel: 3, nome: "Supremo 300g", largura_folha: 70, altura_folha: 100, custo_por_folha: 4.2 },
  { id_papel: 4, nome: "Reciclato 240g", largura_folha: 66, altura_folha: 96, custo_por_folha: 3.1 },
];

const abas = [
  "Geral", "Offset", "Couchê 66", "Couchê 64", "Supremo",
  "Envelope", "Kraft", "Autocopiativo", "Cantos Reciclado"
];

function Papeis() {
  const [abaAtiva, setAbaAtiva] = useState("Geral");
  const [itens, setItens] = useState(dadosIniciaisPapeis);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    id_papel: null,
    nome: "",
    largura_folha: "",
    altura_folha: "",
    custo_por_folha: "",
  });

  function abrirModalNovo() {
    setEditandoId(null);
    setForm({ id_papel: null, nome: "", largura_folha: "", altura_folha: "", custo_por_folha: "" });
    setModalAberto(true);
  }

  function abrirModalEditar(item) {
    setEditandoId(item.id_papel);
    setForm({ ...item });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function salvar() {
    if (!form.nome) return;

    if (editandoId !== null) {
      setItens(itens.map(i => i.id_papel === editandoId ? { ...form, id_papel: editandoId } : i));
    } else {
      const novoId = itens.length + 1;
      setItens([...itens, { ...form, id_papel: novoId }]);
    }

    fecharModal();
  }

  function deletar(id) {
    setItens(itens.filter(i => i.id_papel !== id));
  }

  function formatarReal(valor) {
    return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
  }

  return (
    <div className="ConteudoD">
      <div className="titulo">
        <h1>Papéis</h1>
        <button onClick={abrirModalNovo}>+ Criar</button>
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
          <thead>
            <tr>
              <th>Nome</th>
              <th>Largura Folha</th>
              <th>Altura Folha</th>
              <th>Custo por Folha</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {itens.map(item => (
              <tr key={item.id_papel}>
                <td className="nome">{item.nome}</td>
                <td>{item.largura_folha}</td>
                <td>{item.altura_folha}</td>
                <td>{formatarReal(item.custo_por_folha)}</td>

                <td className="acoes">
                  <button className="btnEditar" onClick={() => abrirModalEditar(item)}>✏️</button>
                  <button className="btnDeletar" onClick={() => deletar(item.id_papel)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="fundoDesfoque">
          <div className="fundoOrcamento">

            <div className="tituloebutao">
              <div>
                <h2>{editandoId !== null ? "Editar Item" : "Novo Item"}</h2>
                <p>{abaAtiva}</p>
              </div>
              <button onClick={fecharModal}>✕ Fechar</button>
            </div>

            <form onSubmit={e => e.preventDefault()}>
              <div className="input">
                <label>Nome</label>
                <input name="nome" value={form.nome} onChange={handleChange} />
              </div>

              <div className="input">
                <label>Largura da Folha</label>
                <input name="largura_folha" type="number" value={form.largura_folha} onChange={handleChange} />
              </div>

              <div className="input">
                <label>Altura da Folha</label>
                <input name="altura_folha" type="number" value={form.altura_folha} onChange={handleChange} />
              </div>

              <div className="input">
                <label>Custo por Folha</label>
                <input name="custo_por_folha" type="number" step="0.01" value={form.custo_por_folha} onChange={handleChange} />
              </div>

              <button className="btnSalvar" onClick={salvar}>Salvar</button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

export default Papeis;