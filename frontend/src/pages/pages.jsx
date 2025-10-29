import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { RULES, mockPricing, formatRules, toDataUrl, downloadDataUrl, JETSMART_COLORS } from "../mock/mock";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Camera, TriangleAlert, CheckCircle2, CreditCard, QrCode, Plane } from "lucide-react";
import { uploadImageInChunks, api } from "../lib/api";

const REMOTE_BG = "https://customer-assets.emergentagent.com/job_jetsmart-check/artifacts/du2ocyp9_LNDSUCT4PFD5RBV47C53VUVYHE.jpg";
const LOCAL_BG = "/assets/jetsmart_bg.jpg"; // Si existe, se usa primero
// Más transparentes y compactas; y fondo más visible
const TRANS_BOX = "bg-white/15 backdrop-blur-sm border border-white/30 shadow-sm rounded-3xl";

// Botón rojo con efecto translúcido estilo glass (inspirado en Apple)
const BTN_RED_GLASS = {
  backgroundColor: "rgba(227, 6, 19, 0.85)",
  color: "white",
  backdropFilter: "saturate(180%) blur(8px)",
  WebkitBackdropFilter: "saturate(180%) blur(8px)",
  border: "1px solid rgba(227, 6, 19, 0.35)",
  boxShadow: "0 8px 24px rgba(227, 6, 19, 0.25)",
};

export function KioskLayout({ title, children, showHeaderActions = true }) {
  const { t } = useApp();
  const bgStyle = {
    backgroundImage: `url(${LOCAL_BG}), url(${REMOTE_BG})`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    filter: "none",
    transform: "none",
    willChange: "auto",
  };
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Fondo global (local primero, remoto respaldo) */}
      <div aria-hidden className="fixed inset-0 -z-20" style={bgStyle} />

      {/* Sin overlay para apreciar al máximo la imagen */}

      <header className="w-full border-b border-white/30 bg-white/10 sticky top-0 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#002D72]/20 flex items-center justify-center">
              <Plane size={18} color={JETSMART_COLORS.blue} />
            </div>
            <div>
              <div className="text-xl font-semibold" style={{ color: JETSMART_COLORS.blue }}>JetSMART</div>
              <div className="text-xs text-foreground/90">{title}</div>
            </div>
          </div>

          {showHeaderActions && <div className="flex items-center gap-3" />}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="w-full border-t border-white/30 bg-white/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-2 text-center text-sm text-foreground/90">{t.madeBy}</div>
      </footer>
    </div>
  );
}

export function HomePage() {
  const { t } = useApp();
  const navigate = useNavigate();

  return (
    <KioskLayout title={t.welcome} showHeaderActions={false}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className={`${TRANS_BOX} mx-auto max-w-md p-5 text-center`}> 
          <div className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: JETSMART_COLORS.blue }}>JetSMART</div>
          <div className="text-base md:text-lg text-foreground/90 mt-2">{t.welcome}</div>
          <div className="pt-4">
            <Button
              className="h-12 md:h-14 text-lg px-8"
              style={BTN_RED_GLASS}
              onClick={() => navigate("/config")}
            >
              {t.start}
            </Button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}

