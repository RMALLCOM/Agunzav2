import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { CheckCircle2, CircleAlert, CreditCard, Languages, ScanLine, Weight, Wrench } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// i18n minimal
const strings = {
  es: {
    startScan: "COMENZAR ESCANEO",
    setupTitle: "Configuración previa",
    operator: "Operador",
    gate: "Puerta de embarque",
    flight: "N° de vuelo",
    dest: "Destino",
    intl: "Internacional",
    save: "GUARDAR",
    back: "Volver",
    readWeight: "Leer peso",
    validationOk: "AUTORIZADO",
    validationOkSub: "Autorizado para embarque. ¡Buen viaje!",
    validationFail: "NO CUMPLE",
    retryMeasure: "Volver a medir",
    goToPayment: "Continuar al pago",
    payTitle: "Tarifas y Pago",
    start: "INICIAR",
  },
  en: {
    startScan: "START SCAN",
    setupTitle: "Pre-flight setup",
    operator: "Operator",
    gate: "Gate",
    flight: "Flight #",
    dest: "Destination",
    intl: "International",
    save: "SAVE",
    back: "Back",
    readWeight: "Read weight",
    validationOk: "AUTHORIZED",
    validationOkSub: "Authorized for boarding. Have a great trip!",
    validationFail: "NOT COMPLIANT",
    retryMeasure: "Measure again",
    goToPayment: "Continue to payment",
    payTitle: "Pricing & Payment",
  },
};

