import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import { BudgetV2State, calcBudgetV2Totals, STAGE_SHORT, fmtRupiah } from "./budget-v2";
import { VendorPlannerState } from "./vendor-guide";

// --- EXCEL BUILDER ---

export async function exportBudgetToExcel(state: BudgetV2State, coupleNames?: string) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Wedding Planner App";
  const sheet = workbook.addWorksheet("Anggaran");

  const totals = calcBudgetV2Totals(state);

  // Title
  sheet.mergeCells("A1:D1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = `Rencana Anggaran Pernikahan ${coupleNames ? `- ${coupleNames}` : ""}`;
  titleCell.font = { size: 16, bold: true, color: { argb: "FF333333" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  if (state.budgetRange) {
    sheet.mergeCells("A2:D2");
    const subTitle = sheet.getCell("A2");
    subTitle.value = `Rentang Budget: ${state.budgetRange}`;
    subTitle.font = { size: 12, italic: true };
    subTitle.alignment = { vertical: "middle", horizontal: "center" };
  }

  let rowIdx = 4;
  sheet.columns = [
    { header: "Pos Anggaran / Vendor", key: "item", width: 40 },
    { header: "Tahap / Kategori", key: "cat", width: 30 },
    { header: "Estimasi Biaya", key: "cost", width: 20 },
    { header: "Catatan", key: "note", width: 50 },
  ];

  const headerRow = sheet.getRow(rowIdx);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF55679C" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" }, left: { style: "thin" },
      bottom: { style: "thin" }, right: { style: "thin" },
    };
  });
  rowIdx++;

  // Add Vendor Sync Items
  if (state.vendorItems.length > 0) {
    const vRow = sheet.getRow(rowIdx++);
    vRow.getCell(1).value = "PAKET VENDOR (Sinkron)";
    vRow.font = { bold: true, color: { argb: "FF55679C" } };
    vRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6EBFA" } };
    
    state.vendorItems.forEach((item) => {
      const row = sheet.getRow(rowIdx++);
      row.values = {
        item: item.vendorName || item.label,
        cat: item.label,
        cost: item.nominal || 0,
        note: item.note,
      };
      row.getCell("cost").numFmt = '"Rp"#,##0';
    });
  }

  // Add Stage Items
  state.stages.filter(s => s.enabled).forEach(stage => {
    const sRow = sheet.getRow(rowIdx++);
    sRow.getCell(1).value = `TAHAP: ${STAGE_SHORT[stage.stageLabel].toUpperCase()}`;
    sRow.font = { bold: true, color: { argb: "FF55679C" } };
    sRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6EBFA" } };

    stage.items.forEach((item) => {
      const row = sheet.getRow(rowIdx++);
      row.values = {
        item: item.label,
        cat: STAGE_SHORT[stage.stageLabel],
        cost: item.nominal || 0,
        note: item.note,
      };
      row.getCell("cost").numFmt = '"Rp"#,##0';
    });
  });

  // Grand Total
  rowIdx++;
  const totalRow = sheet.getRow(rowIdx);
  totalRow.getCell(1).value = "TOTAL ESTIMASI";
  totalRow.getCell(3).value = totals.grandTotal;
  totalRow.getCell(3).numFmt = '"Rp"#,##0';
  totalRow.font = { bold: true, size: 12 };
  totalRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECFDF5" } };

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Anggaran_Pernikahan_${coupleNames ? coupleNames.replace(/\s+/g, "_") : "Saya"}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
}