export function ConfigPage() {
  const { t, config, setConfig, DESTINATIONS, GATES } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...config });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/config");
        if (res?.data) setForm(res.data);
      } catch (e) {}
    })();
  }, []);

  const disabled = useMemo(() => !form.operator || !form.flight || !form.destination || !form.gate, [form]);

  return (
    <KioskLayout title={t.configTitle}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className={`${TRANS_BOX} mx-auto max-w-lg p-5`}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t.operator}</Label>
              <Input value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} className="h-12 text-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t.gate}</Label>
                <Select value={form.gate} onValueChange={(v) => setForm({ ...form, gate: v })}>
                  <SelectTrigger className="h-12 text-lg"><SelectValue placeholder="A1" /></SelectTrigger>
                  <SelectContent>
                    {GATES.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t.flight}</Label>
                <Input value={form.flight} onChange={(e) => setForm({ ...form, flight: e.target.value })} className="h-12 text-lg" placeholder="WJ1234" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{t.destination}</Label>
              <Select value={form.destination} onValueChange={(v) => setForm({ ...form, destination: v })}>
                <SelectTrigger className="h-12 text-lg"><SelectValue placeholder="SCL" /></SelectTrigger>
                <SelectContent>
                  {DESTINATIONS.map((d) => (
                    <SelectItem key={d.code} value={d.code}>{d.code} — {d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="intl" checked={form.international} onCheckedChange={(v) => setForm({ ...form, international: Boolean(v) })} />
              <Label htmlFor="intl">{t.intl}</Label>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                className="h-12 text-lg px-8"
                disabled={disabled || loading}
                style={BTN_RED_GLASS}
                onClick={async () => {
                  try {
                    setLoading(true);
                    await api.post("/config", form);
                    setConfig(form);
                    navigate("/scan");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {t.save}
              </Button>
              <Button variant="outline" className="h-12 text-lg px-8" onClick={() => navigate("/")}>{t.back}</Button>
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}

export function ScanPage() {
  const { t, setScan, scan } = useApp();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState("");
  const [captured, setCaptured] = useState(false);
  const [progress, setProgress] = useState(0);

  // Detectar orientación para controlar layout (landscape: lado a lado, portrait: apilado)
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(orientation: landscape)").matches;
    }
    return false;
  });
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(orientation: landscape)");
    const handler = (e) => setIsLandscape(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq.addListener) mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else if (mq.removeListener) mq.removeListener(handler);
    };
  }, []);

  const clickCount = useRef(0);
  const timerRef = useRef(null);
  const onSecretClick = () => {
    clickCount.current += 1;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { clickCount.current = 0; }, 1200);
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      navigate("/config");
    }
  };

  useEffect(() => {
    if (!started) return;
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        setError("No se pudo acceder a la cámara.");
      }
    })();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [started]);

  const doCapture = async () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      const w = Math.min(1280, video.videoWidth || 640);
      const h = Math.round((w / (video.videoWidth || 640)) * (video.videoHeight || 480));
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = toDataUrl(canvas);

      if (!dataUrl) throw new Error("No se pudo crear imagen");

      const res = await fetch(dataUrl);
      const blob = await res.blob();

      setProgress(1);
      const resp = await uploadImageInChunks(blob, (pct) => setProgress(pct));

      const now = new Date();
      const ts = now.toISOString().replace(/[:.]/g, "-");
      downloadDataUrl(dataUrl, `equipaje_${ts}.jpg`);

      setScan({ dataUrl, results: resp.results });
      setCaptured(true);
      setProgress(100);
    } catch (e) {
      setError("Error al capturar o enviar imagen.");
    }
  };

  const ResultsPanel = () => {
    if (!scan?.results) return null;
    const r = scan.results;
    const ok = r.complies;
    return (
      <Card className={`${TRANS_BOX} mt-3`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {ok ? (
              <CheckCircle2 className="text-green-600" />
            ) : (
              <TriangleAlert className="text-red-600" />
            )}
            <span>{ok ? t.complies : t.notComplies}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>{t.length}: <b>{r.L} cm</b></div>
            <div>{t.width}: <b>{r.W} cm</b></div>
            <div>{t.height}: <b>{r.H} cm</b></div>
            <div>{t.weight}: <b>{r.KG} kg</b></div>
          </div>
          <div className="text-sm text-foreground/90 mt-2">{r.calibrationOk ? t.calibrOk : t.calibrErr}</div>
          {r.reasons?.length > 0 && (
            <div className="mt-3 text-sm">
              <div className="font-medium mb-1">Detalles:</div>
              <ul className="list-disc pl-5 space-y-1 text-red-600">
                {r.reasons.map((x, idx) => (
                  <li key={idx}>{x.label}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-3 w-full">
            {!ok && (
              <Button
                variant="outline"
                className="col-span-2 sm:col-span-1 h-12 text-base md:text-lg px-6 md:px-8"
                onClick={() => navigate("/detail")}
              >
                {t.whyNo}
              </Button>
            )}
            <Button
              className="col-span-2 sm:col-span-1 h-12 text-base md:text-lg px-6 md:px-8"
              style={BTN_RED_GLASS}
              onClick={() => navigate("/payment")}
            >
              {t.goToPay}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <KioskLayout title={t.welcome} showHeaderActions={false}>
      <div className="relative">
        <div className="absolute top-0 left-0 w-12 h-12 z-20" onClick={onSecretClick} aria-label="hotspot" />
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!started ? (
          <div className="w-full flex items-center justify-center min-h-[60vh]">
            <div className={`${TRANS_BOX} max-w-md w-full p-5 text-center`}>
            <div className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: JETSMART_COLORS.blue }}>JetSMART</div>
            <div className="text-base md:text-lg text-foreground/90">{t.welcome}</div>
            <Button className="h-12 md:h-14 text-lg px-8 mt-4" style={BTN_RED_GLASS} onClick={() => setStarted(true)}>
              {t.scanStart}
            </Button>
          </div>
          </div>
        ) : (
          <>
            <div className={`${TRANS_BOX} p-3 w-full`}>
              <div className="rounded-3xl overflow-hidden bg-black/80 aspect-video flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-contain" playsInline muted />
              </div>
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-2.5 mt-3">
                <Button className="h-12 text-lg flex-1" style={BTN_RED_GLASS} onClick={doCapture}>
                  <Camera className="mr-2" /> {t.scan}
                </Button>
                <Button variant="outline" className="h-12 text-lg flex-1" onClick={() => setStarted(false)}> {t.back}</Button>
              </div>
              {progress > 0 && progress < 100 && (
                <Alert className="mt-3">
                  <AlertTitle>Subiendo imagen</AlertTitle>
                  <AlertDescription>Progreso: {progress}%</AlertDescription>
                </Alert>
              )}
              {captured && (
                <Alert className="mt-3">
                  <AlertTitle>Imagen guardada</AlertTitle>
                  <AlertDescription>Se guardó una copia en Escritorio/imagenes_ia desde el backend. (También descargada localmente como demo)</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert className="mt-3" variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="w-full">
              <Card className={`${TRANS_BOX}`}>
                <CardHeader>
                  <CardTitle>Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                  {scan?.results ? (
                    <ResultsPanel />
                  ) : (
                    <div className="text-sm text-foreground/90">Presiona ESCANEAR para obtener resultados.</div>
                  )}
                  <Separator className="my-3" />
                  <div className="text-xs text-foreground/90">{formatRules()}</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </KioskLayout>
  );
}

export function DetailPage() {
  const { t, scan } = useApp();
  const navigate = useNavigate();
  const r = scan?.results;

  if (!r) {
    return (
      <KioskLayout title={t.detailTitle}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTitle>Sin datos</AlertTitle>
            <AlertDescription>Realiza un escaneo primero.</AlertDescription>
          </Alert>
          <div className="pt-4">
            <Button variant="outline" onClick={() => navigate("/scan")}>{t.back}</Button>
          </div>
        </div>
      </KioskLayout>
    );
  }

  return (
    <KioskLayout title={t.detailTitle}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className={`${TRANS_BOX} p-3 w-full`}> 
          <div className="rounded-3xl overflow-hidden bg-black/80 aspect-video flex items-center justify-center">
            {scan?.dataUrl ? (
              <img src={scan.dataUrl} alt="equipaje" className="w-full h-full object-contain" />
            ) : (
              <div className="text-white/70 text-sm">Sin imagen</div>
            )}
          </div>
        </div>

        <div className="w-full">
          <Card className={`${TRANS_BOX}`}>
            <CardHeader>
              <CardTitle>{t.class}: {t.suitcase}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>{t.length}: <b>{r.L} cm</b></div>
                <div>{t.width}: <b>{r.W} cm</b></div>
                <div>{t.height}: <b>{r.H} cm</b></div>
                <div>{t.weight}: <b>{r.KG} kg</b></div>
              </div>
              <div className="text-xs text-foreground/90 mt-2">{formatRules()}</div>
            </CardContent>
          </Card>

          <Card className={`${TRANS_BOX} mt-3`}>
            <CardHeader>
              <CardTitle>{t.rules}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm text-foreground/90">
                <li>L 55 cm</li>
                <li>W 35 cm</li>
                <li>H 25 cm</li>
                <li>Peso 10 kg</li>
              </ul>
            </CardContent>
          </Card>

          {r.reasons?.length > 0 && (
            <Card className={`${TRANS_BOX} mt-3`}>
              <CardHeader>
                <CardTitle>Razones</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {r.reasons.map((x, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-red-600">
                      <TriangleAlert size={18} /> <span>{x.label}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className={`${TRANS_BOX} p-3 mt-3 flex gap-3`}>
            <Button variant="outline" className="h-11 px-8" onClick={() => navigate("/scan")}>{t.back}</Button>
            <Button className="h-11 px-8" style={BTN_RED_GLASS} onClick={() => navigate("/payment")}>
              IR A TARIFAS/PAGO
            </Button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}

export function PaymentPage() {
  const { t, scan, setScan } = useApp();
  const navigate = useNavigate();
  const r = scan?.results;
  const [method, setMethod] = useState("CARD");
  const [paid, setPaid] = useState(false);

  if (!r) {
    return (
      <KioskLayout title={t.payTitle}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTitle>Sin datos</AlertTitle>
            <AlertDescription>Realiza un escaneo primero.</AlertDescription>
          </Alert>
          <div className="pt-4">
            <Button variant="outline" onClick={() => navigate("/scan")}>{t.back}</Button>
          </div>
        </div>
      </KioskLayout>
    );
  }

  const prices = mockPricing(r.overages || {});

  return (
    <KioskLayout title={t.payTitle}>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Card className={`${TRANS_BOX} max-w-md mx-auto md:mx-0`}>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Exceso por peso</TableCell>
                  <TableCell>US$ {prices.weightUSD}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Exceso por dimensiones</TableCell>
                  <TableCell>US$ {prices.dimsUSD}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="font-semibold">US$ {prices.total}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className={`${TRANS_BOX} max-w-md mx-auto md:mx-0`}>
          <CardHeader>
            <CardTitle>Método de pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-col sm:flex-row">
              <Button
                variant={method === "CARD" ? "default" : "outline"}
                className="h-12 text-lg flex-1"
                style={method === "CARD" ? { backgroundColor: JETSMART_COLORS.blue, color: "white" } : {}}
                onClick={() => setMethod("CARD")}
              >
                <CreditCard className="mr-2" /> {t.payCard}
              </Button>
              <Button
                variant={method === "QR" ? "default" : "outline"}
                className="h-12 text-lg flex-1"
                onClick={() => setMethod("QR")}
              >
                <QrCode className="mr-2" /> {t.payQR}
              </Button>
            </div>

            <div className="flex gap-3 mt-3">
              <Button
                className="h-12 text-lg flex-1"
                style={BTN_RED_GLASS}
                onClick={() => setPaid(true)}
              >
                {t.pay}
              </Button>
              <Button variant="outline" className="h-12 text-lg flex-1" onClick={() => navigate("/scan")}>{t.back}</Button>
            </div>

            {paid && (
              <Alert className="mt-3" variant="default">
                <AlertTitle>✅ {t.approved}</AlertTitle>
                <AlertDescription>Se registró el pago simulado correctamente.</AlertDescription>
              </Alert>
            )}

            {paid && (
              <div className="pt-3">
                <Button
                  className="h-11 px-8"
                  onClick={() => {
                    setScan({ dataUrl: null, results: null });
                    navigate("/scan");
                  }}
                >
                  {t.finish}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </KioskLayout>
  );
}
