from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from docx import Document
from docx.shared import Inches, Pt
from PIL import Image
import base64
import io
from html2docx import html2docx

app = FastAPI()

# ✅ Allow your deployed frontend only
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://letterheadcreation.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def split_letterhead_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    width, height = image.size
    header_img = image.crop((0, 0, width, int(height * 0.25)))
    header_io = io.BytesIO()
    header_img.save(header_io, format="PNG")
    header_io.seek(0)
    return header_io

@app.post("/merge-docx/")
async def merge_docx(request: Request):
    try:
        data = await request.json()
        base64_data = data["image"].split(";base64,")[-1]
        content = data.get("content", "")
        footer_html = data.get("footer_text", "")

        image_bytes = base64.b64decode(base64_data)
        header_stream = split_letterhead_image(image_bytes)

        doc = Document()
        section = doc.sections[0]
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

        # ✅ Add header image
        header_para = section.header.paragraphs[0]
        header_para.alignment = 1
        header_para.add_run().add_picture(header_stream, width=Inches(6.5))

        # ✅ Add rich footer from HTML
        if footer_html.strip():
            temp_doc = Document()
            html2docx(f"<html><body>{footer_html}</body></html>", temp_doc)

            # Remove leading empty para if needed
            if temp_doc.paragraphs and not temp_doc.paragraphs[0].text.strip():
                temp_doc._body.clear_content()

            for para in temp_doc.paragraphs:
                footer_para = section.footer.add_paragraph()
                for run in para.runs:
                    new_run = footer_para.add_run(run.text)
                    new_run.bold = run.bold
                    new_run.italic = run.italic
                    new_run.underline = run.underline
                    new_run.font.size = run.font.size
                    if run.font.color and run.font.color.rgb:
                        new_run.font.color.rgb = run.font.color.rgb

        # ✅ Add main letter content
        for line in content.split("\n"):
            if line.strip():
                para = doc.add_paragraph(line.strip())
                para.style.font.size = Pt(11)

        output = io.BytesIO()
        doc.save(output)
        output.seek(0)

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=letterhead_final.docx"}
        )

    except Exception as e:
        print("❌ Error generating document:", str(e))
        return JSONResponse(status_code=500, content={"error": str(e)})
