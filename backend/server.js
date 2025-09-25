import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js"; // Importando conexão com MongoDB
import clienteRoutes from "./routes/clienteRoutes.js"; // Importar rotas de clientes
import authRoutes from "./routes/authRoutes.js"; // Importar rotas de autenticação
import questionarioRoutes from "./routes/questionarioRoutes.js"; // Importar rotas de questionário
import gerenteRoutes from "./routes/gerenteRoutes.js"; // Importar rotas de gerente
import agendamentoRoutes from "./routes/agendamentos.js"; // Importar rotas de agendamentos
import mongoose from "mongoose"; // Importe o mongoose

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Conectar ao banco de dados antes de iniciar o servidor
connectDB();

const app = express();

// Configuração de CORS - DEVE VIR PRIMEIRO! 
// Configurar CORS com opções mais permissivas para desenvolvimento
app.use(cors({
  origin: '*', // Permitir todas as origens para desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Adicionar OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


app.use(express.json()); // Permite receber JSON no body das requisições

// Rota de teste
app.get("/", (req, res) => {
  res.send("API do meu SaaS está rodando!");
});

// Rota de diagnóstico do banco de dados
app.get("/api/db-status", async (req, res) => {
  try {
    // Verificar conexão
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: "Desconectado",
      1: "Conectado",
      2: "Conectando",
      3: "Desconectando",
    };
    
    // Listar todas as coleções
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionStats = [];
    
    // Obter contagem de documentos para cada coleção
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      collectionStats.push({
        name: collection.name,
        documentCount: count
      });
    }
    
    res.json({
      status: "Sucesso",
      connection: {
        status: dbStatus[dbState],
        database: mongoose.connection.name,
        host: mongoose.connection.host,
      },
      collections: collectionStats
    });
  } catch (error) {
    res.status(500).json({
      status: "Erro",
      message: error.message,
      details: error.toString()
    });
  }
});

// Adicionar rotas da API
app.use("/api/clientes", clienteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/questionarios", questionarioRoutes);
app.use("/api/gerente", gerenteRoutes);
app.use("/api/agendamentos", agendamentoRoutes);

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../dist')));

// Todas as outras rotas retornam o index.html (para SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
});

