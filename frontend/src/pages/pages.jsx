import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { RULES, mockEvaluateBaggage, mockPricing, formatRules, toDataUrl, downloadDataUrl, JETSMART_COLORS } from "../mock/mock";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Camera, TriangleAlert, CheckCircle2, CreditCard, QrCode, ArrowLeft, Plane, Settings } from "lucide-react";

export function KioskLayout({ title, children, showHeaderActions = true }) {
  const { t, lang, setLang, config } = useApp();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F7FB" }}>
      <header className="w-full border-b bg-white/90 sticky top-0 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#002D72]/10 flex items-center justify-center">
              <Plane size={18} color={JETSMART_COLORS.blue} />
            </div>
            <div>
              <div className="text-xl font-semibold" style={{ color: JETSMART_COLORS.blue }}>JetSMART</div>
              <div className="text-xs text-muted-foreground">{title}</div>
            </div>
          </div>

          {showHeaderActions && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex text-xs text-muted-foreground">
                {config?.flight ? (
                  <span>
                    {config.operator || ""} • {config.flight || ""} • {config.gate || ""} • {config.destination || ""}
                  </span>
                ) : (
                  <span className="text-foreground/60">Configurar vuelo</span>
                )}
              </div>

              <Select value={lang} onValueChange={(v) => setLang(v)}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ES">ES</SelectItem>
                  <SelectItem value="EN">EN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="w-full border-t bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 text-center text-sm text-foreground/60">{t.madeBy}</div>
      </footer>

      {/* Decorative background plane */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06]" aria-hidden>
        <div className="absolute right-[-120px] top-24 rotate-12">
          <Plane size={420} color={JETSMART_COLORS.blue} />
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const { t } = useApp();
  const navigate = useNavigate();

  return (
    <KioskLayout title={t.welcome}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center gap-6 pt-8">
          <div className="text-5xl font-bold tracking-tight" style={{ color: JETSMART_COLORS.blue }}>JetSMART</div>
          <div className="text-lg text-foreground/70">{t.welcome}</div>

          <div className="pt-4 w-full sm:w-auto">
            <Button
              className="h-16 text-lg px-10 w-full sm:w-auto"
              style={{ backgroundColor: JETSMART_COLORS.red, color: "white" }}
              onClick={() => navigate("/scan")}
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

  const disabled = useMemo(() => !form.operator || !form.flight || !form.destination || !form.gate, [form]);

  return (
    <KioskLayout title={t.configTitle}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label>{t.operator}</Label>
            <Input value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} className="h-14 text-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label>{t.gate}</Label>
              <Select value={form.gate} onValueChange={(v) => setForm({ ...form, gate: v })}>
                <SelectTrigger className="h-14 text-lg"><SelectValue placeholder="A1" /></SelectTrigger>
                <SelectContent>
                  {GATES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t.flight}</Label>
              <Input value={form.flight} onChange={(e) => setForm({ ...form, flight: e.target.value })} className="h-14 text-lg" placeholder="WJ1234" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>{t.destination}</Label>
            <Select value={form.destination} onValueChange={(v) => setForm({ ...form, destination: v })}>
              <SelectTrigger className="h-14 text-lg"><SelectValue placeholder="SCL" /></SelectTrigger>
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

          <div className="flex gap-3 pt-2">
            <Button
              className="h-14 text-lg px-10"
              disabled={disabled}
              style={{ backgroundColor: JETSMART_COLORS.red, color: "white" }}
              onClick={() => {
                setConfig(form);
                navigate("/");
              }}
            >
              {t.save}
            </Button>
            <Button variant="outline" className="h-14 text-lg px-8" onClick={() => navigate("/")}>{t.back}</Button>
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
      const now = new Date();
      const ts = now.toISOString().replace(/[:.]/g, "-");
      const fileName = `equipaje_${ts}.jpg`;
      if (dataUrl) {
        // Frontend-only mock: trigger browser download for local save
        downloadDataUrl(dataUrl, fileName);
      }
      const results = mockEvaluateBaggage();
      setScan({ dataUrl, results });
      setCaptured(true);
    } catch (e) {
      setError("Error al capturar imagen.");
    }
  };

  const ResultsPanel = () => {
    if (!scan?.results) return null;
    const r = scan.results;
    const ok = r.complies;
    return (
      <Card className="mt-4">
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
          <div className="text-sm text-foreground/70 mt-2">{r.calibrationOk ? t.calibrOk : t.calibrErr}</div>
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

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {!ok && (
              <Button variant="outline" className="h-14 text-lg w-full sm:w-auto" onClick={() => navigate("/detail")}>
                {t.whyNo}
              </Button>
            )}
            <Button className="h-14 text-lg w-full sm:w-auto" style={{ backgroundColor: JETSMART_COLORS.red, color: "white" }} onClick={() => navigate("/payment")}>
              {t.goToPay}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <KioskLayout title={t.welcome}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {!started ? (
          <div className="flex flex-col items-center text-center gap-6 pt-8">
            <div className="text-5xl font-bold tracking-tight" style={{ color: JETSMART_COLORS.blue }}>JetSMART</div>
            <div className="text-lg text-foreground/70">{t.welcome}</div>
            <Button className="h-16 text-lg px-10" style={{ backgroundColor: JETSMART_COLORS.red, color: "white" }} onClick={() => setStarted(true)}>
              {t.scanStart}
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden bg-black/80 aspect-video flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-contain" playsInline muted />
              </div>
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-3">
                <Button className="h-14 text-lg flex-1" style={{ backgroundColor: JETSMART_COLORS.red, color: "white" }} onClick={doCapture}>
                  <Camera className="mr-2" /> {t.scan}
                </Button>
                <Button variant="outline" className="h-14 text-lg flex-1" onClick={() => navigate("/")}> {t.back}</Button>
              </div>
              {captured && (
                <Alert>
                  <AlertTitle>{t.imageSavedMock}</AlertTitle>
                  <AlertDescription>Esta es una descarga de imagen simulada. El guardado real en la carpeta del escritorio se hará en el backend.</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                  {scan?.results ? (
                    <ResultsPanel />
                  ) : (
                    <div className="text-sm text-foreground/70">Presiona ESCANEAR para obtener resultados.</div>
                  )}
                  <Separator className="my-4" />
                  <div className="text-xs text-foreground/60">{formatRules()}</div>
                </CardContent>
              </Card>
            </div>
          </div>
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
      <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden bg-black/80 aspect-video flex items-center justify-center">
          {scan?.dataUrl ? (
            <img src={scan.dataUrl} alt="equipaje" className="w-full h-full object-contain" />
          ) : (
            <div className="text-white/70 text-sm">Sin imagen</div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
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
              <div className="text-xs text-foreground/60 mt-2">{formatRules()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.rules}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm text-foreground/70">
                <li>L 55 cm</li>
                <li>W 35 cm</li>
                <li>H 25 cm</li>
                <li>Peso 10 kg</li>
              </ul>
            </CardContent>
          </Card>

          {r.reasons?.length > 0 && (
            <Card>
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

          <div className="flex gap-3">
            <Button variant="outline" className="h-12 px-8" onClick={() => navigate("/scan")}>{t.back}</Button>
            <Button className="h-12 px-8" style={{ backgroundColor: JETSMART_COLORS.red, color: "white" }} onClick={() => navigate("/payment")}>
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
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>Método de pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-col sm:flex-row">
              <Button
                variant={method === "CARD" ? "default" : "outline"}
                className="h-14 text-lg flex-1"
                style={method === "CARD" ? { backgroundColor: JETSMART_COLORS.blue, color: "white" } : {}}
                onClick={() => setMethod("CARD")}
              >
                <CreditCard className="mr-2" /> {t.payCard}
              </Button>
              <Button
                variant={method === "QR" ? "default" : "outline"}
                className="h-14 text-lg flex-1"
                onClick={() => setMethod("QR")}
              >
                <QrCode className="mr-2" /> {t.payQR}
              </Button>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                className="h-14 text-lg flex-1"
                style={{ backgroundColor: JETSMART_COLORS.red, color: "white" }}
                onClick={() => setPaid(true)}
              >
                {t.pay}
              </Button>
              <Button variant="outline" className="h-14 text-lg flex-1" onClick={() => navigate("/scan")}>{t.back}</Button>
            </div>

            {paid && (
              <Alert className="mt-4" variant="default">
                <AlertTitle>✅ {t.approved}</AlertTitle>
                <AlertDescription>Se registró el pago simulado correctamente.</AlertDescription>
              </Alert>
            )}

            {paid && (
              <div className="pt-4">
                <Button
                  className="h-12 px-8"
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
