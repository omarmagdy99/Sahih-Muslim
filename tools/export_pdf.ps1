# Updates the table of contents in a .docx and exports it to PDF via Microsoft Word.
# Usage: powershell -File export_pdf.ps1 "<full path to .docx>"
param([string]$DocxPath)
$pdf = [IO.Path]::ChangeExtension($DocxPath, '.pdf')
$w = New-Object -ComObject Word.Application; $w.Visible = $false
try {
  $d = $w.Documents.Open($DocxPath)
  foreach ($t in $d.TablesOfContents) { $t.Update() }
  $d.Save(); $d.ExportAsFixedFormat($pdf, 17)
  "pages: " + $d.ComputeStatistics(2); $d.Close()
} finally { $w.Quit() }
