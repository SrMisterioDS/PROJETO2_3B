const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3002;
const saltRounds = 10;

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


// Configurar body-parser para manipular dados de formulários
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar sessões
app.use(session({
    secret: 'seu-segredo-aqui', // Troque por um segredo forte e único
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Ajuste para `true` se estiver usando HTTPS
}));

// Middleware para verificar se o usuário está autenticado
const verificarAutenticacao = (req, res, next) => {
    if (req.session.user) {
        return next(); // Usuário autenticado, continue
    }
    res.status(401).json({ error: 'Usuário não autenticado. Faça login para continuar.' });
};

// Servir arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao banco de dados SQLite
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Criar tabelas se não existirem
db.serialize(() => {
    // Tabela de eventos
    db.run(`CREATE TABLE IF NOT EXISTS eventos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        descricao TEXT,
        quantidade_ingressos INTEGER,
        tipo_ingresso TEXT,
        preco REAL,
        imagem_url TEXT,
        data TEXT,
        fornecedor_id INTEGER
    )`);

    // Tabela de usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        cpf TEXT,
        cnpj TEXT,
        endereco TEXT,
        senha TEXT,
        tipo_usuario TEXT
    )`);
});

// Rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cadastro.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/cadastrar_evento', verificarAutenticacao, (req, res) => {
    if (req.session.user && req.session.user.tipo_usuario === 'fornecedor') {
        res.sendFile(path.join(__dirname, 'views', 'cadastrar_evento.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/evento.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'evento.html'));
});

// Rota de compra, agora protegida
app.get('/compra.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'compra.html'));
});

// Adicionar rotas para dashboards
app.get('/dashboard-cliente.html', verificarAutenticacao, (req, res) => {
    if (req.session.user && req.session.user.tipo_usuario === 'usuario') {
        res.sendFile(path.join(__dirname, 'views', 'dashboard-cliente.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-fornecedor.html', verificarAutenticacao, (req, res) => {
    if (req.session.user && req.session.user.tipo_usuario === 'fornecedor') {
        res.sendFile(path.join(__dirname, 'views', 'dashboard-fornecedor.html'));
    } else {
        res.redirect('/login');
    }
});

// Endpoint para cadastrar eventos
app.post('/api/cadastrar_evento', verificarAutenticacao, (req, res) => {
    if (req.session.user && req.session.user.tipo_usuario !== 'fornecedor') {
        return res.status(403).json({ error: 'Acesso negado' });
    }

    const fornecedorId = req.session.user.id;
    const { nome, descricao, data, quantidade_ingressos, tipo_ingresso, preco, imagem_url } = req.body;
    

    if (nome === "" || !validarNome(nome)) {
        return res.status(400).json({ error: 'Insira o nome completo, o nome deve conter apenas letras.' });
    }


    const sql = `INSERT INTO eventos (nome, descricao, data, quantidade_ingressos, tipo_ingresso, preco, imagem_url, fornecedor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [nome, descricao, data, quantidade_ingressos, tipo_ingresso, preco, imagem_url, fornecedorId];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        req.session.successMessage = 'Evento cadastrado com sucesso!';
        res.redirect('/dashboard-fornecedor.html');
    });
});

// Função para validar e-mail
const validarEmail = (email) => {
    // Regex que garante o ponto após o provedor
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/

    return regex.test(email);
}; 

// Função para validar nome
const validarNome = (nome) => {
    const regex = /^[a-zA-ZÀ-ÖØ-ö¸-ÿ\s]+ [A-Za-zÀ-ÖØ-öø-ÿ]+.*$/; // Permite letras e espaços
    return nome.length > 7 && regex.test(nome);
};

// Função para validar CPF
const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false; // CPF deve ter 11 dígitos e não pode ser igual a todos os dígitos
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    }
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(9))) {
        return false;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
    }
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    return resto === parseInt(cpf.charAt(10));
};

