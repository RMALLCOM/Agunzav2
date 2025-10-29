// Mock utilities and data for JetSMART Kiosk (Frontend-only)
// NOTE: This is mocked logic for demo. Real validation, camera saves, and pricing
// will be implemented in the backend later.

export const JETSMART_COLORS = {
  red: "#E30613",
  blue: "#002D72",
  white: "#FFFFFF",
};

export const RULES = {
  L: 55, // Largo
  W: 35, // Ancho
  H: 25, // Alto
  KG: 10, // Peso
};

export const DESTINATIONS = [
  { code: "SCL", name: "Santiago" },
  { code: "AEP", name: "Buenos Aires (AEP)" },
  { code: "EZE", name: "Buenos Aires (EZE)" },
  { code: "LIM", name: "Lima" },
  { code: "BOG", name: "Bogotá" },
  { code: "GRU", name: "São Paulo" },
  { code: "IQQ", name: "Iquique" },
  { code: "ANF", name: "Antofagasta" },
];

export const GATES = Array.from({ length: 10 }, (_, i) => `A${i + 1}`);

export const i18n = {
  ES: {
    start: "INICIAR",
    welcome: "Bienvenido",
    scanStart: "COMENZAR ESCANEO",
    configTitle: "Configurador de vuelos",
    save: "GUARDAR",
    back: "VOLVER",
    operator: "Operador",
    gate: "Puerta de embarque",
    flight: "Nº de vuelo",
    destination: "Destino",
    intl: "Internacional",
    scan: "ESCANEAR",
    whyNo: "¿POR QUÉ NO CUMPLE?",
    goToPay: "CONTINUAR AL PAGO",
    detailTitle: "Detalle de no cumplimiento",
    class: "Clase",
    suitcase: "maleta",
    realDims: "Dimensiones reales",
    rules: "Reglas activas",
    payTitle: "Tarifas y Pago",
    payCard: "TARJETA",
    payQR: "QR",
    pay: "PAGAR",
    approved: "Pago aprobado",
    finish: "FINALIZAR",
    calibrOk: "Calibración: OK",
    calibrErr: "Calibración: Error",
    complies: "Cumple",
    notComplies: "No cumple",
    width: "Ancho",
    length: "Largo",
    height: "Alto",
    weight: "Peso",
    madeBy: "@jetsmart2025",
    imageSavedMock: "Imagen capturada (mock, guardado local en descarga)",
  },
  EN: {
    start: "START",
    welcome: "Welcome",
    scanStart: "START SCAN",
    configTitle: "Flight Configurator",
    save: "SAVE",
    back: "BACK",
    operator: "Operator",
    gate: "Gate",
    flight: "Flight #",
    destination: "Destination",
    intl: "International",
    scan: "SCAN",
    whyNo: "WHY NOT COMPLIANT?",
    goToPay: "CONTINUE TO PAYMENT",
    detailTitle: "Non-compliance detail",
    class: "Class",
    suitcase: "suitcase",
    realDims: "Real dimensions",
    rules: "Active rules",
    payTitle: "Rates & Payment",
    payCard: "CARD",
    payQR: "QR",
    pay: "PAY",
    approved: "Payment approved",
    finish: "FINISH",
    calibrOk: "Calibration: OK",
    calibrErr: "Calibration: Error",
    complies: "Complies",
    notComplies: "Does not comply",
    width: "Width",
    length: "Length",
    height: "Height",
    weight: "Weight",
    madeBy: "@jetsmart2025",
    imageSavedMock: "Image captured (mock, downloaded locally)",
  },
};

// Produce slightly random realistic baggage measurements around the rule edges
export function mockEvaluateBaggage() {
  // Randomize around limits; sometimes exceed
  const rand = (min, max) => Math.round(min + Math.random() * (max - min));
  const L = rand(RULES.L - 8, RULES.L + 12);
  const W = rand(RULES.W - 6, RULES.W + 10);
  const H = rand(RULES.H - 5, RULES.H + 8);
  const KG = Math.round((RULES.KG - 3 + Math.random() * 8) * 10) / 10; // 7–18kg
  const calibrationOk = Math.random() > 0.1; // 90% OK

  const overL = Math.max(0, L - RULES.L);
  const overW = Math.max(0, W - RULES.W);
  const overH = Math.max(0, H - RULES.H);
  const overKG = Math.max(0, Math.round((KG - RULES.KG) * 10) / 10);

  const linearRule = RULES.L + RULES.W + RULES.H; // 115
  const linearSum = L + W + H;
  const overLinear = Math.max(0, linearSum - linearRule);

  const reasons = [];
  if (overL > 0) reasons.push({ code: "L", label: `Excede largo ${overL} cm` });
  if (overW > 0) reasons.push({ code: "W", label: `Excede ancho ${overW} cm` });
  if (overH > 0) reasons.push({ code: "H", label: `Excede alto ${overH} cm` });
  if (overLinear > 0)
    reasons.push({ code: "S", label: `Excede suma lineal ${overLinear} cm` });
  if (overKG > 0) reasons.push({ code: "KG", label: `Excede peso ${overKG} kg` });

  const complies =
    calibrationOk && overL === 0 && overW === 0 && overH === 0 && overKG === 0;

  return {
    L,
    W,
    H,
    KG,
    calibrationOk,
    reasons,
    complies,
    overages: { overL, overW, overH, overKG, overLinear },
  };
}

// Simple pricing mock: $10 per extra kg, $5 per extra cm (linear)
export function mockPricing(overages) {
  const kg = Math.max(0, overages?.overKG || 0);
  const cm = Math.max(0, overages?.overLinear || 0);
  const weightUSD = Math.round(kg * 10);
  const dimsUSD = Math.round(cm * 5);
  const total = weightUSD + dimsUSD;
  return { weightUSD, dimsUSD, total };
}

export function formatRules() {
  return `L ${RULES.L} / W ${RULES.W} / H ${RULES.H} cm, Peso ${RULES.KG} kg`;
}

export function toDataUrl(canvas) {
  try {
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch (e) {
    return null;
  }
}

export function downloadDataUrl(dataUrl, fileName) {
  try {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {
    // noop
  }
}
