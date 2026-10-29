import { jsPDF } from "jspdf";

// ---------------------------------------------------------------------------
// Layout base (A4, em mm) e paleta igual à do sistema
// ---------------------------------------------------------------------------
const PAGE_W = 210;
const PAGE_H = 297;
const M = 12; // margem lateral
const W = PAGE_W - M * 2; // largura útil
const TOP = 14;
const BOTTOM = PAGE_H - 16;

const C = {
  bg: [236, 236, 236],
  white: [255, 255, 255],
  border: [226, 226, 230],
  row: [244, 244, 246],
  dark: [23, 23, 23],
  orange: [255, 77, 0],
  purple: [124, 108, 240],
  purpleDark: [91, 77, 224],
  purpleSoft: [233, 230, 255],
  amber: [253, 241, 199],
  amberText: [180, 83, 9],
  text: [38, 38, 38],
  muted: [130, 130, 135],
};

const DAYS_ORDER = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const DAYS_NAMES = {
  seg: "Segunda-feira",
  ter: "Terça-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira",
  sab: "Sábado",
  dom: "Domingo",
};

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------
const slug = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

const calculateIMC = (w, h) => {
  if (!w || !h || h === 0) return null;
  const heightM = h > 3 ? h / 100 : h;
  return (w / (heightM * heightM)).toFixed(1);
};

const classifyIMC = (imc) => {
  if (!imc) return "";
  const v = parseFloat(imc);
  if (v < 18.5) return "Abaixo do peso";
  if (v < 25) return "Peso normal";
  if (v < 30) return "Sobrepeso";
  return "Obesidade";
};

const diffText = (current, previous, unit) => {
  if (!current || !previous) return null;
  const d = +(Number(current) - Number(previous)).toFixed(1);
  if (d === 0) return "sem variação";
  return `${d > 0 ? "+" : ""}${d}${unit}`;
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("pt-BR") : "recente");

// ---------------------------------------------------------------------------
// Primitivas de desenho
// ---------------------------------------------------------------------------
const setFill = (doc, c) => doc.setFillColor(c[0], c[1], c[2]);

const font = (doc, size, style = "normal", color = C.text) => {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  doc.setTextColor(color[0], color[1], color[2]);
};

// Texto que cabe na largura (corta com "...")
const fit = (doc, text, maxW) => {
  let t = String(text ?? "");
  if (doc.getTextWidth(t) <= maxW) return t;
  while (t.length > 1 && doc.getTextWidth(`${t}...`) > maxW) t = t.slice(0, -1);
  return `${t}...`;
};

// Card arredondado (branco com borda fina, ou colorido sem borda)
const card = (doc, x, y, w, h, fill = C.white, r = 5) => {
  setFill(doc, fill);
  if (fill === C.white) {
    doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, w, h, r, r, "FD");
  } else {
    doc.roundedRect(x, y, w, h, r, r, "F");
  }
};

// Chip (pílula) com texto; devolve a largura usada
const chip = (doc, x, y, label, { bg = C.row, color = C.muted, size = 7.5, bold = false } = {}) => {
  font(doc, size, bold ? "bold" : "normal", color);
  const w = doc.getTextWidth(label) + 6;
  setFill(doc, bg);
  doc.roundedRect(x, y, w, 6, 3, 3, "F");
  doc.text(label, x + 3, y + 4.2);
  return w;
};

const paintBg = (doc) => {
  setFill(doc, C.bg);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
};

const newPage = (doc) => {
  doc.addPage();
  paintBg(doc);
  return TOP;
};

const createDoc = () => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  paintBg(doc);
  return doc;
};

const toFile = (doc, filename) => {
  const blob = doc.output("blob");
  return new File([blob], filename, { type: "application/pdf" });
};

