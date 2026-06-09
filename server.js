document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const pseudoInput = document.getElementById('pseudo-input');
    const anonymousCheckbox = document.getElementById('anonymous-checkbox');
    const connectionStatus = document.getElementById('connection-status');
    
    // État de l'application
    let isConnected = false;
    let messages = [];
    let pseudo = localStorage.getItem('chatPseudo') || '';
    let isAnonymous = localStorage.getItem('chatAnonymous') === 'true';
    
    // Initialisation
    pseudoInput.value = pseudo;
    anonymousCheckbox.checked = isAnonymous;
    updatePseudoState();
    
    // Connexion Socket.IO
    const socket = io();
    
    socket.on('connect', () => {
        isConnected = true;
        connectionStatus.textContent = 'Connecté au serveur';
        connectionStatus.classList.add('connected');
        addSystemMessage('Bienvenue sur le chat simple ! Vous pouvez maintenant discuter.');
    });
    
    socket.on('disconnect', () => {
        isConnected = false;
        connectionStatus.textContent = 'Déconnecté du serveur';
        connectionStatus.classList.remove('connected');
        addSystemMessage('Connexion au serveur perdue. Tentative de reconnexion...');
    });
    
    socket.on('previous_messages', (previousMessages) => {
        previousMessages.forEach(message => {
            message.isOwn = false;
            addMessage(message);
        });
    });
    
    socket.on('new_message', (message) => {
        message.isOwn = false;
        addMessage(message);
    });
    
    // Gestionnaires d'événements
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    pseudoInput.addEventListener('change', function() {
        pseudo = pseudoInput.value.trim();
        localStorage.setItem('chatPseudo', pseudo);
    });
    
    anonymousCheckbox.addEventListener('change', function() {
        isAnonymous = anonymousCheckbox.checked;
        localStorage.setItem('chatAnonymous', isAnonymous.toString());
        updatePseudoState();
    });
    
    // Fonctions
    function updatePseudoState() {
        pseudoInput.disabled = isAnonymous;
        if (isAnonymous) {
            pseudoInput.style.opacity = '0.5';
        } else {
            pseudoInput.style.opacity = '1';
        }
    }
    
    function sendMessage() {
        const messageText = messageInput.value.trim();
        
        if (!messageText) return;
        if (!isConnected) {
            addSystemMessage('Impossible d\'envoyer le message : non connecté au serveur.');
            return;
        }
        
        // Déterminer le pseudo à afficher
        const displayPseudo = isAnonymous ? 'Anonyme' : (pseudo || 'Utilisateur');
        
        // Envoyer le message au serveur
        socket.emit('send_message', {
            text: messageText,
            sender: displayPseudo
        });
        
        // Créer le message pour l'affichage local
        const message = {
            id: Date.now(),
            text: messageText,
            sender: displayPseudo,
            timestamp: new Date(),
            isOwn: true
        };
        
        // Ajouter le message à l'interface
        addMessage(message);
        
        // Vider le champ de saisie
        messageInput.value = '';
    }
    
    function addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
       
