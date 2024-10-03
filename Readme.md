-- integração com o banco mysql --

const Sequelize = require('sequelize');
const sequelize = new Sequelize('siteingresso', 'root', 'VtL@23190418@',{
    dialect: 'mysql',
    host: 'localhost',
    port: 3306
});

//Verificar se a conexão com o bando de dados 
sequelize.authenticate().then(function(){
    console.log("Conectado com sucesso!")
}).catch(function(erro){
    console.log("Falha ao se conectar" +erro)
});

//module.exports = sequelize;