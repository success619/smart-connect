const io = require("socket.io")(8900, {
    cors: {
        origin: "http://localhost:3001"
    }
})

let users = []

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId })
    console.log(users)
}


const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
    console.log(users)
}


const getUser = (recieverId) => {
    return users.find(user => user.userId === recieverId)
}

const getUserAllConnects = (allConnects) => {
    return users.filter(f => allConnects.some(u => u.userId === f.userId))
}

io.on("connection", (socket) => {
    console.log("a user connected")
    io.emit("welcome", "hello welcome this is socket server");


    //  Take userId and socketId from user
    socket.on("AddUserToActive", (userId) => {
        if (userId !== null && userId !== undefined) {
            addUser(userId, socket.id);
            io.emit("getActiveUsers", users);
            // console.log("the user id = ", userId)
        }
    })


    // send and get instant messages
    socket.on("sendMessage", ({ senderId, text, recieverId }) => {
        const user = getUser(recieverId);
        if (user?.socketId) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                text
            })
        }
    })


    // send and get instant notifications
    socket.on("sendPostNotficationToAllConnects", ([postNotification, allConnect]) => {
        const allActiveConnects = getUserAllConnects(allConnect);
        for (let index = 0; index < allActiveConnects.length; index++) {
            const user = allActiveConnects[index];
            io.to(user.socketId).emit("getInstantNotifications", postNotification)
            console.log(postNotification)
        }
    })

    socket.on("postFollowerNotificationToUserIfActive", (req) => {
        const user = getUser(req.user_id)
        if (user.socketId) {
            io.to(user.socketId).emit("getInstantFollowerNotification", req)
        }
        console.log(user, req)
    })


    // user disconnected or go offline
    socket.on("disconnect", () => {
        console.log("a user disconnected")
        removeUser(socket.id)
        io.emit("getActiveUsers", users);
    })
})

