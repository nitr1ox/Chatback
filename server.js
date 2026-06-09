const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Permet toutes les origines pour le développement
    methods: ["GET", "POST"]
  }
});

// Configuration pour Render
const PORT = process.env.PORT || 3000;

// Stockage des messages en mémoire
let messages = [];

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');
    
    // Envoyer l'historique des messages
    socket.emit('previous_messages', messages);
    
    // Gérer les nouveaux messages
    socket.on('send_message', (data) => {
        const message = {
            id: Date.now(),
            text: data.text,
            sender: data.sender,
            timestamp: new Date(),
            isOwn: false
        };
        
        messages.push(message);
        
        // Diffuser le message à tous les utilisateurs
        io.emit('new_message', message);
    });
    
    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
