import React, { useEffect, useRef, useState } from "react";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { CheckCircle2, CircleAlert, Languages, Camera, Download } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Traducciones completas
const stringsDict = {
  es: {
    welcome: "Bienvenido",
    start: "INICIAR", 
    jetsmartTitle: "JetSMART",
    configurator: "Configurador de vuelos",
    operator: "Operador",
    gate: "Puerta de embarque",
    flightNumber: "Nº de vuelo",
    destination: "Destino",
    international: "Internacional",
    save: "GUARDAR",
    back: "VOLVER",
    startScan: "COMENZAR ESCANEO",
    scan: "ESCANEAR",
    scanTitle: "Escaneo",
    measurements: "Mediciones",
    width: "Ancho",
    length: "Largo", 
    weight: "Peso",
    calibration: "Calibración",
    ok: "OK",
    notCompliant: "No cumple",
    whyNotCompliant: "¿POR QUÉ NO CUMPLE?",
    continueToPay: "CONTINUAR AL PAGO",
    nonComplianceDetail: "Detalle de no cumplimiento",
    bagClass: "Clase: maleta",
    realDimensions: "Dimensiones reales",
    activeRules: "Reglas activas",
    exceedReasons: "Razones de exceso",
    goToTariffs: "IR A TARIFAS/PAGO",
    tariffsTitle: "Tarifas y Pago",
    excessWeight: "Exceso por peso",
    excessDimensions: "Exceso por dimensiones", 
    totalUSD: "Total USD",
    card: "TARJETA",
    qr: "QR",
    pay: "PAGAR",
    paymentApproved: "Pago aprobado ✅",
    finish: "FINALIZAR",
    madeWithEmergent: "Made with Emergent",
    kg: "kg",
    cm: "cm",
    captureSuccess: "Imagen capturada correctamente"
  },
  en: {
    welcome: "Welcome",
    start: "START",
    jetsmartTitle: "JetSMART", 
    configurator: "Flight configurator",
    operator: "Operator",
    gate: "Boarding gate",
    flightNumber: "Flight number",
    destination: "Destination",
    international: "International",
    save: "SAVE",
    back: "BACK",
    startScan: "START SCAN",
    scan: "SCAN",
    scanTitle: "Scan",
    measurements: "Measurements",
    width: "Width",
    length: "Length",
    weight: "Weight", 
    calibration: "Calibration",
    ok: "OK",
    notCompliant: "Not compliant",
    whyNotCompliant: "WHY NOT COMPLIANT?",
    continueToPay: "CONTINUE TO PAY",
    nonComplianceDetail: "Non-compliance detail",
    bagClass: "Class: suitcase",
    realDimensions: "Real dimensions",
    activeRules: "Active rules",
    exceedReasons: "Excess reasons",
    goToTariffs: "GO TO RATES/PAYMENT",
    tariffsTitle: "Rates & Payment",
    excessWeight: "Excess weight",
    excessDimensions: "Excess dimensions",
    totalUSD: "Total USD", 
    card: "CARD",
    qr: "QR",
    pay: "PAY",
    paymentApproved: "Payment approved ✅",
    finish: "FINISH", 
    madeWithEmergent: "Made with Emergent",
    kg: "kg", 
    cm: "cm",
    captureSuccess: "Image captured successfully"
  }
};

// Hook para estado global
function useKiosk() {
  const [lang, setLang] = useState("es");
  const [flightConfig, setFlightConfig] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  
  return { 
    lang, 
    setLang, 
    flightConfig, 
    setFlightConfig,
    scanResult,
    setScanResult,
    capturedImage,
    setCapturedImage
  };
}

// Componente selector de idioma
function LangSwitch({ kiosk }) {
  return (
    <div className="absolute top-4 right-4 z-20">
      <Button
        variant="ghost"
        className="flex items-center gap-2 bg-white/90 text-[#1E3F8A] font-bold px-4 py-2 rounded-lg shadow hover:bg-white"
        onClick={() => kiosk.setLang(kiosk.lang === "es" ? "en" : "es")}
      >
        <Languages className="w-5 h-5" /> {kiosk.lang.toUpperCase()}
      </Button>
    </div>
  );
}

// Pie de página
function Footer({ kiosk }) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm">
      {stringsDict[kiosk.lang].madeWithEmergent}
    </div>
  );
}

