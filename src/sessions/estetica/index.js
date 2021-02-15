const venom = require('venom-bot');



module.exports = class EsteticaClass{
    constructor(){
        this.servico;
        this.clients = {};
    }

    iniciar(){
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
                    if(state === 'Conectado'){
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
                let idMensagem = message.chatId;
                let nome = message.chat.name;
                if(message.chat.kind === 'chat'){
                    this.logMensagens(message);

                    if(this.clients[idMensagem] === undefined){
                        this.clients[idMensagem] = {
                            'nome' : message.chat.name,
                            'reposta' : 0
                        };

                        client.sendText(
                            idMensagem, 
                            'Seja bem vinda \n A Paz de Jesus e o Amor de Maria!!'
                        );

                        this.navegaPerguntas(idMensagem, 0);

                    }else{
                        this.navegaPerguntas(idMensagem, this.clients[idMensagem].reposta);
                    }   
                }
            }).catch((erro) => {
                console.log('Erro ao enviar mensagem:' , erro);
            });
        });
    }

    navegaPerguntas(idMensagem, opcao){
        switch(opcao){
            case 0:
                // let retorno = selecionaOpcao_1(this.servico, idMensagem);
                // this.atualizaCliente(idMensagem, retorno.opcao, retorno.resposta);
                this.servico.sendText(
                    idMensagem, 
                    'Esta é a Estetica da Juliana!! \n'
                    + 'O que deseja fazer? \n'
                    + '1 - Marcar Horario; \n'
                    + '2 - Remarcar Horario; \n'
                    + '3 - Cancelar Hora Marcada; \n'
                    + '4 - Tirar uma dúvida. \n'
                );

                this.atualizaCliente(idMensagem, 1, 0);
            break;

            case 1:
                this.servico.sendText(
                    idMensagem, 
                    'Opções em Desenvolvimento'
                );

                this.atualizaCliente(idMensagem, 3, 0);
            break;

            case 2:
                this.servico.sendText(
                    idMensagem, 
                    'Opções em Desenvolvimento'
                );

                this.atualizaCliente(idMensagem, 1, 0);
            break;
        }
    }

    atualizaCliente(idMensagem, opcao, resposta){
        this.clients[idMensagem].opcao = opcao;
        this.clients[idMensagem].resposta = resposta;
    }




    logMensagens(message){
        console.log(
            'Mensagem de ' + message.chat.name +  ':\n' + message.body
        );
    }
}