// ---------------------------------------------------------------------------
// Blocos reutilizáveis: cabeçalho, aluno + cards de destaque, rodapé
// ---------------------------------------------------------------------------
function drawHeader(doc, subtitle, tag) {
  card(doc, M, TOP, W, 26, C.dark, 6);

  font(doc, 20, "bold", C.white);
  doc.text("Pro", M + 8, TOP + 14.5);
  const proW = doc.getTextWidth("Pro");
  font(doc, 20, "bold", C.orange);
  doc.text("Evolua", M + 8 + proW, TOP + 14.5);

  font(doc, 9, "normal", [190, 190, 195]);
  doc.text(subtitle, M + 8, TOP + 21.5);

  font(doc, 8.5, "normal", [190, 190, 195]);
  doc.text(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, M + W - 8, TOP + 11, {
    align: "right",
  });

  font(doc, 7.5, "bold", C.white);
  const tw = doc.getTextWidth(tag) + 8;
  setFill(doc, C.orange);
  doc.roundedRect(M + W - 8 - tw, TOP + 14.5, tw, 6.5, 3.25, 3.25, "F");
  doc.text(tag, M + W - 8 - tw / 2, TOP + 19, { align: "center" });

  return TOP + 26 + 5;
}

function statCard(doc, x, y, w, h, stat, bg) {
  card(doc, x, y, w, h, bg);
  const soft = bg === C.dark ? [170, 170, 175] : [255, 228, 214];

  font(doc, 7.5, "normal", soft);
  doc.text(stat.label, x + 5, y + 7);

  font(doc, 17, "bold", C.white);
  doc.text(fit(doc, stat.value, w - 10), x + 5, y + 17);

  font(doc, 7, "normal", soft);
  doc.text(fit(doc, stat.sub || "", w - 10), x + 5, y + 24);
}

function drawStudentRow(doc, y, student, stats) {
  const h = 30;
  const sw = 100;

  card(doc, M, y, sw, h);

  // Avatar com iniciais
  setFill(doc, C.purpleSoft);
  doc.circle(M + 13, y + h / 2, 8, "F");
  font(doc, 11, "bold", C.purpleDark);
  doc.text(initials(student.name), M + 13, y + h / 2 + 1.4, { align: "center" });

  // Nome
  font(doc, 13, "bold", C.text);
  doc.text(fit(doc, student.name || "Aluno", sw - 32), M + 25, y + 11.5);

  // Chips
  let cx = M + 25;
  const cy = y + 16.5;
  if (student.age) cx += chip(doc, cx, cy, `${student.age} anos`) + 2;
  if (student.goal) {
    const g = String(student.goal);
    const goal = g.length > 22 ? `${g.slice(0, 21)}...` : g;
    chip(doc, cx, cy, `Objetivo: ${goal}`, { bg: C.amber, color: C.amberText });
  }

  // Cards de destaque (escuro + laranja), como no sistema
  const cw = (W - sw - 8) / 2;
  statCard(doc, M + sw + 4, y, cw, h, stats[0], C.dark);
  statCard(doc, M + sw + 8 + cw, y, cw, h, stats[1], C.orange);

  return y + h + 7;
}

function drawFooters(doc) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    font(doc, 7.5, "normal", C.muted);
    doc.text(`ProEvolua  ·  Página ${i} de ${total}`, PAGE_W / 2, PAGE_H - 8, { align: "center" });
  }
}

// ---------------------------------------------------------------------------
// Ficha de treino
// ---------------------------------------------------------------------------
function measureRow(doc, ex, innerW) {
  font(doc, 9, "bold", C.text);
  const nameLines = doc.splitTextToSize(String(ex.name || "-"), innerW - 52);

  font(doc, 7.5, "italic", C.muted);
  const noteLines = ex.notes ? doc.splitTextToSize(`Obs: ${ex.notes}`, innerW - 50) : [];

  const nameBlock = 5.5 + (nameLines.length - 1) * 4.2;
  const h =
    noteLines.length > 0
      ? Math.max(12, nameBlock + 4 + (noteLines.length - 1) * 3.6 + 3.5)
      : Math.max(12, nameBlock + 4.5);

  return { h, nameLines, noteLines, nameBlock };
}

function drawRow(doc, x, y, w, ex, m) {
  setFill(doc, C.row);
  doc.roundedRect(x, y, w, m.h, 3, 3, "F");

  font(doc, 9, "bold", C.text);
  m.nameLines.forEach((ln, i) => doc.text(ln, x + 4, y + 5.5 + i * 4.2));

  font(doc, 10, "bold", C.purpleDark);
  doc.text(`${ex.sets ?? "-"} x ${ex.reps ?? "-"}`, x + w - 4, y + 5.5, { align: "right" });

  if (ex.rest_time) {
    font(doc, 7, "normal", C.muted);
    doc.text(`descanso ${ex.rest_time}`, x + w - 4, y + 9.5, { align: "right" });
  }

  if (m.noteLines.length > 0) {
    font(doc, 7.5, "italic", C.muted);
    m.noteLines.forEach((ln, i) => doc.text(ln, x + 4, y + m.nameBlock + 4 + i * 3.6));
  }
}