// Pantalla de inicio
function WelcomeScreen({ kiosk }) {
  const nav = useNavigate();
  const strings = stringsDict[kiosk.lang];
  
  const bgImage = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80";
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 to-blue-700">
      {/* Imagen de fondo difuminada */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      <LangSwitch kiosk={kiosk} />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-8">
        <h1 className="text-8xl font-bold mb-4 text-center">{strings.jetsmartTitle}</h1>
        <h2 className="text-3xl font-light mb-16 text-center">{strings.welcome}</h2>
        
        <Button 
          onClick={() => nav("/config")}
          className="bg-[#E20C18] hover:bg-[#C70A15] text-white text-2xl px-16 py-8 rounded-xl font-bold text-center min-h-[80px] shadow-2xl"
        >
          {strings.start}
        </Button>
      </div>
      
      <Footer kiosk={kiosk} />
    </div>
  );
}

// Configurador de vuelo
function FlightConfig({ kiosk }) {
  const nav = useNavigate();
  const strings = stringsDict[kiosk.lang];
  const [formData, setFormData] = useState({
    operator: "",
    gate: "A1", 
    flightNumber: "",
    destination: "",
    international: false
  });
  
  const gates = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"];
  const destinations = [
    "Santiago - SCL",
    "Calama - CJC", 
    "Antofagasta - ANF",
    "Iquique - IQQ",
    "Arica - ARI",
    "La Serena - LSC",
    "Valparaíso - VAP",
    "Temuco - ZCO",
    "Puerto Montt - PMC",
    "Punta Arenas - PUQ"
  ];
  
  const handleSave = () => {
    kiosk.setFlightConfig(formData);
    nav("/start");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <LangSwitch kiosk={kiosk} />
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1E3F8A] text-center mb-12">{strings.configurator}</h1>
        
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Operador */}
              <div>
                <label className="block text-lg font-semibold text-[#1E3F8A] mb-2">{strings.operator}</label>
                <input 
                  type="text"
                  value={formData.operator}
                  onChange={(e) => setFormData({...formData, operator: e.target.value})}
                  className="w-full p-4 border-2 border-[#1E3F8A] rounded-lg text-lg"
                  placeholder={strings.operator}
                />
              </div>
              
              {/* Puerta */}
              <div>
                <label className="block text-lg font-semibold text-[#1E3F8A] mb-2">{strings.gate}</label>
                <select 
                  value={formData.gate}
                  onChange={(e) => setFormData({...formData, gate: e.target.value})}
                  className="w-full p-4 border-2 border-[#1E3F8A] rounded-lg text-lg"
                >
                  {gates.map(gate => (
                    <option key={gate} value={gate}>{gate}</option>
                  ))}
                </select>
              </div>
              
              {/* Número de vuelo */}
              <div>
                <label className="block text-lg font-semibold text-[#1E3F8A] mb-2">{strings.flightNumber}</label>
                <input 
                  type="text"
                  value={formData.flightNumber}
                  onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
                  className="w-full p-4 border-2 border-[#1E3F8A] rounded-lg text-lg"
                  placeholder="JAT001"
                />
              </div>
              
              {/* Destino */}
              <div>
                <label className="block text-lg font-semibold text-[#1E3F8A] mb-2">{strings.destination}</label>
                <select 
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  className="w-full p-4 border-2 border-[#1E3F8A] rounded-lg text-lg"
                >
                  <option value="">{strings.destination}</option>
                  {destinations.map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>
              
              {/* Internacional */}
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox"
                  id="international"
                  checked={formData.international}
                  onChange={(e) => setFormData({...formData, international: e.target.checked})}
                  className="w-6 h-6"
                />
                <label htmlFor="international" className="text-lg font-semibold text-[#1E3F8A]">
                  {strings.international}
                </label>
              </div>
            </div>
            
            {/* Botones */}
            <div className="flex justify-between mt-12">
              <Button 
                onClick={() => nav("/")}
                variant="outline"
                className="text-lg px-8 py-4 border-2 border-[#1E3F8A] text-[#1E3F8A] hover:bg-[#1E3F8A] hover:text-white"
              >
                {strings.back}
              </Button>
              
              <Button 
                onClick={handleSave}
                className="bg-[#E20C18] hover:bg-[#C70A15] text-white text-lg px-12 py-4"
              >
                {strings.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer kiosk={kiosk} />
    </div>
  );
}

