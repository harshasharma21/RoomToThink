import React, { useEffect, useRef, useState } from 'react';
import Chat from './Chat';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Whiteboard = ({ roomId, username, socket }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.75;  // 75% of the screen width
    canvas.height = window.innerHeight * 0.85; // 85% of the screen height
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    contextRef.current = context;

    socket.on('draw', ({ x, y, color, thickness, isDrawing }) => {
      context.strokeStyle = color;
      context.lineWidth = thickness;
      if (isDrawing) {
        context.lineTo(x, y);
        context.stroke();
      } else {
        context.beginPath();
      }
    });

    return () => socket.off('draw');
  }, [socket]);

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = thickness;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();

    socket.emit('draw', { x, y, color, thickness, roomId, isDrawing: true });
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    socket.emit('draw', { roomId, isDrawing: false });
  };

  const downloadPDF = () => {
    const canvas = canvasRef.current;
    html2canvas(canvas).then((canvasSnapshot) => {
      const pdf = new jsPDF();
      const imgData = canvasSnapshot.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 10, 10, 180, 160);
      pdf.save('whiteboard.pdf');
    }).catch((error) => {
      console.error('Error generating PDF:', error);
    });
  };

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-6">
      {/* Whiteboard */}
      <div className="w-3/4 bg-white rounded-lg shadow-lg flex flex-col">
        <div className="flex justify-between items-center p-4 bg-indigo-600 text-white rounded-t-lg">
          <h2 className="text-2xl font-bold">Hello, {username}</h2>
          <button
            onClick={downloadPDF}
            className="bg-pink-500 hover:bg-pink-700 text-white py-2 px-6 rounded-lg shadow-md transform transition duration-300"
          >
            Download PDF
          </button>
        </div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          className="border-2 border-gray-300 bg-white rounded-b-lg"
        />
        <div className="mt-4 flex justify-center gap-4">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-12 rounded-full border-none"
          />
          <select
            value={thickness}
            onChange={(e) => setThickness(e.target.value)}
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="2">Thin</option>
            <option value="5">Medium</option>
            <option value="10">Thick</option>
          </select>
        </div>
      </div>

      {/* Chat */}
      <div className="w-1/4 ml-4">
        <Chat roomId={roomId} username={username} socket={socket} />
      </div>
    </div>
  );
};

export default Whiteboard;