// Função para validar CNPJ
const validarCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        return false; // CNPJ deve ter 14 dígitos e não pode ser igual a todos os dígitos
    }

    let soma = 0;
    let peso = 5;

    for (let i = 0; i < 12; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;

    if (digito1 !== parseInt(cnpj.charAt(12))) {
        return false;
    }

    soma = 0;
    peso = 6;

    for (let i = 0; i < 13; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;

    return digito2 === parseInt(cnpj.charAt(13));
};

// Endpoint de login
app.post('/api/login', (req, res) => {
    console.log('Recebido:', req.body);
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const sql = `SELECT * FROM usuarios WHERE email = ?`;
    db.get(sql, [email], (err, user) => {
        if (err) {
            console.error('Erro ao verificar o e-mail:', err.message);
            return res.status(500).json({ error: 'Erro ao verificar o e-mail.' });
        }
        if (!user) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        bcrypt.compare(senha, user.senha, (err, result) => {
            if (err) {
                console.error('Erro ao verificar a senha:', err.message);
                return res.status(500).json({ error: 'Erro ao verificar a senha.' });
            }
            if (result) {
                req.session.user = user;
                if (user.tipo_usuario === 'usuario') {
                    res.json({ redirect: '/dashboard-cliente.html' });
                } else if (user.tipo_usuario === 'fornecedor') {
                    res.json({ redirect: '/dashboard-fornecedor.html' });
                } else {
                    res.status(400).json({ error: 'Tipo de usuário desconhecido' });
                }
            } else {
                res.status(401).json({ error: 'E-mail ou senha incorretos.' });
            }
        });
    });
});

// Endpoint para cadastrar usuários
app.post('/api/cadastrar_usuario', async (req, res) => {
    const { nome, email, cpf, cnpj, endereco, senha, confirmar_senha, tipo_usuario } = req.body;

    if (!nome || !email || !endereco || !senha || !tipo_usuario) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    if (tipo_usuario === 'usuario' && (!cpf || !validarCPF(cpf))) {
        return res.status(400).json({ error: 'Usuários normais precisam fornecer um CPF válido.' });
    }

    if (tipo_usuario === 'fornecedor' && (!cnpj || !validarCNPJ(cnpj))) {
        return res.status(400).json({ error: 'Fornecedores precisam fornecer um CNPJ válido.' });
    }

    if (email === ""|| !validarEmail(email)) {
        return res.status(400).json({ error: 'Fornecedores precisam fornecer um Email válido.' });
    }

    if (nome === "" || !validarNome(nome)) {
        return res.status(400).json({ error: 'Insira o nome completo, o nome deve conter apenas letras.' });
    }

    if (senha !== confirmar_senha) {
        return res.status(400).json({ error: 'As senhas não coincidem.' });
    }

    const sqlCheckEmail = `SELECT * FROM usuarios WHERE email = ?`;
    db.get(sqlCheckEmail, [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            return res.status(400).json({ error: 'O e-mail já está em uso.' });
        }

        bcrypt.hash(senha, saltRounds, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao encriptar a senha.' });
            }

            const sqlInsertUser = `
                INSERT INTO usuarios (nome, email, cpf, cnpj, endereco, senha, tipo_usuario)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                nome,
                email,
                tipo_usuario === 'usuario' ? cpf : null,
                tipo_usuario === 'fornecedor' ? cnpj : null,
                endereco,
                hashedPassword,
                tipo_usuario
            ];

            db.run(sqlInsertUser, params, function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({
                    message: 'Usuário cadastrado com sucesso!',
                    redirect: '/login'
                });
            });
        });
    });
});

// Endpoint para listar eventos
app.get('/api/eventos', (req, res) => {
    const sql = `SELECT * FROM eventos`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: "Sucesso",
            data: rows
        });
    });
});

// Endpoint para listar eventos do fornecedor autenticado
app.get('/api/meus-eventos', verificarAutenticacao, (req, res) => {
    if (req.session.user.tipo_usuario !== 'fornecedor') {
        return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const fornecedorId = req.session.user.id; // Pegando o ID do fornecedor da sessão
    const sql = `SELECT * FROM eventos WHERE fornecedor_id = ?`; // Verifique se você tem um campo fornecedor_id na tabela de eventos

    db.all(sql, [fornecedorId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'Sucesso',
            data: rows
        });
    });
});

// Endpoint para obter detalhes de um evento específico
app.get('/api/eventos/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = `SELECT * FROM eventos WHERE id = ?`;
    db.get(sql, [eventId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json({
                message: 'Sucesso',
                data: row
            });
        } else {
            res.status(404).json({ message: 'Evento não encontrado' });
        }
    });
});

// Endpoint para deletar um evento
app.delete('/api/eventos/:id', verificarAutenticacao, (req, res) => {
    const eventId = req.params.id;
    const sql = `DELETE FROM eventos WHERE id = ?`;

    db.run(sql, [eventId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Evento não encontrado' });
        }
        res.json({ message: 'Evento deletado com sucesso!' });
    });
});

// Endpoint para logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao encerrar a sessão:', err.message);
            return res.status(500).send('Erro ao encerrar a sessão.');
        }
        res.redirect('/'); // Redirecionar para a página inicial após logout
    });
});

// Endpoint para verificar autenticação
app.get('/api/verificar-autenticacao', (req, res) => {
    if (req.session.user) { // Verifica se o usuário está autenticado
        res.json({ autenticado: true });
    } else {
        res.json({ autenticado: false });
    }
});

