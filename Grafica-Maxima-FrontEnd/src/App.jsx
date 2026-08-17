import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react"; 
import Menu from "./Componentes/menu";
import Dashboard from "./Paginas/Dashboard";
import Orcamentos from "./Paginas/Orcamentos";
import Papeis from "./Paginas/Papeis";
import Configuracao from "./Paginas/Config";
import StatusOrcamento from "./Paginas/StatusOrcamento";
import CalculadoraM2 from "./Componentes/calculadoraM2";
import "./estilo/app.css";

function App() {
  const [calculadoraAberta, setCalculadoraAberta] = useState(false);

  return (
    <BrowserRouter>
      <Menu />
      
      <main className="conteudo" style={{ position: 'relative' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orcamentos" element={<Orcamentos />} />
          <Route path="/Orcamentos" element={<Orcamentos />} />
          <Route path="/status-orcamento/:id" element={<StatusOrcamento />} />
          <Route path="/papel" element={<Papeis />} />
          <Route path="/configuracao" element={<Configuracao />} />
          <Route path="/calculadora/:tipo" element={<CalculadoraM2 />} />
        </Routes>
      </main>


      <button 
        onClick={() => setCalculadoraAberta(!calculadoraAberta)} 
        style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px',
          width: '55px',
          height: '55px',
          borderRadius: '50%',
          backgroundColor: '#143a80', 
          color: '#fff',
          border: 'none',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999, 
          transition: 'transform 0.2s'
        }}
        title="Abrir Calculadora Rápida"
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1.0)'}
      >
        🧮
      </button>

      {calculadoraAberta && (
        <div style={{
          position: 'fixed',
          bottom: '90px', 
          right: '25px',
          width: '410px', 
          maxHeight: '550px',
          backgroundColor: '#fff',
          boxShadow: '0px 10px 30px rgba(0,0,0,0.3)',
          borderRadius: '12px',
          zIndex: 999995,
          overflowY: 'auto',
          border: '1px solid #ddd'
        }}>
          <CalculadoraM2 aoFechar={() => setCalculadoraAberta(false)} />
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;