// Desenha um dia da semana como card; se não couber, continua na página seguinte
function drawDayCards(doc, y, label, items) {
  const innerX = M + 5;
  const innerW = W - 10;
  let idx = 0;
  let first = true;

  while (idx < items.length) {
    const firstM = measureRow(doc, items[idx], innerW);
    if (y + 13 + firstM.h + 6 > BOTTOM) y = newPage(doc);

    let h = 13;
    const chunk = [];
    while (idx + chunk.length < items.length) {
      const ex = items[idx + chunk.length];
      const m = measureRow(doc, ex, innerW);
      if (chunk.length > 0 && y + h + m.h + 5 > BOTTOM) break;
      chunk.push({ ex, m });
      h += m.h + 2;
    }
    h += 2;

    card(doc, M, y, W, h);

    chip(doc, innerX, y + 4, first ? label.toUpperCase() : `${label.toUpperCase()} (CONT.)`, {
      bg: C.purpleSoft,
      color: C.purpleDark,
      bold: true,
    });

    font(doc, 7.5, "normal", C.muted);
    doc.text(
      `${items.length} exercício${items.length > 1 ? "s" : ""}`,
      M + W - 5,
      y + 8.2,
      { align: "right" }
    );

    let ry = y + 13;
    chunk.forEach(({ ex, m }) => {
      drawRow(doc, innerX, ry, innerW, ex, m);
      ry += m.h + 2;
    });

    y += h + 5;
    idx += chunk.length;
    first = false;
  }

  return y;
}

export function generateWorkoutPdf(student, workouts) {
  const doc = createDoc();

  const allEx = workouts.flatMap((w) => w.exercises || []);
  const daysUsed = new Set(allEx.filter((e) => DAYS_ORDER.includes(e.day)).map((e) => e.day)).size;

  let y = drawHeader(doc, "Ficha de treino", "TREINO");
  y = drawStudentRow(doc, y, student, [
    {
      label: "Exercícios",
      value: String(allEx.length),
      sub: workouts.length === 1 ? "1 ficha" : `${workouts.length} fichas`,
    },
    { label: "Dias de treino", value: String(daysUsed || "-"), sub: "por semana" },
  ]);

  workouts.forEach((w) => {
    if (y + 20 > BOTTOM) y = newPage(doc);

    font(doc, 13, "bold", C.dark);
    doc.text(fit(doc, w.title || "Treino", W - 4), M + 2, y + 4);
    y += 8;

    if (w.description) {
      font(doc, 8.5, "italic", C.muted);
      const lines = doc.splitTextToSize(w.description, W - 4);
      doc.text(lines, M + 2, y);
      y += lines.length * 4 + 1;
    }
    y += 2;

    const exs = w.exercises || [];
    DAYS_ORDER.forEach((k) => {
      const items = exs.filter((e) => e.day === k);
      if (items.length > 0) y = drawDayCards(doc, y, DAYS_NAMES[k], items);
    });

    const orphans = exs.filter((e) => !DAYS_ORDER.includes(e.day));
    if (orphans.length > 0) y = drawDayCards(doc, y, "Exercícios", orphans);

    y += 2;
  });

  drawFooters(doc);
  return toFile(doc, `treino-${slug(student.name)}.pdf`);
}

