import Card from "../Componentes/cards"
import Grafico from "../Componentes/grafico"
import UltimosOrcamentos from "../Componentes/tabela";
import { useNavigate } from "react-router-dom"



function Dashboard(){
   
    const navegacao = useNavigate()
    
    function irParaOrcamentos(){
    navegacao("/orcamentos", {
    state: { abrirModal: true }})}

   return(

    <div className="ConteudoD"> 

    <div className="titulo">
      <h1>Dashboard</h1>
      <button onClick={irParaOrcamentos}> + Criar Orçamento</button>
    </div>

     <div className="cards">
     <Card 
     titulo="Orçamentos Ativos" 
     valor={"R$ " + 1200} 
     cor= " #d5e6fc"
     border =" 1px solid #64a5f9"
     img = "./iconeOrcamento.svg">
     </Card>
     <Card 
     titulo="Novos Orçamentos" 
     valor={1200} 
     cor= " #fef4e6"
     border =" 1px solid #feb07f"
     img = "./iconeNovos0.svg">
     </Card>
     <Card 
     titulo="Aprovados" 
     valor={12} 
     cor= " #e6fee8" 
     border =" 1px solid #61d86b"
     img= "./iconeAtivos.svg">
     </Card>
     </div>

    <div><Grafico/></div>
    <div><UltimosOrcamentos/></div>

    </div>

   )

}

export default Dashboard