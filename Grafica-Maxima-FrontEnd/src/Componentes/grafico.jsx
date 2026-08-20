import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  LinearScale, 
  CategoryScale, 
  BarElement, 
  Tooltip, 
  Legend 
} from "chart.js";
import api from "../services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false }
    },
    y: {
      beginAtZero: true,
      grid: { color: "#737cd01a" }
    }
  }
};

function Grafico() {
  const [vendas, setVendas] = useState(Array(12).fill(0));

  useEffect(() => {
    api.get("/orcamentos/vendas-mensais")
      .then((resposta) => {
        setVendas(resposta.data);
      })
      .catch((erro) => {
        console.error("Erro ao carregar dados do gráfico:", erro);
      });
  }, []);

  const data = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    datasets: [
      {
        label: "Vendas (R$)",
        data: vendas,
        backgroundColor: "#143a80",
        barThickness: 25,
        borderRadius: 10,
        animation: {
          duration: 1200,
          easing: "easeOutBounce"
        }
      }
    ]
  };

  return <Bar className="grafico" data={data} options={chartOptions} />;
}

export default Grafico;