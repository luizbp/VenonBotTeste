
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json';


module.exports = class ApiGoogleAgendaController{

    _oAuth2Client;

    constructor(){
        this._initConection();
    }


    _initConection(){
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Erro ao acessar o arquivo secreto', err);
            this._authorize(JSON.parse(content));
        });
    }

    _authorize(credentials) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        this._oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
    
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return this._getAccessToken(this._oAuth2Client);
            this._oAuth2Client.setCredentials(JSON.parse(token));
            console.log('Conectado com sucesso!');
        });
    }
    
    
    _getAccessToken() {
        const authUrl = this._oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Para autorizar a aplicação, visite o URL:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Clique no link acima para obter o codigo e cole aqui: ', (code) => {
            rl.close();
            this._oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Erro ao acessar o token', err);
                this._oAuth2Client.setCredentials(token);
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
            });
        });
    }


    listarEventos() {
        const calendar = google.calendar({ version: 'v3', auth: this._oAuth2Client });
        calendar.events.list({
            calendarId: 'eskqiihp2rk8ko09uqk67gpr68@group.calendar.google.com',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const events = res.data.items;
            if (events.length) {
                console.log('Upcoming 10 events:');
                events.map((event, i) => {
                    const start = event.end.dateTime || event.start.date;
                    console.log(`${start} - ${event.summary}`);
                });
            } else {
                console.log('No upcoming events found.');
            }
        });
    }


    insertEvents(auth){
        const calendar = google.calendar({version: 'v3', auth});
        calendar.events.insert({
            calendarId: 'eskqiihp2rk8ko09uqk67gpr68@group.calendar.google.com',
    
        })
    }

}