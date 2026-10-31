import { Injectable } from '@angular/core';

/** Tabla a exportar: título del informe, cabeceras y filas. */
export interface ExportTable {
  /** Título del informe. */
  title: string;
  /** Cabeceras de columna. */
  headers: string[];
  /** Filas de datos. */
  rows: (string | number)[][];
}

/** Exportación de informes a CSV y PDF en el cliente. */
@Injectable({ providedIn: 'root' })
export class ExportService {
  /** Descarga la tabla como CSV (separador `;`, UTF-8 con BOM para Excel). */
  public exportCsv(filename: string, table: ExportTable): void {
    const escape = (v: string | number): string => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [table.headers, ...table.rows].map((r) => r.map(escape).join(';'));
    // BOM para que Excel interprete bien la codificación UTF-8.
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    this.download(blob, `${filename}.csv`);
  }

  /** Genera y descarga la tabla como PDF con jsPDF + autotable. */
  public async exportPdf(filename: string, table: ExportTable): Promise<void> {
    // Carga diferida: jsPDF es pesado y solo se necesita al exportar.
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(table.title, 14, 18);
    doc.setFontSize(9);
    doc.text(`Generado el ${new Date().toLocaleString('es-ES')}`, 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [table.headers],
      body: table.rows.map((r) => r.map(String)),
      styles: { fontSize: 9 },
    });
    doc.save(`${filename}.pdf`);
  }

  /** Dispara la descarga de un `Blob` mediante un enlace temporal. */
  private download(blob: Blob, name: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }
}
