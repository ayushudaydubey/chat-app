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
    const handlePrivateMessage = ({ fromUser, message }) => {
      setMessages((prev) => [...prev, { fromUser, message }]);
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
      setMessages((prev) => [...prev, { fromUser: "You", message }]);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {!isRegistered ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm mb-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Register Username</h2>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleRegister}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Register
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Users</h3>
            {registeredUsers.map((user, index) => (
              <div
                key={index}
                onClick={() => setToUser(user)}
                className={`cursor-pointer p-2 rounded-md mb-2 ${
                  toUser === user ? "bg-blue-500 text-white" : "bg-white text-gray-800"
                } hover:bg-blue-100`}
              >
                {user}
              </div>
            ))}
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Send Private Message</h2>
            <form onSubmit={handleSend} className="space-y-3 mb-4">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message ${toUser ? "to " + toUser : ""}`}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={!toUser}
                required
              />
              <button
                type="submit"
                disabled={!toUser}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
              >
                Send
              </button>
            </form>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Messages:</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {messages.map((m, i) => (
                  <div key={i} className="bg-gray-100 p-2 rounded-md">
                    <strong className="text-blue-600">{m.fromUser}:</strong> <span>{m.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
