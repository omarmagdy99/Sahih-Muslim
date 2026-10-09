# Linux alternative to export_pdf.ps1: updates the TOC and exports PDF via LibreOffice (UNO).
# Usage: python3 export_pdf_lo.py "<path to .docx>"   (PDF is written next to the .docx)
import os, subprocess, sys, time
import uno
from com.sun.star.beans import PropertyValue

def pv(n, v):
    p = PropertyValue(); p.Name = n; p.Value = v; return p

src = os.path.abspath(sys.argv[1])
pdf = os.path.splitext(src)[0] + ".pdf"
proc = subprocess.Popen(["soffice", "--headless", "--norestore", "--accept=socket,host=localhost,port=2002;urp;"],
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    ctx = None
    for _ in range(60):
        try:
            local = uno.getComponentContext()
            resolver = local.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver", local)
            ctx = resolver.resolve("uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext")
            break
        except Exception:
            time.sleep(1)
    desktop = ctx.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
    doc = desktop.loadComponentFromURL(uno.systemPathToFileUrl(src), "_blank", 0, (pv("Hidden", True),))
    idx = doc.getDocumentIndexes()
    for i in range(idx.getCount()):
        idx.getByIndex(i).update()
    doc.storeToURL(uno.systemPathToFileUrl(pdf), (pv("FilterName", "writer_pdf_Export"),))
    doc.close(True)
    print("pdf:", pdf)
finally:
    proc.terminate()