export async function exportVendorToExcel(state: VendorPlannerState, coupleNames?: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Vendor Checklist");

  // Title
  sheet.mergeCells("A1:E1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = `Checklist Komponen Vendor ${coupleNames ? `- ${coupleNames}` : ""}`;
  titleCell.font = { size: 16, bold: true, color: { argb: "FF333333" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  let rowIdx = 3;
  sheet.columns = [
    { header: "Kategori Vendor", key: "cat", width: 30 },
    { header: "Komponen", key: "item", width: 45 },
    { header: "Status", key: "status", width: 15 },
    { header: "Catatan", key: "note", width: 40 },
    { header: "Referensi", key: "img", width: 25 },
  ];

  const headerRow = sheet.getRow(rowIdx);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB692C2" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });
  rowIdx++;

  state.categories.forEach((cat) => {
    const cRow = sheet.getRow(rowIdx++);
    cRow.getCell(1).value = cat.title.toUpperCase();
    if (cat.vendorName) {
      cRow.getCell(2).value = `Vendor: ${cat.vendorName}`;
    }
    cRow.font = { bold: true, color: { argb: "FF102C57" } };
    cRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE3A5C7" } };
    cat.items.forEach(item => {
      const row = sheet.getRow(rowIdx);
      rowIdx++;
      row.values = {
        cat: "",
        item: item.label,
        status: item.status === "include" ? "Termasuk" : item.status === "exclude" ? "Tdk Termasuk" : "TBD",
        note: item.note,
        img: ""
      };
      
      const statusCell = row.getCell("status");
      statusCell.alignment = { horizontal: "center", vertical: "middle" };
      row.getCell("item").alignment = { vertical: "middle" };
      row.getCell("note").alignment = { vertical: "middle" };
      
      if (item.status === "include") statusCell.font = { color: { argb: "FF059669" }, bold: true };
      else if (item.status === "exclude") statusCell.font = { color: { argb: "FFDC2626" } };
      else statusCell.font = { color: { argb: "FF9CA3AF" }, italic: true };
      
      if (item.imageUrl && item.imageUrl.startsWith("data:image/")) {
        try {
          const extension = item.imageUrl.split(';')[0].split('/')[1] as any;
          const imageId = workbook.addImage({
            base64: item.imageUrl.split(',')[1],
            extension: extension,
          });
          row.height = 80;
          sheet.addImage(imageId, {
            tl: { col: 4, row: rowIdx - 2 },
            ext: { width: 100, height: 100 }
          });
        } catch (e) { console.error("Export excel image error:", e); }
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Checklist_Vendor_${coupleNames ? coupleNames.replace(/\s+/g, "_") : "Saya"}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
}

// --- PDF BUILDER ---

export function exportBudgetToPdf(state: BudgetV2State, coupleNames?: string) {
  const doc = new jsPDF("p", "pt", "a4");
  const totals = calcBudgetV2Totals(state);

  doc.setFontSize(18);
  doc.text(`Rencana Anggaran Pernikahan`, 40, 40);
  
  if (coupleNames) {
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(coupleNames, 40, 60);
  }

  doc.setFontSize(12);
  doc.setTextColor(0);
  let startY = 80;
  if (state.budgetRange) {
    doc.text(`Rentang Budget: ${state.budgetRange}`, 40, startY);
    startY += 20;
  }
  doc.setFont("helvetica", "bold");
  doc.text(`Total Estimasi: ${fmtRupiah(totals.grandTotal)}`, 40, startY);
  startY += 20;

  const tableData: any[][] = [];
  
  if (state.vendorItems.length > 0) {
    tableData.push([{ content: "Paket Vendor (Sinkron)", colSpan: 3, styles: { fillColor: [230, 235, 250], textColor: [85, 103, 156], fontStyle: "bold" } }]);
    state.vendorItems.forEach((i) => {
      tableData.push([i.vendorName || i.label, i.nominal ? fmtRupiah(i.nominal) : "-", i.note]);
    });
  }

  state.stages.filter(s => s.enabled).forEach(stage => {
    tableData.push([{ content: `Tahap: ${STAGE_SHORT[stage.stageLabel]}`, colSpan: 3, styles: { fillColor: [230, 235, 250], textColor: [85, 103, 156], fontStyle: "bold" } }]);
    stage.items.forEach((i) => {
      tableData.push([i.label, i.nominal ? fmtRupiah(i.nominal) : "-", i.note]);
    });
  });

  autoTable(doc, {
    startY,
    head: [["Pos Anggaran", "Estimasi (Rp)", "Catatan"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [85, 103, 156] },
    columnStyles: {
      0: { cellWidth: 200 },
      1: { cellWidth: 100, halign: "right" },
      2: { cellWidth: "auto" }
    }
  });

  doc.save(`Anggaran_Pernikahan_${coupleNames ? coupleNames.replace(/\s+/g, "_") : "Saya"}.pdf`);
}

export function exportVendorToPdf(state: VendorPlannerState, coupleNames?: string) {
  const doc = new jsPDF("p", "pt", "a4");

  doc.setFontSize(18);
  doc.text(`Checklist Vendor Pernikahan`, 40, 40);
  
  if (coupleNames) {
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(coupleNames, 40, 60);
  }

  const tableData: any[][] = [];
  
  state.categories.forEach((cat) => {
    const subtitle = cat.vendorName ? `${cat.title} (Vendor: ${cat.vendorName})` : cat.title;
    tableData.push([{ content: subtitle.toUpperCase(), colSpan: 4, styles: { fillColor: [227, 165, 199], textColor: [16, 44, 87], fontStyle: "bold" } }]);
    cat.items.forEach(i => {
      const statusText = i.status === "include" ? "Termasuk" : i.status === "exclude" ? "Tdk Trmsk" : "TBD";
      tableData.push([i.label, statusText, i.note, i.imageUrl || ""]);
    });
  });

  autoTable(doc, {
    startY: 80,
    head: [["Komponen", "Status", "Catatan", "Referensi"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [182, 146, 194] },
    columnStyles: {
      0: { cellWidth: 160 },
      1: { cellWidth: 60, halign: "center" },
      2: { cellWidth: "auto" },
      3: { cellWidth: 80 }
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 1 && data.cell.raw !== "Status") {
        if (data.cell.raw === "Termasuk") data.cell.styles.textColor = [5, 150, 105];
        if (data.cell.raw === "Tdk Trmsk") data.cell.styles.textColor = [220, 38, 38];
      }
      if (data.section === "body" && data.column.index === 3) {
        if (data.cell.raw && typeof data.cell.raw === "string" && data.cell.raw.startsWith("data:image")) {
          data.cell.styles.minCellHeight = 60;
          data.cell.text = [""];
        }
      }
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        const raw = data.cell.raw;
        if (raw && typeof raw === "string" && raw.startsWith("data:image")) {
          try {
            // scale down to fit cell width/height maintaining aspect ratio roughly
            const imgData = raw;
            doc.addImage(imgData, "JPEG", data.cell.x + 2, data.cell.y + 2, data.cell.width - 4, 56);
          } catch (e) {
            console.error("Export pdf image error:", e);
          }
        }
      }
    }
  });

  doc.save(`Checklist_Vendor_${coupleNames ? coupleNames.replace(/\s+/g, "_") : "Saya"}.pdf`);
}
