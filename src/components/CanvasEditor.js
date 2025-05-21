// CanvasEditor.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Image as FabricImage } from 'fabric';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import html2canvas from 'html2canvas';

const CanvasEditor = () => {
  const canvasRef = useRef(null);
  const canvasElementRef = useRef(null);
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");

  useEffect(() => {
    const canvas = new Canvas(canvasElementRef.current, {
      width: 800,
      height: 1120,
      backgroundColor: '#ffffff',
    });
    canvasRef.current = canvas;
    return () => canvas.dispose();
  }, []);

  useEffect(() => {
    const renderFooterToCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const prev = canvas.getObjects().find(obj => obj.footerPreview);
      if (prev) canvas.remove(prev);

      const footerPreviewEl = document.getElementById("footer-html-preview");
      if (!footerPreviewEl) return;

      const footerCanvas = await html2canvas(footerPreviewEl, {
        backgroundColor: null
      });

      const footerImg = new Image();
      footerImg.src = footerCanvas.toDataURL();

      footerImg.onload = () => {
        const fabricImg = new FabricImage(footerImg, {
          left: 100,
          top: 1000,
          scaleX: 0.7,
          scaleY: 0.7
        });
        fabricImg.footerPreview = true;
        canvas.add(fabricImg);
        canvas.renderAll();
      };
    };

    renderFooterToCanvas();
  }, [footerText]);

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
      if (!response.ok) {
        const err = await response.text(); // log backend error
        console.error("❌ Server returned:", err);
        alert("Export failed: " + err);
        return;
      }
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
    <>
      <div id="footer-html-preview" style={{ position: "absolute", top: "-9999px", left: "-9999px", width: "600px", background: "#ffffff" }} dangerouslySetInnerHTML={{ __html: footerText }} />

      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-10 font-sans">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            📝 Letterhead Generator Portal
          </h2>
          <div className="grid lg:grid-cols-2 gap-12">
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
                <label className="block mb-2 font-medium text-gray-700">Footer Content</label>
                <ReactQuill
                  theme="snow"
                  value={footerText}
                  onChange={setFooterText}
                  placeholder="Paste styled footer here..."
                  className="bg-white rounded"
                  style={{ height: '150px', marginBottom: '1rem' }}
                />
              </div>

              <button
                onClick={exportWithContent}
                className="w-full bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg shadow hover:bg-blue-700"
              >
                📤 Merge & Export Letterhead
              </button>
            </div>

            <div className="bg-white border shadow rounded-lg p-4 h-fit">
              <h3 className="font-semibold mb-3 text-gray-700 text-lg text-center">📄 Canvas Preview</h3>
              <div className="overflow-auto border rounded-lg">
                <canvas ref={canvasElementRef} className="block mx-auto" style={{ width: '100%', maxWidth: '800px', height: 'auto' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CanvasEditor;
