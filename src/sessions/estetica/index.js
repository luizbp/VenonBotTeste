const venom = require('venom-bot');

var opcoes = require('./opcoes/opcoes.json');



module.exports = class EsteticaClass {
    constructor() {
        this.servico;
        this.clients = {};
    }

    iniciar() {
        venom
            .create(
                'sessionName',
                undefined,
                (statusSession, session) => {
                    console.log('Status Session: ', statusSession);
                    console.log('Session name: ', session);
                },
            )
            .then((client) => {
                this.servico = client;
                let time = 0;
                client.onStreamChange((state) => {
                    console.log('Connection status: ', state);
                    clearTimeout(time);
                    if (state === 'Conectado') {
                        start(client);
                    }
                    if (state === 'Desconectado' || state === 'Sincronizando') {
                        time = setTimeout(() => {
                            client.close();
                        }, 80000);
                    }
                }).catch((erro) => {
                    console.log('Ocorreu um erro na inicialização do BOOT', erro);
                });

                // Listen to messages
                client.onMessage(message => {
                    try {
                        let idMensagem = message.chatId; //PESSOA QUE MANDOU A MENSAGEM
                        let nome = message.chat.name; // NOME DA PESSOA
                        let msg = message.body; //MENSAGEM ENVIADA
                        if (message.chat.kind === 'chat') { // SE É CHAT PRIVADO

                            this.logMensagens(message); //LOGA NO CONSOLE QUEM MANDOU A MENSAGEM 

                            if (this.clients[idMensagem] === undefined) {
                                this.clients[idMensagem] = {
                                    'nome': message.chat.name,
                                    'respostas': [0],
                                    'dta_criacao': Date.now(),
                                    'ind_bot': true
                                };

                                this.navegaPerguntas(idMensagem, this.clients[idMensagem].respostas);

                            } else {

                                if (!this.statusUsuario(idMensagem)) {
                                    return 0;
                                }
                                this.atualizaCliente(idMensagem, msg);
                                this.navegaPerguntas(idMensagem, this.clients[idMensagem].respostas);
                            }
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                }).catch((erro) => {
                    console.log('Erro ao enviar mensagem:', erro);
                });
            });
    }

    navegaPerguntas(idMensagem, resposta) {
        console.log(this.clients[idMensagem].respostas);
        if (resposta[1] == undefined) {
            this.servico.sendText(
                idMensagem,
                opcoes[0][0]
            );
        } else {
            if (!isNaN(resposta[1])) {
                switch (resposta[1] - 1) { // -1 POIS AS OPÇÕES COMEÇÃO DE 1 E O INDICE EM 0
                    case 0:
                        this.servico.sendText(
                            idMensagem,
                            opcoes[0][1][0]
                        );
                        this.atualizaCliente(idMensagem, "", 'B');
                        break;
                    case 1:
                        if (resposta[2] == undefined) {
                            this.servico.sendText(
                                idMensagem,
                                opcoes[0][1][1][0]
                            );
                        } else {
                            this.servico.sendText(
                                idMensagem,
                                opcoes[0][1][1][1][0]
                            );
                            this.atualizaCliente(idMensagem, "", 'B');
                        }
                        break;
                    case 2:
                        this.servico.sendText(
                            idMensagem,
                            opcoes[0][1][2]
                        );
                        this.atualizaCliente(idMensagem, "", 'B');
                        break;
                    default:
                        this.servico.sendText(
                            idMensagem,
                            "Atenção, opção inválida"
                        );
                        this.atualizaCliente(idMensagem, "", "D");
                        break;
                }
            } else {
                this.servico.sendText(
                    idMensagem,
                    "Atenção, opção inválida"
                );
                this.atualizaCliente(idMensagem, "", "D");
            }
        }
    }

    atualizaCliente(idMensagem, resposta, acao = 'I') {
        /* Acao: 
            "I" para inserir; 
            "D" para deletar;
            "Z" para zerar;
            "B" para invativar o BOT
        */

        // console.log(this.clients[idMensagem]);
        // return;

        if (acao == 'I') {
            this.clients[idMensagem].respostas.push(resposta);
        } else if (acao == 'D') {
            this.clients[idMensagem].respostas.pop();
        } else if (acao == 'B') {
            this.clients[idMensagem].ind_bot = false;
        }
    }

    statusUsuario(idMensagem) {
        return this.clients[idMensagem].ind_bot;
    }




    logMensagens(message) {
        console.log(
            'Mensagem de ' + message.chat.name + ':\n' + message.body
        );
    }
}