// ---------------------------------------------------------------------------
// Avaliação física (medidas)
// ---------------------------------------------------------------------------
function drawChart(doc, y, series, title) {
  const h = 62;
  if (y + h > BOTTOM) y = newPage(doc);

  card(doc, M, y, W, h);
  font(doc, 11, "bold", C.dark);
  doc.text(title, M + 6, y + 9);

  const data = series.slice(-12);
  const vals = data.map((d) => d.value);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  const pad = (max - min) * 0.2 || 1;
  min -= pad;
  max += pad;

  const px0 = M + 18;
  const px1 = M + W - 10;
  const py0 = y + 18;
  const py1 = y + h - 13;

  // Linhas de grade + escala
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.2);
  [0, 0.5, 1].forEach((r) => {
    const gy = py0 + r * (py1 - py0);
    doc.line(px0, gy, px1, gy);
    font(doc, 7, "normal", C.muted);
    doc.text((max - r * (max - min)).toFixed(1), px0 - 3, gy + 1.2, { align: "right" });
  });

  const pts = data.map((d, i) => ({
    x: px0 + (i / (data.length - 1)) * (px1 - px0),
    y: py1 - ((d.value - min) / (max - min)) * (py1 - py0),
    value: d.value,
    label: d.label,
  }));

  // Linha
  doc.setDrawColor(C.purple[0], C.purple[1], C.purple[2]);
  doc.setLineWidth(0.9);
  for (let i = 1; i < pts.length; i++) {
    doc.line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
  }

  // Pontos, valores e datas
  const step = Math.ceil(pts.length / 8);
  pts.forEach((p, i) => {
    setFill(doc, C.white);
    doc.setDrawColor(C.purple[0], C.purple[1], C.purple[2]);
    doc.setLineWidth(0.6);
    doc.circle(p.x, p.y, 1.5, "FD");

    if (i % step === 0 || i === pts.length - 1) {
      font(doc, 7, "bold", C.text);
      doc.text(String(p.value), p.x, p.y - 3, { align: "center" });
      font(doc, 7, "normal", C.muted);
      doc.text(p.label, p.x, py1 + 6, { align: "center" });
    }
  });

  return y + h + 5;
}

function drawHistory(doc, y, sorted) {
  const cols = [
    ["Data", 22],
    ["Peso kg", 20],
    ["Alt. m", 18],
    ["Gord. %", 19],
    ["IMC", 16],
    ["Peito cm", 20],
    ["Cint. cm", 20],
    ["Braços cm", 20],
    ["Pernas cm", 21],
  ];

  const rows = [...sorted].reverse().map((a) =>
    [
      fmtDate(a.created_at),
      a.weight || "-",
      a.height || "-",
      a.body_fat || "-",
      calculateIMC(a.weight, a.height) || "-",
      a.chest || "-",
      a.waist || "-",
      a.arms || "-",
      a.legs || "-",
    ].map(String)
  );

  const innerX = M + 5;
  let idx = 0;
  let first = true;

  while (idx < rows.length) {
    if (y + 40 > BOTTOM) y = newPage(doc);

    const perPage = Math.max(1, Math.floor((BOTTOM - y - 26) / 7));
    const chunk = rows.slice(idx, idx + perPage);
    const h = 22 + chunk.length * 7 + 3;

    card(doc, M, y, W, h);
    font(doc, 11, "bold", C.dark);
    doc.text(first ? "Histórico de avaliações" : "Histórico de avaliações (cont.)", M + 6, y + 9);

    setFill(doc, C.purpleSoft);
    doc.roundedRect(innerX, y + 13, W - 10, 6.5, 3, 3, "F");
    font(doc, 7, "bold", C.purpleDark);
    let cx = innerX;
    cols.forEach(([label, wd]) => {
      doc.text(label, cx + wd / 2, y + 17.3, { align: "center" });
      cx += wd;
    });

    chunk.forEach((r, ri) => {
      const ry = y + 22 + ri * 7;
      if (ri % 2 === 0) {
        setFill(doc, C.row);
        doc.roundedRect(innerX, ry, W - 10, 7, 2, 2, "F");
      }
      font(doc, 8, "normal", C.text);
      let rx = innerX;
      r.forEach((cell, ci) => {
        doc.text(cell, rx + cols[ci][1] / 2, ry + 4.8, { align: "center" });
        rx += cols[ci][1];
      });
    });

    y += h + 5;
    idx += chunk.length;
    first = false;
  }

  return y;
}

