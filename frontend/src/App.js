import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Camera, CheckCircle2, CircleAlert, CreditCard, Home, Languages, ScanLine, Weight, Wrench } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// i18n minimal
const strings = {
  es: {
    welcome: "Bienvenido",
    start: "INICIAR",
    menu: "Menú Principal",
    scan: "Iniciar escaneo",
    freeWeigh: "Pesaje libre",
    aiTrain: "Entrenamiento IA",
    opLogin: "Login Operador",
    adminLogin: "Login Administrador",
    back: "Volver",
    continue: "Continuar",
    readWeight: "Leer peso",
    validationOk: "Cumple",
    validationOkSub: "Autorizado para embarque. ¡Buen viaje!",
    validationFail: "No cumple",
    retryMeasure: "Volver a medir",
    goToPayment: "Ir a tarifario/pago",
    payTitle: "Tarifas y Pago",
    method: "Método de pago",
    card: "Tarjeta débito/crédito (POS)",
    qr: "QR",
    pay: "Pagar",
    print: "Imprimir recibo",
    finish: "Finalizar",
    trainingTitle: "Entrenamiento de IA",
    upload: "Subir imágenes etiquetadas",
    train: "Entrenar YOLO (simulado)",
    freeWeightTitle: "Pesaje Libre",
  },
  en: {
    welcome: "Welcome",
    start: "START",
    menu: "Main Menu",
    scan: "Start scan",
    freeWeigh: "Free weigh",
    aiTrain: "AI Training",
    opLogin: "Operator Login",
    adminLogin: "Admin Login",
    back: "Back",
    continue: "Continue",
    readWeight: "Read weight",
    validationOk: "Compliant",
    validationOkSub: "Authorized for boarding. Have a great trip!",
    validationFail: "Not compliant",
    retryMeasure: "Measure again",
    goToPayment: "Go to pricing/payment",
    payTitle: "Pricing & Payment",
    method: "Payment method",
    card: "Debit/Credit (POS)",
    qr: "QR",
    pay: "Pay",
    print: "Print receipt",
    finish: "Finish",
    trainingTitle: "AI Training",
    upload: "Upload labeled images",
    train: "Train YOLO (simulated)",
    freeWeightTitle: "Free Weigh",
  },
};

function useKiosk() {
  const [airline, setAirline] = useState(null);
  const [rules, setRules] = useState(null);
  const [lang, setLang] = useState("es");
  const [session, setSession] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: airlines } = await axios.get(`${API}/config/airlines`);
        const current = airlines.find(a => a.code === "JSM") || airlines[0];
        setAirline(current);
        if (current) {
          const { data: r } = await axios.get(`${API}/rules/${current.code}`);
          setRules(r);
        }
      } catch (e) {
        console.error("Failed to load airline/rules", e?.message);
      }
    };
    init();
  }, []);

  const startSession = async () => {
    if (!airline) return;
    const { data } = await axios.post(`${API}/sessions`, { airline_code: airline.code, language: lang });
    setSession(data);
    return data;
  };

  return { airline, rules, lang, setLang, session, setSession, startSession };
}

// Welcome Screen
function Welcome({ kiosk }) {
  const nav = useNavigate();
  const bgUrl = "https://customer-assets.emergentagent.com/job_airport-luggage/artifacts/uqbelias_image%2012.png";
  const tr = strings[kiosk.lang];

  return (
    <div className="relative h-screen w-full kiosk-bg" style={{ backgroundImage: `url(${bgUrl})` }}>
      <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
        <Languages className="text-gray-700" />
        <Button variant="ghost" onClick={() => kiosk.setLang(kiosk.lang === "es" ? "en" : "es")}>{kiosk.lang.toUpperCase()}</Button>
      </div>
      <div className="hero-overlay absolute inset-0 flex items-center justify-center">
        <div className="text-center max-w-3xl p-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">{kiosk.airline?.name || "Kiosk"}</h1>
          <p className="text-gray-700 mb-8">{tr.welcome}</p>
          <Button className="text-2xl px-10 py-6" variant="accent" onClick={() => nav("/menu")}>{tr.start}</Button>
        </div>
      </div>
    </div>
  );
}

