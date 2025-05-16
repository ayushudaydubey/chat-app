import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io("http://localhost:3000");

const App = () => {
  const [username, setUsername] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [toUser, setToUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  useEffect(() => {
    const handlePrivateMessage = ({ fromUser, toUser: recipient, message }) => {
      setMessages((prev) => [...prev, { fromUser, toUser: recipient, message }]);
    };

    const handleUpdateUsers = (users) => {
      setRegisteredUsers(users.filter(user => user !== username));
    };

    socket.on("receive-private", handlePrivateMessage);
    socket.on("update-users", handleUpdateUsers);

    return () => {
      socket.off("receive-private", handlePrivateMessage);
      socket.off("update-users", handleUpdateUsers);
    };
  }, [username]);

  const handleRegister = () => {
    if (username.trim()) {
      socket.emit("register-user", username);
      setIsRegistered(true);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (toUser && message.trim()) {
      socket.emit("private-message", { fromUser: username, toUser, message });
      setMessages((prev) => [...prev, { fromUser: "You", toUser, message }]);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-blue-400 to-purple-300 flex items-center justify-center p-6">
      {!isRegistered ? (
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Welcome 👋</h2>
          <p className="text-sm text-gray-500 text-center mb-4">Enter a username to join chat</p>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleRegister}
            className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition"
          >
            Join Chat
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-6xl h-[80vh] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          {/* Sidebar */}
          <div className="w-1/4 bg-gray-100 p-4 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Online Users</h3>
            {registeredUsers.length === 0 && <p className="text-sm text-gray-500">No users available</p>}
            {registeredUsers.map((user, index) => (
              <div
                key={index}
                onClick={() => setToUser(user)}
                className={`cursor-pointer p-3 rounded-xl mb-2 transition-all font-medium text-sm ${
                  toUser === user
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 hover:bg-blue-100"
                }`}
              >
                {user}
              </div>
            ))}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col p-6 bg-white">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Chat with {toUser || "..."}</h2>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 custom-scrollbar">
              {messages
                .filter(
                  (m) =>
                    (m.fromUser === "You" && m.toUser === toUser) ||
                    (m.fromUser === toUser && m.toUser === username)
                )
                .map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.fromUser === "You" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl text-sm shadow ${
                        m.fromUser === "You"
                          ? "bg-green-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p><strong>{m.fromUser}:</strong> {m.message}</p>
                    </div>
                  </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-3 mt-auto">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Type a message ${toUser ? `to ${toUser}` : ""}`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={!toUser}
                required
              />
              <button
                type="submit"
                disabled={!toUser}
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