export function generateAssessmentPdf(student, assessments) {
  const doc = createDoc();

  const sorted = [...assessments].sort(
    (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
  );
  const last = sorted[sorted.length - 1];
  const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  const lastDate = fmtDate(last.created_at);
  const imcLast = calculateIMC(last.weight, last.height);
  const imcPrev = prev ? calculateIMC(prev.weight, prev.height) : null;

  const weightDiff = prev ? diffText(last.weight, prev.weight, " kg") : null;

  let y = drawHeader(doc, "Avaliação física", "AVALIAÇÃO");
  y = drawStudentRow(doc, y, student, [
    {
      label: "Peso atual",
      value: last.weight ? `${last.weight} kg` : "-",
      sub: weightDiff ? `${weightDiff} vs. anterior` : `Avaliação de ${lastDate}`,
    },
    {
      label: "IMC",
      value: imcLast || "-",
      sub: imcLast ? classifyIMC(imcLast) : "Altura não informada",
    },
  ]);

  // Título da seção
  font(doc, 13, "bold", C.dark);
  doc.text(`Medidas de ${lastDate}`, M + 2, y + 4);
  y += 10;

  // Grade de medidas (3 por linha)
  const measures = [
    { label: "Peso", value: last.weight, prev: prev?.weight, unit: " kg" },
    { label: "Altura", value: last.height, unit: " m", noDiff: true },
    { label: "% Gordura corporal", value: last.body_fat, prev: prev?.body_fat, unit: "%" },
    { label: "IMC", value: imcLast, prev: imcPrev, unit: "" },
    { label: "Peitoral", value: last.chest, prev: prev?.chest, unit: " cm" },
    { label: "Cintura", value: last.waist, prev: prev?.waist, unit: " cm" },
    { label: "Braços", value: last.arms, prev: prev?.arms, unit: " cm" },
    { label: "Pernas", value: last.legs, prev: prev?.legs, unit: " cm" },
    { label: "Gordura corporal (kg)", value: last.body_fat_kg, prev: prev?.body_fat_kg, unit: " kg" },
    { label: "Massa magra", value: last.lean_mass, prev: prev?.lean_mass, unit: " kg" },
    { label: "Músculo esquelético", value: last.skeletal_muscle, prev: prev?.skeletal_muscle, unit: " kg" },
    { label: "Água corporal total", value: last.total_body_water, prev: prev?.total_body_water, unit: "%" },
    { label: "Gordura visceral", value: last.visceral_fat, prev: prev?.visceral_fat, unit: "" },
    { label: "Massa óssea", value: last.bone_mass, prev: prev?.bone_mass, unit: " kg" },
    { label: "Idade metabólica", value: last.metabolic_age, prev: prev?.metabolic_age, unit: " anos" },
  ].filter((m) => m.value);

  const cols = 3;
  const gap = 5;
  const cw = (W - gap * (cols - 1)) / cols;
  const ch = 27;
  let rowY = y;

  measures.forEach((m, i) => {
    const col = i % cols;
    if (col === 0 && rowY + ch > BOTTOM) rowY = newPage(doc);

    const x = M + col * (cw + gap);
    card(doc, x, rowY, cw, ch);

    font(doc, 8, "normal", C.muted);
    doc.text(m.label, x + 5, rowY + 7);

    font(doc, 15, "bold", C.dark);
    doc.text(`${m.value}${m.unit}`, x + 5, rowY + 16.5);

    const d = !m.noDiff && m.prev ? diffText(m.value, m.prev, m.unit) : null;
    if (d) {
      chip(doc, x + 5, rowY + 19.5, `${d} vs. anterior`, {
        bg: C.purpleSoft,
        color: C.purpleDark,
        bold: true,
        size: 7,
      });
    }

    if (col === cols - 1 || i === measures.length - 1) rowY += ch + gap;
  });

  y = rowY + 2;

  // Gráfico de evolução do peso + histórico
  const weightSeries = sorted
    .filter((a) => a.weight)
    .map((a) => ({
      value: Number(a.weight),
      label: a.created_at
        ? new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
        : "-",
    }));

  if (weightSeries.length >= 2) {
    y = drawChart(doc, y, weightSeries, "Evolução do peso (kg)");
  }

  if (sorted.length > 1) {
    y = drawHistory(doc, y, sorted);
    font(doc, 7.5, "normal", C.muted);
    doc.text("Medidas de peito, cintura, braços e pernas em centímetros.", M + 2, y);
  }

  drawFooters(doc);
  return toFile(doc, `medidas-${slug(student.name)}.pdf`);
}