function useKiosk() {
  const [airline, setAirline] = useState(null);
  const [rules, setRules] = useState(null);
  const [lang, setLang] = useState("es");
  const [session, setSession] = useState(null);
  const [setup, setSetup] = useState(null);

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
      try {
        const { data } = await axios.get(`${API}/setup`);
        setSetup(data);
      } catch (_) {
        setSetup(null);
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

  return { airline, rules, lang, setLang, session, setSession, startSession, setup, setSetup };
}

// Hidden hotspot (triple tap) always present
function HiddenSetupHotspot() {
  const nav = useNavigate();
  const [count, setCount] = useState(0);
  const timerRef = useRef(null);
  const onClick = () => {
    setCount(c => {
      const next = c + 1;
      if (next === 1) {
        timerRef.current = setTimeout(() => setCount(0), 1200);
      }
      if (next >= 3) {
        clearTimeout(timerRef.current);
        setCount(0);
        nav("/setup");
      }
      return next;
    });
  };
  return <div onClick={onClick} className="fixed top-0 left-0 w-14 h-14 z-50" style={{ opacity: 0 }} />;
}

// Setup Screen
function SetupPage({ kiosk }) {
  const nav = useNavigate();
  const tr = strings[kiosk.lang];
  const [form, setForm] = useState({ operator_name: "", gate: "", flight_number: "", destination: "", is_international: false });

  const save = async () => {
    try {
      const payload = { ...form };
      const { data } = await axios.post(`${API}/setup`, payload);
      kiosk.setSetup(data);
      await axios.post(`${API}/interactions`, { event: "setup_saved_client", payload, setup_id: data.id });
      nav("/start");
    } catch (e) {
      console.error("setup save failed", e?.message);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7FAFF" }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold">{tr.setupTitle}</h2>
          <div className="flex items-center gap-2">
            <Languages />
            <Button variant="ghost" onClick={() => kiosk.setLang(kiosk.lang === "es" ? "en" : "es")}>{kiosk.lang.toUpperCase()}</Button>
          </div>
        </div>
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">{tr.operator}</label>
                <input className="w-full border rounded px-3 py-3 text-lg" value={form.operator_name} onChange={e => setForm({ ...form, operator_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{tr.gate}</label>
                <input className="w-full border rounded px-3 py-3 text-lg" value={form.gate} onChange={e => setForm({ ...form, gate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{tr.flight}</label>
                <input className="w-full border rounded px-3 py-3 text-lg" value={form.flight_number} onChange={e => setForm({ ...form, flight_number: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{tr.dest}</label>
                <input className="w-full border rounded px-3 py-3 text-lg" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input id="intl" type="checkbox" className="w-5 h-5" checked={form.is_international} onChange={e => setForm({ ...form, is_international: e.target.checked })} />
                <label htmlFor="intl" className="text-lg font-semibold">{tr.intl}</label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="accent" onClick={save}>{tr.save}</Button>
              <Button variant="ghost" onClick={() => nav("/")}>{tr.back}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Welcome screen (Inicio)
function Welcome({ kiosk }) {
  const nav = useNavigate();
  const tr = strings[kiosk.lang];
  const bgUrl = "https://customer-assets.emergentagent.com/job_airport-luggage/artifacts/uqbelias_image%2012.png";
  return (
    <div className="relative min-h-screen kiosk-bg" style={{ backgroundImage: `url(${bgUrl})` }}>
      <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
        <Languages />
        <Button variant="ghost" onClick={() => kiosk.setLang(kiosk.lang === "es" ? "en" : "es")}>{kiosk.lang.toUpperCase()}</Button>
      </div>
      <div className="hero-overlay absolute inset-0 flex items-center justify-center">
        <div className="text-center max-w-3xl p-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">JetSMART</h1>
          <p className="text-gray-700 mb-8">Bienvenido</p>
          <Button className="text-2xl px-10 py-6" variant="accent" onClick={() => nav("/start")}>{tr.start}</Button>
        </div>
      </div>
    </div>
  );
}

// Start tab screen (default)
function StartScanTab({ kiosk }) {
  const nav = useNavigate();
  const tr = strings[kiosk.lang];

  useEffect(() => {
    const check = async () => {
      try {
        await axios.get(`${API}/setup`);
      } catch (_) {
        nav("/setup");
      }
    };
    check();
  }, []);

  return (
    <div className="relative min-h-screen kiosk-bg" style={{ backgroundImage: `url(https://customer-assets.emergentagent.com/job_airport-luggage/artifacts/uqbelias_image%2012.png)` }}>
      <div className="hero-overlay absolute inset-0 flex items-center justify-center">
        <div className="text-center max-w-3xl p-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">JetSMART</h1>
          <Button className="text-2xl px-10 py-6" variant="accent" onClick={() => nav("/scan")}>{tr.startScan}</Button>
        </div>
      </div>
    </div>
  );
}

// Scan (unchanged core, with redirect after finish)
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
            <Button variant="ghost" onClick={() => nav("/")}>VOLVER</Button>
            <Button variant="accent" onClick={runValidation}>CONTINUAR</Button>
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
                    <div className="badge success">{strings[kiosk.lang].validationOk}</div>
                  ) : (
                    <div className="badge error">{strings[kiosk.lang].validationFail}</div>
                  )}
                  {!result.compliant && (
                    <ul className="list-disc pl-5 mt-3 text-red-700 space-y-1">
                      {result.errors.map((e, i) => (<li key={i}>{e}</li>))}
                    </ul>
                  )}
                  <div className="flex gap-3 mt-6">
                    {result.compliant ? (
                      <>
                        <Button variant="accent" onClick={() => nav("/goodbye")}>CONTINUAR</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" onClick={() => { setResult(null); setDims(null); }}>VOLVER A MEDIR</Button>
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
              <div className="breakdown-row font-bold"><span>Total</span><span>{`$${total.toFixed(2)} ${kiosk?.rules?.currency || "USD"}`}</span></div>
            </CardContent>
          </Card>
        )}

        <div className="mb-4">
          <label className="block font-semibold mb-2">Método de pago</label>
          <div className="flex gap-3">
            <Button variant={method === "card" ? "primary" : "outline"} onClick={() => setMethod("card")} >Tarjeta</Button>
            <Button variant={method === "qr" ? "primary" : "outline"} onClick={() => setMethod("qr")} >QR</Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="accent" onClick={pay}>PROCESAR PAGO</Button>
          <Button variant="ghost" onClick={() => nav("/scan")} >VOLVER</Button>
        </div>

        {status && (
          <div className="mt-6">
            {status === "approved" ? (
              <div className="badge success">Pago aprobado</div>
            ) : (
              <div className="badge error">Pago rechazado</div>
            )}
            {status === "approved" && (
              <div className="mt-4 flex gap-3">
                <Button variant="primary" onClick={() => nav("/goodbye")}>FINALIZAR</Button>
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
          <Button variant="ghost" onClick={() => nav("/")} >VOLVER</Button>
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
    const t = setTimeout(() => nav("/"), 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7FAFF" }}>
      <div className="text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={64} />
        <div className="mt-3 text-2xl font-bold">¡Gracias!</div>
        <div className="text-gray-600">Volviendo…</div>
      </div>
    </div>
  );
}

function Shell() {
  const kiosk = useKiosk();
  return (
    <>
      <HiddenSetupHotspot />
      <Routes>
        <Route path="/" element={<Welcome kiosk={kiosk} />} />
        <Route path="/start" element={<StartScanTab kiosk={kiosk} />} />
        <Route path="/setup" element={<SetupPage kiosk={kiosk} />} />
        <Route path="/scan" element={<Scan kiosk={kiosk} />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/weigh" element={<FreeWeigh />} />
        <Route path="/train" element={<Train />} />
        <Route path="/goodbye" element={<Goodbye />} />
      </Routes>
    </>
  );
}

function App() {
  useEffect(() => {
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