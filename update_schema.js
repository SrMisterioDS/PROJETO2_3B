const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o banco de dados SQLite
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Função para atualizar o esquema do banco de dados
function updateSchema() {
    /*db.serialize(() => {
        Adicionar coluna imagem_url à tabela eventos
        db.run(`ALTER TABLE eventos ADD COLUMN imagem_url TEXT`, (err) => {
            if (err) {
                console.error('Erro ao adicionar a coluna imagem_url:', err.message);
            } else {
                console.log('Coluna imagem_url adicionada com sucesso.');
            }
        });*/

        db.serialize(() => {
            db.run(`ALTER TABLE usuarios DROP COLUMN sobrenome`, (err) => {
            if (err) {
                console.error('Erro ao adicionar a coluna sobrenome:', err.message);
            } else {
                console.log('Coluna sobrenome adicionada com sucesso.');
            }
        });
    });

        /* Adicionar coluna data à tabela eventos
        db.run(`ALTER TABLE eventos ADD COLUMN data TEXT`, (err) => {
            if (err) {
                console.error('Erro ao adicionar a coluna data:', err.message);
            } else {
                console.log('Coluna data adicionada com sucesso.');
            }
        });

        db.run(`ALTER TABLE eventos ADD COLUMN fornecedor_id INTEGER`, (err) => {
            if (err) {
                console.error('Erro ao adicionar a coluna data:', err.message);
            } else {
                console.log('Coluna data adicionada com sucesso.');
            }
        });
    });*/
}

// Executar a atualização do esquema
updateSchema();

// Fechar a conexão com o banco de dados
db.close((err) => {
    if (err) {
        console.error('Erro ao fechar a conexão com o banco de dados:', err.message);
    } else {
        console.log('Conexão com o banco de dados fechada.');
    }
});
