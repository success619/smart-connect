const io = require("socket.io")(8900, {
    cors: {
        origin: "http://localhost:3001"
    }
})

let users = []

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId })
}


const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}


const getUser = (recieverId) => {
    return users.find(user => user.userId === recieverId)
}


io.on("connection", (socket) => {
    console.log("a user connected")
    io.emit("welcome", "hello welcome this is socket server");


    //  Take userId and socketId from user
    socket.on("AddUserToActive", (userId) => {
        if (userId !== null && userId !== undefined) {
            addUser(userId, socket.id);
            io.emit("getActiveUsers", users);
            console.log("the user id = ", userId)
        }
    })


    // send and get instant messages
    socket.on("sendMessage", ({ senderId, text, recieverId }) => {
        const user = getUser(recieverId);
        io.to(user.socketId).emit("getMessage", {
            senderId,
            text
        })
    })




    // user disconnected or go offline
    socket.on("disconnect", () => {
        console.log("a user disconnected")
        removeUser(socket.id)
        io.emit("getActiveUsers", users);
    })
})