// Pantalla de inicio del escaneo
function StartScan({ kiosk }) {
  const nav = useNavigate();
  const strings = stringsDict[kiosk.lang];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col items-center justify-center text-white">
      <LangSwitch kiosk={kiosk} />
      
      <h1 className="text-8xl font-bold mb-16 text-center">{strings.jetsmartTitle}</h1>
      
      <Button 
        onClick={() => nav("/scan")}
        className="bg-[#E20C18] hover:bg-[#C70A15] text-white text-3xl px-20 py-10 rounded-xl font-bold shadow-2xl"
      >
        {strings.startScan}
      </Button>
      
      <Footer kiosk={kiosk} />
    </div>
  );
}

// Componente de cámara con captura
function CameraCapture({ onCapture, kiosk }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const strings = stringsDict[kiosk.lang];
  
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => setIsReady(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("No se pudo acceder a la cámara");
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };
  
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `equipaje_${timestamp}.jpg`;
        
        // Crear enlace de descarga
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Guardar imagen capturada
        kiosk.setCapturedImage(url);
        
        // Simular mediciones
        const measurements = {
          width: Math.round((Math.random() * 20 + 40) * 10) / 10, // 40-60 cm
          length: Math.round((Math.random() * 20 + 50) * 10) / 10, // 50-70 cm  
          weight: Math.round((Math.random() * 8 + 6) * 10) / 10, // 6-14 kg
          calibration: "OK"
        };
        
        kiosk.setScanResult(measurements);
        onCapture(measurements);
      }, 'image/jpeg', 0.8);
    }
  };
  
  return (
    <div className="relative">
      <video 
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-4xl h-96 bg-black rounded-lg border-4 border-[#1E3F8A]"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {isReady && (
        <Button
          onClick={captureImage}
          className="absolute bottom-4 right-4 bg-[#E20C18] hover:bg-[#C70A15] text-white px-6 py-3 rounded-lg font-bold"
        >
          <Camera className="w-5 h-5 mr-2" />
          {strings.scan}
        </Button>
      )}
    </div>
  );
}

