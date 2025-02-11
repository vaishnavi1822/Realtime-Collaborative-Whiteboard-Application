let express = require('express');
let app = express();
let httpServer = require('http').createServer(app);
let io = require('socket.io')(httpServer);
let connections = [];

io.on('connect', (socket) => {
    connections.push(socket);
    console.log(`${socket.id} has connected`);

    // Handle drawing
    socket.on('draw', (data) => {
        connections.forEach((con) => {
            if (con.id !== socket.id) {
                con.emit("ondraw", { 
                    x: data.x, 
                    y: data.y, 
                    lastX: data.lastX, 
                    lastY: data.lastY,
                    currentColor: data.currentColor, 
                    currentThickness: data.currentThickness 
                });
            }
        });
    });

    // Handle mouse down event
    socket.on('down', (data) => {
        connections.forEach(con => {
            if (con.id !== socket.id) {
                con.emit('ondown', { x: data.x, y: data.y });
            }
        });
    });

    // Handle canvas clear command
    socket.on('clear', () => {
        connections.forEach(con => {
            if (con.id !== socket.id) {
                con.emit('clear');
            }
        });
    });

    socket.on('disconnect', () => {
        connections = connections.filter((con) => con.id !== socket.id);
        console.log(`${socket.id} has disconnected`);
    });
});

app.use(express.static('public'));

let PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
