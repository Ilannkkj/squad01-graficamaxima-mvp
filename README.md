# 📊 Sistema Gráfica Máxima — Fullstack

Este é o sistema de gestão e orçamentos da **Gráfica Máxima**. A aplicação foi desenvolvida seguindo uma arquitetura moderna dividida em duas partes: um servidor **Back-end** (Node.js/Express) integrado ao banco de dados e um painel **Front-end** dinâmico (React.js com Vite).

O ecossistema conta com um Dashboard completo, fluxo em 3 etapas para criação e edição de orçamentos, gerenciamento de insumos e uma calculadora flutuante global em m² (estilo janela suspensa).

---

## ⚠️ IMPORTANTE ANTES DE COMEÇAR

Para que a aplicação funcione 100% (carregando os acabamentos, salvando os registros e processando os cálculos reais), certifique-se de configurar o ambiente na seguinte ordem:

1. **XAMPP:** Abra o painel do **XAMPP** (ou seu gerenciador local equivalente) e ative os módulos **Apache e MySQL**.
2. **Banco de Dados (Localização):** O script SQL ou dump para inicialização do banco de dados está localizado estritamente dentro da pasta do Back-end, no diretório:
   👉 `Grafica-Maxima-Backend/database/`  
   *Certifique-se de importar este arquivo no seu MySQL (via phpMyAdmin) antes de rodar as aplicações.*
3. **Nota sobre as pastas `node_modules`:** Devido a problemas críticos de ambiente e instabilidades enfrentadas durante o desenvolvimento, as pastas `node_modules` foram inclusas temporariamente no repositório para garantir que a aplicação não quebrasse ao ser clonada nesta máquina. 

---

## 🚀 Como Rodar a Aplicação

Como o sistema é dividido, você precisará abrir **dois terminais separados** no seu computador para subir os dois servidores simultaneamente.

### 1️⃣ Passo: Inicializando o Back-end
Abra o seu primeiro terminal, garanta que está na pasta raiz do projeto e execute os comandos:

```bash
# Entre na pasta do Back-end
cd Grafica-Maxima-Backend

# (Opcional) Se houver qualquer falha ou conflito com o node_modules que foi upado,
# exclua a pasta node_modules, o arquivo package-lock.json e force a reinstalação:
npm install

# Inicie o servidor da API
npm run dev