// Menu Screen
function Menu({ kiosk }) {
  const nav = useNavigate();
  const tr = strings[kiosk.lang];
  return (
    <div className="min-h-screen" style={{ backgroundColor: kiosk.airline?.palette?.bg || "#F7FAFF" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{tr.menu}</h2>
          <div className="flex items-center gap-2">
            <Languages />
            <Button variant="ghost" onClick={() => kiosk.setLang(kiosk.lang === "es" ? "en" : "es")}>{kiosk.lang.toUpperCase()}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-2xl transition-shadow duration-200">
            <Button className="w-full h-28" variant="primary" onClick={() => nav("/scan")}>
              <ScanLine className="mr-3" /> {tr.scan}
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-2xl transition-shadow duration-200">
            <Button className="w-full h-28" variant="primary" onClick={() => nav("/weigh")}>
              <Weight className="mr-3" /> {tr.freeWeigh}
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-2xl transition-shadow duration-200">
            <Button className="w-full h-28" variant="primary" onClick={() => nav("/train")}>
              <Wrench className="mr-3" /> {tr.aiTrain}
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-2xl transition-shadow duration-200">
            <Button className="w-full h-28" variant="outline" onClick={() => nav("/login/operator")}><Home className="mr-3" /> {tr.opLogin}</Button>
          </Card>

          <Card className="p-6 hover:shadow-2xl transition-shadow duration-200">
            <Button className="w-full h-28" variant="outline" onClick={() => nav("/login/admin")}><Home className="mr-3" /> {tr.adminLogin}</Button>
          </Card>
        </div>

        <div className="mt-10">
          <Button variant="ghost" onClick={() => nav("/")}>{tr.back}</Button>
        </div>
      </div>
    </div>
  );
}

// Scan Screen
function Scan({ kiosk }) {
  const nav = useNavigate();
  const tr = strings[kiosk.lang];
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [weight, setWeight] = useState(null);
  const [dims, setDims] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        console.error("Camera error", e);
      }
    };
    start();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, []);

  // Simulate YOLO overlay
  useEffect(() => {
    let raf;
    const draw = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) { raf = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // Fake box
      const x = canvas.width * 0.2; const y = canvas.height * 0.2;
      const w = canvas.width * 0.6; const h = canvas.height * 0.6;
      ctx.strokeStyle = "#E20C18"; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = "rgba(226,12,24,0.8)"; ctx.font = "20px sans-serif";
      ctx.fillRect(x, y - 28, 120, 24);
      ctx.fillStyle = "#fff"; ctx.fillText("maleta", x + 8, y - 10);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const readWeight = () => {
    // simulate scale reading
    const val = Math.round((Math.random() * 8 + 6) * 10) / 10; // 6-14kg
    setWeight(val);
  };

  const runValidation = async () => {
    try {
      const ss = kiosk.session || await kiosk.startSession();
      const { data } = await axios.post(`${API}/scan`, { session_id: ss.id, weight_kg: weight });
      setDims(data.dims_cm);
      setResult(data);
    } catch (e) {
      console.error("scan failed", e.message);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: kiosk.airline?.palette?.bg || "#F7FAFF" }}>
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="camera-wrap shadow-xl">
            <video ref={videoRef} className="w-full h-[520px] object-cover rounded-2xl" />
            <canvas ref={canvasRef} className="camera-overlay" />
          </div>
          <div className="flex gap-4 mt-4">
            <Button variant="ghost" onClick={() => nav("/menu")}>{tr.back}</Button>
            <Button variant="accent" onClick={runValidation}>{tr.continue}</Button>
            <Button variant="primary" onClick={readWeight}>{tr.readWeight}</Button>
          </div>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Datos de pieza</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-lg">
                <div><b>Ancho:</b> {dims?.width ?? "-"} cm</div>
                <div><b>Alto:</b> {dims?.height ?? "-"} cm</div>
                <div><b>Largo:</b> {dims?.length ?? "-"} cm</div>
                <div className="text-2xl mt-3"><b>Peso:</b> {weight ?? "-"} kg</div>
              </div>
              {result && (
                <div className="mt-6">
                  {result.compliant ? (
                    <div className="badge success"><CheckCircle2 /> {strings[kiosk.lang].validationOk}</div>
                  ) : (
                    <div className="badge error"><CircleAlert /> {strings[kiosk.lang].validationFail}</div>
                  )}
                  {!result.compliant && (
                    <ul className="list-disc pl-5 mt-3 text-red-700 space-y-1">
                      {result.errors.map((e, i) => (<li key={i}>{e}</li>))}
                    </ul>
                  )}
                  <div className="flex gap-3 mt-6">
                    {result.compliant ? (
                      <>
                        <Button variant="accent" onClick={() => nav("/goodbye")}>{strings[kiosk.lang].continue}</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" onClick={() => { setResult(null); setDims(null); }}>{strings[kiosk.lang].retryMeasure}</Button>
                        <Button variant="primary" onClick={() => nav("/payment", { state: { result } })}>{strings[kiosk.lang].goToPayment}</Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Payment() {
  const nav = useNavigate();
  const state = window.history.state?.usr || {};
  const result = state.result || null;
  const [method, setMethod] = useState("card");
  const [status, setStatus] = useState(null);
  const [total, setTotal] = useState(0);
  const [kiosk, setKiosk] = useState(null);

  useEffect(() => {
    // quick pull of rules and session to compute pricing
    const load = async () => {
      try {
        const airlines = (await axios.get(`${API}/config/airlines`)).data;
        const current = airlines.find(a => a.code === "JSM") || airlines[0];
        const rules = (await axios.get(`${API}/rules/${current.code}`)).data;
        let overweight = 0; let oversize = 0;
        if (result) {
          if (result.weight_kg > rules.max_weight_kg) overweight = (result.weight_kg - rules.max_weight_kg) * rules.overweight_fee_per_kg;
          const linear = result.dims_cm.length + result.dims_cm.width + result.dims_cm.height;
          if (linear > rules.max_linear_cm || result.dims_cm.length > rules.dims_cm.length || result.dims_cm.width > rules.dims_cm.width || result.dims_cm.height > rules.dims_cm.height) {
            oversize = rules.oversize_fee_flat;
          }
        }
        setTotal(Math.max(0, Math.round((overweight + oversize) * 100) / 100));
        setKiosk({ rules, airline: current });
      } catch (e) {}
    };
    load();
  }, []);

  const pay = async () => {
    try {
      const ss = await axios.post(`${API}/sessions`, { airline_code: kiosk.airline.code, language: "es" });
      const { data } = await axios.post(`${API}/payments/simulate`, { session_id: ss.data.id, total, method });
      setStatus(data.status);
    } catch (e) {
      setStatus("rejected");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-6">Tarifas y Pago</h2>
        {result && (
          <Card className="mb-6">
            <CardContent>
              <div className="breakdown-row"><span>Exceso por peso</span><span>{result.weight_kg} kg</span></div>
              <div className="breakdown-row"><span>Exceso por dimensiones</span><span>{result.dims_cm.length + result.dims_cm.width + result.dims_cm.height} cm</span></div>
              <div className="breakdown-row font-bold"><span>Total</span><span>${'{'}total.toFixed(2){'}'} {kiosk?.rules?.currency || "USD"}</span></div>
            </CardContent>
          </Card>
        )}

        <div className="mb-4">
          <label className="block font-semibold mb-2">Método de pago</label>
          <div className="flex gap-3">
            <Button variant={method === "card" ? "primary" : "outline"} onClick={() => setMethod("card")} ><CreditCard className="mr-2" /> Tarjeta</Button>
            <Button variant={method === "qr" ? "primary" : "outline"} onClick={() => setMethod("qr")} >QR</Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="accent" onClick={pay}>Pagar</Button>
          <Button variant="ghost" onClick={() => nav("/scan")} >Volver</Button>
        </div>

        {status && (
          <div className="mt-6">
            {status === "approved" ? (
              <div className="badge success"><CheckCircle2 /> Pago aprobado</div>
            ) : (
              <div className="badge error"><CircleAlert /> Pago rechazado</div>
            )}
            {status === "approved" && (
              <div className="mt-4 flex gap-3">
                <Button variant="primary" onClick={() => nav("/goodbye")}>Finalizar</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FreeWeigh() {
  const nav = useNavigate();
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setW(Math.round((Math.random() * 12 + 1) * 10) / 10), 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7FAFF" }}>
      <Card className="w-full max-w-xl text-center">
        <CardContent>
          <div className="text-6xl font-extrabold mb-6">{w} kg</div>
          <Button variant="ghost" onClick={() => nav("/menu")} >Volver</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Train() {
  const [images, setImages] = useState([]);
  const [label, setLabel] = useState("maleta");
  const [log, setLog] = useState([]);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      await axios.post(`${API}/dataset/images`, { label, file_name: f.name });
      setImages(prev => [...prev, { name: f.name, label }]);
    }
  };

  const startTrain = async () => {
    const { data } = await axios.post(`${API}/train/start`, { airline_code: "JSM" });
    setLog(prev => [
      ...prev,
      `Training ${data.id} for ${data.airline_code} status: ${data.status}`
    ]);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7FAFF" }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-4">Entrenamiento de IA</h2>
        <div className="mb-4">
          <label className="mr-3 font-semibold">Etiqueta:</label>
          <select className="border rounded px-3 py-2" value={label} onChange={e => setLabel(e.target.value)}>
            <option value="maleta">maleta</option>
            <option value="mochila">mochila</option>
            <option value="bolso">bolso</option>
            <option value="otro">otro</option>
          </select>
        </div>
        <input type="file" multiple onChange={onFiles} className="mb-4" />
        <div className="mb-6">
          {images.map((im, i) => (
            <div key={i} className="text-sm text-gray-700">{im.name} - {im.label}</div>
          ))}
        </div>
        <Button variant="primary" onClick={startTrain}>Entrenar YOLO (simulado)</Button>
        <div className="mt-6 space-y-1 text-sm text-gray-600">
          {log.map((l, i) => (<div key={i}>{l}</div>))}
        </div>
      </div>
    </div>
  );
}

function Goodbye() {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav("/"), 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7FAFF" }}>
      <div className="text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={64} />
        <div className="mt-3 text-2xl font-bold">¡Gracias!</div>
        <div className="text-gray-600">Volviendo a inicio...</div>
      </div>
    </div>
  );
}

function Shell() {
  const kiosk = useKiosk();
  return (
    <Routes>
      <Route path="/" element={<Welcome kiosk={kiosk} />} />
      <Route path="/menu" element={<Menu kiosk={kiosk} />} />
      <Route path="/scan" element={<Scan kiosk={kiosk} />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/weigh" element={<FreeWeigh />} />
      <Route path="/train" element={<Train />} />
      <Route path="/goodbye" element={<Goodbye />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // warm up API
    axios.get(`${API}/`).catch(() => {});
  }, []);
  return (
    <div className="App">
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </div>
  );
}

export default App;