// Pantalla de escaneo
function ScanScreen({ kiosk }) {
  const nav = useNavigate();
  const strings = stringsDict[kiosk.lang];
  const [measurements, setMeasurements] = useState(null);
  const [isCompliant, setIsCompliant] = useState(null);
  
  // Límites permitidos
  const limits = {
    width: 35,
    length: 55, 
    weight: 10,
    linearSum: 115
  };
  
  const handleCapture = (results) => {
    setMeasurements(results);
    
    // Validar cumplimiento
    const excesses = [];
    if (results.width > limits.width) {
      excesses.push(`Excede ancho ${(results.width - limits.width).toFixed(1)} cm`);
    }
    if (results.length > limits.length) {
      excesses.push(`Excede largo ${(results.length - limits.length).toFixed(1)} cm`);
    }
    if (results.weight > limits.weight) {
      excesses.push(`Excede peso ${(results.weight - limits.weight).toFixed(1)} kg`);
    }
    
    const linearSum = results.width + results.length;
    if (linearSum > limits.linearSum) {
      excesses.push(`Excede suma lineal ${(linearSum - limits.linearSum).toFixed(1)} cm`);
    }
    
    const compliant = excesses.length === 0;
    setIsCompliant(compliant);
    
    // Guardar resultado completo
    kiosk.setScanResult({
      ...results,
      compliant,
      excesses
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <LangSwitch kiosk={kiosk} />
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1E3F8A] text-center mb-8">{strings.scanTitle}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cámara */}
          <div>
            <CameraCapture onCapture={handleCapture} kiosk={kiosk} />
          </div>
          
          {/* Mediciones */}
          <div>
            <Card className="shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-[#1E3F8A] mb-6">{strings.measurements}</h3>
                
                {measurements ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">{strings.width}:</span>
                      <span>{measurements.width} {strings.cm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">{strings.length}:</span>
                      <span>{measurements.length} {strings.cm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">{strings.weight}:</span>
                      <span>{measurements.weight} {strings.kg}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">{strings.calibration}:</span>
                      <span className="text-green-600 font-bold">{strings.ok}</span>
                    </div>
                    
                    {/* Resultado */}
                    <div className="mt-8 p-4 rounded-lg">
                      {isCompliant ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                          <p className="text-2xl font-bold text-green-600 mb-4">✅ Cumple</p>
                          <Button 
                            onClick={() => nav("/start")}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                          >
                            Continuar
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <CircleAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
                          <p className="text-2xl font-bold text-red-600 mb-6">{strings.notCompliant}</p>
                          
                          <div className="space-y-3">
                            <Button 
                              onClick={() => nav("/detail")}
                              variant="outline" 
                              className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white py-3"
                            >
                              {strings.whyNotCompliant}
                            </Button>
                            <Button 
                              onClick={() => nav("/tariffs")}
                              className="w-full bg-[#E20C18] hover:bg-[#C70A15] text-white py-3"
                            >
                              {strings.continueToPay}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{strings.captureSuccess}</p>
                )}
                
                <Button 
                  onClick={() => nav("/start")}
                  variant="outline"
                  className="w-full mt-6 border-[#1E3F8A] text-[#1E3F8A] hover:bg-[#1E3F8A] hover:text-white"
                >
                  {strings.back}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer kiosk={kiosk} />
    </div>
  );
}

// Scan (with Why navigation)
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
      <HiddenSetupHotspot id="hidden_area_setup" />
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="camera-wrap shadow-xl">
            <video id="cam_view" ref={videoRef} className="w-full h-[520px] object-cover rounded-2xl" />
            <canvas ref={canvasRef} className="camera-overlay" />
          </div>
          <div className="flex gap-4 mt-4">
            <Button id="btn_back_scan" variant="ghost" onClick={() => nav("/start")}>{tr.back}</Button>
            <Button id="btn_continue_scan" variant="accent" onClick={runValidation}>{tr.scanNow}</Button>
          </div>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle id="lbl_bagdata_title">{strings[kiosk.lang].ui.bagdata_title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-lg" id="card_measures">
                <div><b id="lbl_width">{strings[kiosk.lang].ui.width_cm}:</b> <span id="out_width_cm">{dims?.width ?? "-"}</span> cm</div>
                <div><b id="lbl_length">{strings[kiosk.lang].ui.length_cm}:</b> <span id="out_length_cm">{dims?.length ?? "-"}</span> cm</div>
                <div><b id="lbl_weight">{strings[kiosk.lang].ui.weight_kg}:</b> <span id="out_weight_kg">{(weight ?? result?.weight_kg) ?? "-"}</span> kg</div>
                <div><b id="lbl_calibration">{strings[kiosk.lang].ui.calibration}:</b> {strings[kiosk.lang].ui.ok}</div>
              </div>
              {result && (
                <div className="mt-6">
                  {result.compliant ? (
                    <>
                      <div className="badge success">{strings[kiosk.lang].msg?.authorized || strings[kiosk.lang].validationOkSub}</div>
                      <div className="flex gap-3 mt-6">
                        <Button id="btn_continue_validate_ok" variant="accent" onClick={() => nav('/goodbye')}>{strings[kiosk.lang].ui?.continue_ok || strings[kiosk.lang].ui?.continue || 'Continuar'}</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="badge error">{strings[kiosk.lang].msg?.not_allowed || strings[kiosk.lang].validationFail}</div>
                      <ul className="list-disc pl-5 mt-3 text-red-700 space-y-1">
                        {result.errors.map((e, i) => (<li key={i}>{e}</li>))}
                      </ul>
                      <div className="actions-grid mt-6 w-full">
                        <Button variant="outline" onClick={() => nav('/why', { state: { result, rules: kiosk.rules } })}>{strings[kiosk.lang].why}</Button>
                        <Button id="btn_continue_to_payment" variant="primary" onClick={() => nav('/tariffs', { state: { result } })}>{strings[kiosk.lang].ui?.continue_to_payment || strings[kiosk.lang].continueToPayment || strings[kiosk.lang].goToPayment}</Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Payment({ kiosk }) {
  const nav = useNavigate();
  const { state } = useLocation();
  const result = state?.result || null;
  const [method, setMethod] = useState(null);
  const [status, setStatus] = useState(null);
  const [total, setTotal] = useState(0);
  const [kioskData, setKioskData] = useState(null);

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
        setKioskData({ rules, airline: current });
      } catch (e) {}
    };
    load();
  }, []);

  const pay = async () => {
    try {
      const ss = await axios.post(`${API}/sessions`, { airline_code: kioskData.airline.code, language: "es" });
      const { data } = await axios.post(`${API}/payments/simulate`, { session_id: ss.data.id, total, method });
      setStatus(data.status);
    } catch (e) {
      setStatus("rejected");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <LangSwitch kiosk={kiosk} id="lang_toggle" />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-6">{strings[kiosk.lang].payTitle}</h2>
        {result && (
          <Card className="mb-6">
            <CardContent>
              <div className="breakdown-row"><span>{strings[kiosk.lang].ui.excess_weight}</span><span>{result.weight_kg} kg</span></div>
              <div className="breakdown-row"><span>{strings[kiosk.lang].ui.excess_dimensions}</span><span>{result.dims_cm.length + result.dims_cm.width + result.dims_cm.height} cm</span></div>
              <div className="breakdown-row font-bold"><span>{strings[kiosk.lang].ui.total}</span><span>{`$${total.toFixed(2)} ${kioskData?.rules?.currency || "USD"}`}</span></div>
            </CardContent>
          </Card>
        )}

        <div className="mb-4">
          <label className="block font-semibold mb-2">{strings[kiosk.lang].method}</label>
          <div className="flex gap-3">
            <Button variant={method === "card" ? "primary" : "outline"} onClick={() => setMethod("card")} >{strings[kiosk.lang].card}</Button>
            <Button variant={method === "qr" ? "primary" : "outline"} onClick={() => setMethod("qr")} >{strings[kiosk.lang].qr}</Button>
          </div>
        </div>

        {method && (
          <div className="flex gap-4">
            <Button id="btn_pay" variant="accent" onClick={pay}>{strings[kiosk.lang].ui?.pay || strings[kiosk.lang].processPayment}</Button>
            <Button id="btn_back_tariff" variant="ghost" onClick={() => nav(-1)} >{strings[kiosk.lang].ui?.back || strings[kiosk.lang].back}</Button>
          </div>
        )}

        {status && (
          <div className="mt-6">
            {status === "approved" ? (
              <div className="badge success">{strings[kiosk.lang].approved}</div>
            ) : (
              <div className="badge error">{strings[kiosk.lang].rejected}</div>
            )}
            {status === "approved" && (
              <div className="mt-4 flex gap-3">
                <Button id="btn_finish_payment" variant="primary" onClick={() => nav("/goodbye")}>{strings[kiosk.lang].ui?.finish || strings[kiosk.lang].finishCta}</Button>
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
      <div className="absolute top-0 right-0 p-4">
        {/* Language switch placeholder; tie into global state if needed */}
      </div>
      <Card className="w-full max-w-xl text-center">
        <CardContent>
          <div className="text-6xl font-extrabold mb-6">{w} kg</div>
          <Button variant="ghost" onClick={() => nav("/start")} >VOLVER</Button>
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
      <div className="absolute top-0 right-0 p-4"></div>
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

function RulesPage() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7FAFF" }}>
      <Card className="w-full max-w-2xl">
        <CardContent>
          <h2 className="text-3xl font-extrabold text-[#12356F] mb-4">Maleta no permitida</h2>
          <p className="mb-4">Detalle de equipaje permitido (demo):</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Medidas máximas: 55 cm (largo) × 35 cm (ancho) × 25 cm (alto)</li>
            <li>Peso máximo: 10 kg</li>
            <li>Suma lineal máxima: 115 cm</li>
            <li>Ejemplos: Maleta cabina pequeña, mochila media, bolso de mano</li>
          </ul>
          <div className="mt-6 flex gap-3">
            <Button variant="primary" onClick={() => nav('/scan')}>Comenzar escaneo</Button>
            <Button variant="ghost" onClick={() => nav('/start')}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Goodbye({ kiosk }) {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav("/start"), 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7FAFF" }}>
      <LangSwitch kiosk={kiosk} id="lang_toggle" />
      <div className="text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={64} />
        <div className="mt-3 text-2xl font-bold">{strings[kiosk.lang].msg?.goodbye || 'Gracias por usar el validador. Buen viaje'}</div>
        <div className="text-gray-600">{kiosk.lang === 'en' ? 'Returning to Start…' : 'Regresando a Comenzar…'}</div>
      </div>
    </div>
  );
}

function Shell() {
  const kiosk = useKiosk();
  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome kiosk={kiosk} />} />
        <Route path="/start" element={<StartScan kiosk={kiosk} />} />
        <Route path="/setup" element={<SetupPage kiosk={kiosk} />} />
        <Route path="/scan" element={<Scan kiosk={kiosk} />} />
        <Route path="/why" element={<WhyPage kiosk={kiosk} />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/tariffs" element={<Payment kiosk={kiosk} />} />
        <Route path="/weigh" element={<FreeWeigh />} />
        <Route path="/train" element={<Train />} />
        <Route path="/goodbye" element={<Goodbye kiosk={kiosk} />} />
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
      <HashRouter>
        <Shell />
      </HashRouter>
    </div>
  );
}

export default App;