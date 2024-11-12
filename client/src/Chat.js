import React, { useState, useEffect } from 'react';

const Chat = ({ roomId, username, socket }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.off('receiveMessage');
  }, [socket]);

  const sendMessage = () => {
    if (input.trim()) {
      const message = { username, text: input, roomId };
      socket.emit('sendMessage', message);
      setMessages((prev) => [...prev, message]);
      setInput('');
    }
  };

  return (
    <div className="w-full bg-gray-800 text-white rounded-lg shadow-lg p-4 flex flex-col h-full">
      <div className="overflow-y-auto flex-1 space-y-2 mb-4">
        {messages.map((message, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm">
              {message.username}
            </div>
            <div className="bg-gray-700 text-white p-2 rounded-lg max-w-xs break-words">
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 rounded-lg text-black"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
