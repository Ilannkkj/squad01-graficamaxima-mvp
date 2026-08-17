import React from "react";
import { Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  LinearScale, 
  CategoryScale, 
  BarElement, 
  Tooltip, 
  Legend 
} from "chart.js";

// Registrar as escalas e elementos necessários do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Dados simples alinhados com o array de labels
const vendas2026 = [100, 150, 80, 110, 200, 40];
const vendas2025 = [160, 25, 35, 60, 90, 40];

const data = {
  labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
  datasets: [
    {
      label: "Vendas 2026",
      data: vendas2026,
      backgroundColor: "#143a80",
      barThickness: 30, // Ajustado para não sobrepor quando houverem 2 barras lado a lado
      borderRadius: 15,
      animation: {
        duration: 1200,
        easing: "easeOutBounce"
      }
    },
    {
      label: "Vendas 2025",
      data: vendas2025,
      backgroundColor: "#8f9fcc",
      barThickness: 30,
      borderRadius: 15,
      animation: {
        duration: 1200,
        easing: "easeOutBounce"
      }
    }
  ]
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "#737cd01a"
      }
    }
  }
};

function Grafico() {
  return <Bar className="grafico" data={data} options={chartOptions} />;
}

export default Grafico;