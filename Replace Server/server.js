const express = require("express");
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());

/* =====================================================
   PROMETHEUS CONFIG
===================================================== */

// Coleta métricas padrão do Node.js
client.collectDefaultMetrics();

// Contador de requisições
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total de requisições HTTP",
  labelNames: ["method", "route", "status"],
});

// Tempo de resposta
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duração das requisições HTTP",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

/* =====================================================
   MIDDLEWARES
===================================================== */

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware de monitoramento Prometheus
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });

    end({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });

  next();
});

/* =====================================================
   BANCO DE DADOS EM MEMÓRIA
===================================================== */

let usuarios = [
  { id: "1", nome: "Alice Silva", email: "alice@email.com", idade: 28 },
  { id: "2", nome: "Bruno Costa", email: "bruno@email.com", idade: 34 },
  { id: "3", nome: "Carla Souza", email: "carla@email.com", idade: 22 },
];

let produtos = [
  { id: "1", nome: "Notebook", preco: 3500.0, estoque: 10 },
  { id: "2", nome: "Mouse", preco: 89.9, estoque: 50 },
  { id: "3", nome: "Teclado", preco: 149.9, estoque: 30 },
];

const credenciais = [
  { usuario: "admin", senha: "admin123", perfil: "administrador" },
  { usuario: "qa_tester", senha: "teste123", perfil: "testador" },
  { usuario: "user01", senha: "senha01", perfil: "usuario" },
];

let proximoId = 100;

const novoId = () => String(proximoId++);

/* =====================================================
   ROTAS AUTH
===================================================== */

app.post("/auth/login", (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Usuário e senha são obrigatórios",
    });
  }

  const conta = credenciais.find(
    (c) => c.usuario === usuario && c.senha === senha
  );

  if (!conta) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Credenciais inválidas",
    });
  }

  const token = Buffer.from(`${usuario}:${Date.now()}`).toString("base64");

  res.json({
    sucesso: true,
    mensagem: "Login realizado com sucesso",
    token,
    perfil: conta.perfil,
  });
});

app.post("/auth/logout", (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "Logout realizado com sucesso",
  });
});

/* =====================================================
   ROTAS USUÁRIOS
===================================================== */

app.get("/usuarios", (req, res) => {
  res.json({
    sucesso: true,
    total: usuarios.length,
    dados: usuarios,
  });
});

app.get("/usuarios/:id", (req, res) => {
  const usuario = usuarios.find((u) => u.id === req.params.id);

  if (!usuario) {
    return res.status(404).json({
      sucesso: false,
      mensagem: "Usuário não encontrado",
    });
  }

  res.json({
    sucesso: true,
    dados: usuario,
  });
});

app.post("/usuarios", (req, res) => {
  const { nome, email, idade } = req.body;

  if (!nome || !email) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Nome e email são obrigatórios",
    });
  }

  if (usuarios.find((u) => u.email === email)) {
    return res.status(409).json({
      sucesso: false,
      mensagem: "Email já cadastrado",
    });
  }

  const novo = {
    id: novoId(),
    nome,
    email,
    idade: idade || null,
  };

  usuarios.push(novo);

  res.status(201).json({
    sucesso: true,
    mensagem: "Usuário criado com sucesso",
    dados: novo,
  });
});

app.put("/usuarios/:id", (req, res) => {
  const index = usuarios.findIndex((u) => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      sucesso: false,
      mensagem: "Usuário não encontrado",
    });
  }

  const { nome, email, idade } = req.body;

  usuarios[index] = {
    ...usuarios[index],
    nome,
    email,
    idade,
  };

  res.json({
    sucesso: true,
    mensagem: "Usuário atualizado",
    dados: usuarios[index],
  });
});

app.delete("/usuarios/:id", (req, res) => {
  const index = usuarios.findIndex((u) => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      sucesso: false,
      mensagem: "Usuário não encontrado",
    });
  }

  usuarios.splice(index, 1);

  res.json({
    sucesso: true,
    mensagem: "Usuário removido com sucesso",
  });
});

/* =====================================================
   ROTAS PRODUTOS
===================================================== */

app.get("/produtos", (req, res) => {
  const delay = parseInt(req.query.delay) || 0;

  setTimeout(() => {
    res.json({
      sucesso: true,
      total: produtos.length,
      dados: produtos,
    });
  }, delay);
});

app.get("/produtos/:id", (req, res) => {
  const produto = produtos.find((p) => p.id === req.params.id);

  if (!produto) {
    return res.status(404).json({
      sucesso: false,
      mensagem: "Produto não encontrado",
    });
  }

  res.json({
    sucesso: true,
    dados: produto,
  });
});

app.post("/produtos", (req, res) => {
  const { nome, preco, estoque } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Nome e preço são obrigatórios",
    });
  }

  if (preco < 0) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Preço não pode ser negativo",
    });
  }

  const novo = {
    id: novoId(),
    nome,
    preco,
    estoque: estoque || 0,
  };

  produtos.push(novo);

  res.status(201).json({
    sucesso: true,
    mensagem: "Produto criado com sucesso",
    dados: novo,
  });
});

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    memoria: `${Math.round(
      process.memoryUsage().heapUsed / 1024 / 1024
    )}MB`,
  });
});

/* =====================================================
   METRICS
===================================================== */

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

/* =====================================================
   HOME
===================================================== */

app.get("/", (req, res) => {
  res.json({
    status: "online",
    mensagem: "API de Simulação para Testes",
    endpoints: {
      auth: ["/auth/login", "/auth/logout"],
      usuarios: ["/usuarios"],
      produtos: ["/produtos"],
      health: ["/health"],
      metrics: ["/metrics"],
    },
  });
});

/* =====================================================
   404
===================================================== */

app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: `Rota ${req.method} ${req.url} não encontrada`,
  });
});

/* =====================================================
   START SERVER
===================================================== */

app.listen(PORT, () => {
  console.log(`\n🚀 API rodando em http://localhost:${PORT}`);
  console.log(`📋 Endpoints: http://localhost:${PORT}/`);
  console.log(`❤️  Health:    http://localhost:${PORT}/health`);
  console.log(`📊 Metrics:   http://localhost:${PORT}/metrics\n`);
});