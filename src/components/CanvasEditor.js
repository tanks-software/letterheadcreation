// CanvasEditor.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Image as FabricImage } from 'fabric';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CanvasEditor = () => {
  const canvasRef = useRef(null);
  const canvasElementRef = useRef(null);
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");

  useEffect(() => {
    const canvas = new Canvas(canvasElementRef.current, {
      width: 800, // larger canvas for better visibility
      height: 1120,
      backgroundColor: '#ffffff',
    });
    canvasRef.current = canvas;
    return () => canvas.dispose();
  }, []);

  const handleFile = async (file) => {
    if (!file?.type.startsWith('image/')) return alert("Invalid image file");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const img = await FabricImage.fromURL(reader.result);
        img.set({ left: 100, top: 50, scaleX: 0.5, scaleY: 0.5 });
        const canvas = canvasRef.current;
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      } catch (err) {
        console.error("Failed to load image:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const exportWithContent = async () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
    try {
      const response = await fetch("https://letterhead-backend.onrender.com/merge-docx/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          content: bodyText,
          footer_text: footerText
        })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "letterhead_final.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-10 font-sans">
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          📝 Letterhead Generator Portal
        </h2>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Panel */}
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Upload Header/Footer Image</label>
              <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} className="w-full file:py-2 file:px-4 file:border-0 file:bg-blue-600 file:text-white file:rounded cursor-pointer" />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Letter Content</label>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={10}
                placeholder="Type your letter content here..."
                className="w-full border border-gray-300 rounded p-4 text-sm focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <div>
            <label className="block mb-2 font-medium text-gray-700">Footer Preview</label>
            <div
            className="p-4 border border-gray-300 rounded bg-white"
            style={{ minHeight: '100px' }}
            dangerouslySetInnerHTML={{ __html: footerText }}
            />
            </div>


            <button
              onClick={exportWithContent}
              className="w-full bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg shadow hover:bg-blue-700"
            >
              📤 Merge & Export Letterhead
            </button>
          </div>

          {/* Right Panel */}
          <div className="bg-white border shadow rounded-lg p-4 h-fit">
            <h3 className="font-semibold mb-3 text-gray-700 text-lg text-center">📄 Canvas Preview</h3>
            <div className="overflow-auto border rounded-lg">
              <canvas ref={canvasElementRef} className="block mx-auto" style={{ width: '100%', maxWidth: '800px', height: 'auto' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
