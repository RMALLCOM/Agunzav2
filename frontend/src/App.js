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
  const bgUrl = "https://images.unsplash.com/photo-1704636885666-bbda58f4af70?crop=entropy&cs=srgb&fm=jpg&q=85";
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
    &lt;div className="min-h-screen" style={{ backgroundColor: kiosk.airline?.palette?.bg || "#F7FAFF" }}&gt;
      &lt;div className="max-w-6xl mx-auto px-6 py-10"&gt;
        &lt;div className="flex items-center justify-between mb-8"&gt;
          &lt;h2 className="text-3xl font-bold"&gt;{tr.menu}&lt;/h2&gt;
          &lt;div className="flex items-center gap-2"&gt;
            &lt;Languages /&gt;
            &lt;Button variant="ghost" onClick={() =&gt; kiosk.setLang(kiosk.lang === "es" ? "en" : "es")}&gt;{kiosk.lang.toUpperCase()}&lt;/Button&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="grid grid-cols-1 md:grid-cols-3 gap-6"&gt;
          &lt;Card className="p-6 hover:shadow-2xl transition-shadow duration-200"&gt;
            &lt;Button className="w-full h-28" variant="primary" onClick={() =&gt; nav("/scan")}&gt;
              &lt;ScanLine className="mr-3" /&gt; {tr.scan}
            &lt;/Button&gt;
          &lt;/Card&gt;

          &lt;Card className="p-6 hover:shadow-2xl transition-shadow duration-200"&gt;
            &lt;Button className="w-full h-28" variant="primary" onClick={() =&gt; nav("/weigh")}&gt;
              &lt;Weight className="mr-3" /&gt; {tr.freeWeigh}
            &lt;/Button&gt;
          &lt;/Card&gt;

          &lt;Card className="p-6 hover:shadow-2xl transition-shadow duration-200"&gt;
            &lt;Button className="w-full h-28" variant="primary" onClick={() =&gt; nav("/train")}&gt;
              &lt;Wrench className="mr-3" /&gt; {tr.aiTrain}
            &lt;/Button&gt;
          &lt;/Card&gt;

          &lt;Card className="p-6 hover:shadow-2xl transition-shadow duration-200"&gt;
            &lt;Button className="w-full h-28" variant="outline" onClick={() =&gt; nav("/login/operator")}>&lt;Home className="mr-3" /&gt; {tr.opLogin}&lt;/Button&gt;
          &lt;/Card&gt;

          &lt;Card className="p-6 hover:shadow-2xl transition-shadow duration-200"&gt;
            &lt;Button className="w-full h-28" variant="outline" onClick={() =&gt; nav("/login/admin")}>&lt;Home className="mr-3" /&gt; {tr.adminLogin}&lt;/Button&gt;
          &lt;/Card&gt;
        &lt;/div&gt;

        &lt;div className="mt-10"&gt;
          &lt;Button variant="ghost" onClick={() =&gt; nav("/")}&gt;{tr.back}&lt;/Button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
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

  useEffect(() =&gt; {
    const start = async () =&gt; {
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
    return () =&gt; {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(t =&gt; t.stop());
      }
    };
  }, []);

  // Simulate YOLO overlay
  useEffect(() =&gt; {
    let raf;
    const draw = () =&gt; {
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
    return () =&gt; cancelAnimationFrame(raf);
  }, []);

  const readWeight = () =&gt; {
    // simulate scale reading
    const val = Math.round((Math.random() * 8 + 6) * 10) / 10; // 6-14kg
    setWeight(val);
  };

  const runValidation = async () =&gt; {
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
    &lt;div className="min-h-screen" style={{ backgroundColor: kiosk.airline?.palette?.bg || "#F7FAFF" }}&gt;
      &lt;div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6"&gt;
        &lt;div className="lg:col-span-2"&gt;
          &lt;div className="camera-wrap shadow-xl"&gt;
            &lt;video ref={videoRef} className="w-full h-[520px] object-cover rounded-2xl" /&gt;
            &lt;canvas ref={canvasRef} className="camera-overlay" /&gt;
          &lt;/div&gt;
          &lt;div className="flex gap-4 mt-4"&gt;
            &lt;Button variant="ghost" onClick={() =&gt; nav("/menu")}&gt;{tr.back}&lt;/Button&gt;
            &lt;Button variant="accent" onClick={runValidation}&gt;{tr.continue}&lt;/Button&gt;
            &lt;Button variant="primary" onClick={readWeight}&gt;{tr.readWeight}&lt;/Button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
        &lt;div&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;Datos de pieza&lt;/CardTitle&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;div className="space-y-2 text-lg"&gt;
                &lt;div&gt;&lt;b&gt;Ancho:&lt;/b&gt; {dims?.width ?? "-"} cm&lt;/div&gt;
                &lt;div&gt;&lt;b&gt;Alto:&lt;/b&gt; {dims?.height ?? "-"} cm&lt;/div&gt;
                &lt;div&gt;&lt;b&gt;Largo:&lt;/b&gt; {dims?.length ?? "-"} cm&lt;/div&gt;
                &lt;div className="text-2xl mt-3"&gt;&lt;b&gt;Peso:&lt;/b&gt; {weight ?? "-"} kg&lt;/div&gt;
              &lt;/div&gt;
              {result &amp;&amp; (
                &lt;div className="mt-6"&gt;
                  {result.compliant ? (
                    &lt;div className="badge success"&gt;&lt;CheckCircle2 /&gt; {strings[kiosk.lang].validationOk}&lt;/div&gt;
                  ) : (
                    &lt;div className="badge error"&gt;&lt;CircleAlert /&gt; {strings[kiosk.lang].validationFail}&lt;/div&gt;
                  )}
                  {!result.compliant &amp;&amp; (
                    &lt;ul className="list-disc pl-5 mt-3 text-red-700 space-y-1"&gt;
                      {result.errors.map((e, i) =&gt; (&lt;li key={i}&gt;{e}&lt;/li&gt;))}
                    &lt;/ul&gt;
                  )}
                  &lt;div className="flex gap-3 mt-6"&gt;
                    {result.compliant ? (
                      &lt;&gt;
                        &lt;Button variant="accent" onClick={() =&gt; nav("/goodbye")}&gt;{strings[kiosk.lang].continue}&lt;/Button&gt;
                      &lt;/&gt;
                    ) : (
                      &lt;&gt;
                        &lt;Button variant="ghost" onClick={() =&gt; { setResult(null); setDims(null); }}&gt;{strings[kiosk.lang].retryMeasure}&lt;/Button&gt;
                        &lt;Button variant="primary" onClick={() =&gt; nav("/payment", { state: { result } })}&gt;{strings[kiosk.lang].goToPayment}&lt;/Button&gt;
                      &lt;/&gt;
                    )}
                  &lt;/div&gt;
                &lt;/div&gt;
              )}
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
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

  useEffect(() =&gt; {
    // quick pull of rules and session to compute pricing
    const load = async () =&gt; {
      try {
        const airlines = (await axios.get(`${API}/config/airlines`)).data;
        const current = airlines.find(a =&gt; a.code === "JSM") || airlines[0];
        const rules = (await axios.get(`${API}/rules/${current.code}`)).data;
        let overweight = 0; let oversize = 0;
        if (result) {
          if (result.weight_kg &gt; rules.max_weight_kg) overweight = (result.weight_kg - rules.max_weight_kg) * rules.overweight_fee_per_kg;
          const linear = result.dims_cm.length + result.dims_cm.width + result.dims_cm.height;
          if (linear &gt; rules.max_linear_cm || result.dims_cm.length &gt; rules.dims_cm.length || result.dims_cm.width &gt; rules.dims_cm.width || result.dims_cm.height &gt; rules.dims_cm.height) {
            oversize = rules.oversize_fee_flat;
          }
        }
        setTotal(Math.max(0, Math.round((overweight + oversize) * 100) / 100));
        setKiosk({ rules, airline: current });
      } catch (e) {}
    };
    load();
  }, []);

  const pay = async () =&gt; {
    try {
      const ss = await axios.post(`${API}/sessions`, { airline_code: kiosk.airline.code, language: "es" });
      const { data } = await axios.post(`${API}/payments/simulate`, { session_id: ss.data.id, total, method });
      setStatus(data.status);
    } catch (e) {
      setStatus("rejected");
    }
  };

  return (
    &lt;div className="min-h-screen bg-white"&gt;
      &lt;div className="max-w-3xl mx-auto px-6 py-10"&gt;
        &lt;h2 className="text-3xl font-bold mb-6"&gt;Tarifas y Pago&lt;/h2&gt;
        {result &amp;&amp; (
          &lt;Card className="mb-6"&gt;
            &lt;CardContent&gt;
              &lt;div className="breakdown-row"&gt;&lt;span&gt;Exceso por peso&lt;/span&gt;&lt;span&gt;{result.weight_kg} kg&lt;/span&gt;&lt;/div&gt;
              &lt;div className="breakdown-row"&gt;&lt;span&gt;Exceso por dimensiones&lt;/span&gt;&lt;span&gt;{result.dims_cm.length + result.dims_cm.width + result.dims_cm.height} cm&lt;/span&gt;&lt;/div&gt;
              &lt;div className="breakdown-row font-bold"&gt;&lt;span&gt;Total&lt;/span&gt;&lt;span&gt;${'{'}total.toFixed(2){'}'} {kiosk?.rules?.currency || "USD"}&lt;/span&gt;&lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        )}

        &lt;div className="mb-4"&gt;
          &lt;label className="block font-semibold mb-2"&gt;Método de pago&lt;/label&gt;
          &lt;div className="flex gap-3"&gt;
            &lt;Button variant={method === "card" ? "primary" : "outline"} onClick={() =&gt; setMethod("card")} &gt;&lt;CreditCard className="mr-2" /&gt; Tarjeta&lt;/Button&gt;
            &lt;Button variant={method === "qr" ? "primary" : "outline"} onClick={() =&gt; setMethod("qr")} &gt;QR&lt;/Button&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="flex gap-4"&gt;
          &lt;Button variant="accent" onClick={pay}&gt;Pagar&lt;/Button&gt;
          &lt;Button variant="ghost" onClick={() =&gt; nav("/scan")} &gt;Volver&lt;/Button&gt;
        &lt;/div&gt;

        {status &amp;&amp; (
          &lt;div className="mt-6"&gt;
            {status === "approved" ? (
              &lt;div className="badge success"&gt;&lt;CheckCircle2 /&gt; Pago aprobado&lt;/div&gt;
            ) : (
              &lt;div className="badge error"&gt;&lt;CircleAlert /&gt; Pago rechazado&lt;/div&gt;
            )}
            {status === "approved" &amp;&amp; (
              &lt;div className="mt-4 flex gap-3"&gt;
                &lt;Button variant="primary" onClick={() =&gt; nav("/goodbye")}&gt;Finalizar&lt;/Button&gt;
              &lt;/div&gt;
            )}
          &lt;/div&gt;
        )}
      &lt;/div&gt;
    &lt;/div&gt;
  );
}

function FreeWeigh() {
  const nav = useNavigate();
  const [w, setW] = useState(0);
  useEffect(() =&gt; {
    const id = setInterval(() =&gt; setW(Math.round((Math.random() * 12 + 1) * 10) / 10), 1200);
    return () =&gt; clearInterval(id);
  }, []);
  return (
    &lt;div className="min-h-screen flex items-center justify-center" style={{ background: "#F7FAFF" }}&gt;
      &lt;Card className="w-full max-w-xl text-center"&gt;
        &lt;CardContent&gt;
          &lt;div className="text-6xl font-extrabold mb-6"&gt;{w} kg&lt;/div&gt;
          &lt;Button variant="ghost" onClick={() =&gt; nav("/menu")} &gt;Volver&lt;/Button&gt;
        &lt;/CardContent&gt;
      &lt;/Card&gt;
    &lt;/div&gt;
  );
}

function Train() {
  const [images, setImages] = useState([]);
  const [label, setLabel] = useState("maleta");
  const [log, setLog] = useState([]);

  const onFiles = async (e) =&gt; {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      await axios.post(`${API}/dataset/images`, { label, file_name: f.name });
      setImages(prev =&gt; [...prev, { name: f.name, label }]);
    }
  };

  const startTrain = async () =&gt; {
    const { data } = await axios.post(`${API}/train/start`, { airline_code: "JSM" });
    setLog(prev =&gt; [
      ...prev,
      `Training ${data.id} for ${data.airline_code} status: ${data.status}`
    ]);
  };

  return (
    &lt;div className="min-h-screen" style={{ background: "#F7FAFF" }}&gt;
      &lt;div className="max-w-4xl mx-auto px-6 py-10"&gt;
        &lt;h2 className="text-3xl font-bold mb-4"&gt;Entrenamiento de IA&lt;/h2&gt;
        &lt;div className="mb-4"&gt;
          &lt;label className="mr-3 font-semibold"&gt;Etiqueta:&lt;/label&gt;
          &lt;select className="border rounded px-3 py-2" value={label} onChange={e =&gt; setLabel(e.target.value)}&gt;
            &lt;option value="maleta"&gt;maleta&lt;/option&gt;
            &lt;option value="mochila"&gt;mochila&lt;/option&gt;
            &lt;option value="bolso"&gt;bolso&lt;/option&gt;
            &lt;option value="otro"&gt;otro&lt;/option&gt;
          &lt;/select&gt;
        &lt;/div&gt;
        &lt;input type="file" multiple onChange={onFiles} className="mb-4" /&gt;
        &lt;div className="mb-6"&gt;
          {images.map((im, i) =&gt; (
            &lt;div key={i} className="text-sm text-gray-700"&gt;{im.name} - {im.label}&lt;/div&gt;
          ))}
        &lt;/div&gt;
        &lt;Button variant="primary" onClick={startTrain}&gt;Entrenar YOLO (simulado)&lt;/Button&gt;
        &lt;div className="mt-6 space-y-1 text-sm text-gray-600"&gt;
          {log.map((l, i) =&gt; (&lt;div key={i}&gt;{l}&lt;/div&gt;))}
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}

function Goodbye() {
  const nav = useNavigate();
  useEffect(() =&gt; {
    const t = setTimeout(() =&gt; nav("/"), 2500);
    return () =&gt; clearTimeout(t);
  }, []);
  return (
    &lt;div className="min-h-screen flex items-center justify-center" style={{ background: "#F7FAFF" }}&gt;
      &lt;div className="text-center"&gt;
        &lt;CheckCircle2 className="mx-auto text-green-600" size={64} /&gt;
        &lt;div className="mt-3 text-2xl font-bold"&gt;¡Gracias!&lt;/div&gt;
        &lt;div className="text-gray-600"&gt;Volviendo a inicio...&lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}

function Shell() {
  const kiosk = useKiosk();
  return (
    &lt;Routes&gt;
      &lt;Route path="/" element={&lt;Welcome kiosk={kiosk} /&gt;} /&gt;
      &lt;Route path="/menu" element={&lt;Menu kiosk={kiosk} /&gt;} /&gt;
      &lt;Route path="/scan" element={&lt;Scan kiosk={kiosk} /&gt;} /&gt;
      &lt;Route path="/payment" element={&lt;Payment /&gt;} /&gt;
      &lt;Route path="/weigh" element={&lt;FreeWeigh /&gt;} /&gt;
      &lt;Route path="/train" element={&lt;Train /&gt;} /&gt;
      &lt;Route path="/goodbye" element={&lt;Goodbye /&gt;} /&gt;
    &lt;/Routes&gt;
  );
}

function App() {
  useEffect(() =&gt; {
    // warm up API
    axios.get(`${API}/`).catch(() =&gt; {});
  }, []);
  return (
    &lt;div className="App"&gt;
      &lt;BrowserRouter&gt;
        &lt;Shell /&gt;
      &lt;/BrowserRouter&gt;
    &lt;/div&gt;
  );
}

export default App;