import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Factory,
  HardHat,
  House,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Mountain,
  Play,
  ShieldCheck,
  Shovel,
  Sparkles,
  Trash2,
  UploadCloud,
  UserRound,
  Video,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import brandLogo from "@/assets/demolidorasmart-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solicitar Orçamento | DemolidoraSmart" },
      { name: "description", content: "Peça orçamento para demolição, terraplanagem, escavação ou fechamento de obra em menos de dois minutos." },
      { property: "og:title", content: "Solicitar Orçamento | DemolidoraSmart" },
      { property: "og:description", content: "Envie os dados da obra e receba uma resposta técnica com prazo definido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuoteWizard,
});

const WHATSAPP_NUMBER = "5511944435095";
const DRAFT_KEY = "demolidorasmart-quote-draft-v1";

const services = [
  { label: "Demolição de Casa", icon: House },
  { label: "Demolição de Prédio", icon: Building2 },
  { label: "Demolição Industrial", icon: Factory },
  { label: "Terraplanagem", icon: Mountain },
  { label: "Escavação", icon: Shovel },
  { label: "Limpeza de Terreno", icon: Sparkles },
  { label: "Remoção de Entulho", icon: Trash2 },
  { label: "Fechamento de Obra (Tapume)", icon: Warehouse },
] as const;

const urgencies = [
  { label: "Urgente — até 7 dias", response: "Resposta prioritária", estimate: "poucas horas" },
  { label: "Este mês", response: "Resposta em 1 dia útil", estimate: "1 dia útil" },
  { label: "Estou planejando / sem data", response: "Resposta em até 2 dias úteis", estimate: "2 dias úteis" },
] as const;

type FormData = {
  service: string;
  urgency: string;
  address: string;
  city: string;
  size: string;
  clientName: string;
  clientPhone: string;
};

type Draft = FormData & { step: number };

const emptyForm: FormData = {
  service: "",
  urgency: "",
  address: "",
  city: "",
  size: "",
  clientName: "",
  clientPhone: "",
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function QuoteWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [sent, setSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as Draft;
        setForm({
          service: draft.service ?? "",
          urgency: draft.urgency ?? "",
          address: draft.address ?? "",
          city: draft.city ?? "",
          size: draft.size ?? "",
          clientName: draft.clientName ?? "",
          clientPhone: draft.clientPhone ?? "",
        });
        setStep(Math.min(Math.max(draft.step ?? 1, 1), 4));
      }
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || sent) return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, step }));
  }, [form, hydrated, sent, step]);

  const estimate = urgencies.find((item) => item.label === form.urgency)?.estimate ?? "2 dias úteis";
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previewUrls.forEach((url) => URL.revokeObjectURL(url)), [previewUrls]);

  const update = (field: keyof FormData, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const canContinue = step === 1 ? Boolean(form.service) : step === 2 ? Boolean(form.urgency && form.address && form.city) : Boolean(form.clientName && form.clientPhone.replace(/\D/g, "").length >= 10);

  const locate = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Localização não disponível neste aparelho.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const coordinates = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
        update("address", coordinates);
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`);
          if (response.ok) {
            const data = (await response.json()) as { display_name?: string; address?: { city?: string; town?: string; municipality?: string; state_code?: string; state?: string } };
            if (data.display_name) update("address", data.display_name);
            const city = data.address?.city ?? data.address?.town ?? data.address?.municipality;
            const state = data.address?.state_code ?? data.address?.state;
            if (city) update("city", state ? `${city} / ${state}` : city);
          }
        } catch {
          setLocationError("Coordenadas preenchidas. Complete cidade/UF.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocationError("Não foi possível acessar o GPS. Digite o endereço.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const chooseFiles = (selected: FileList | null) => {
    if (!selected) return;
    setFiles((current) => [...current, ...Array.from(selected)].slice(0, 12));
  };

  const uploadWithRetry = async (file: File, path: string) => {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const { error } = await supabase.storage.from("request-media").upload(path, file, { upsert: false });
      if (!error) return;
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => window.setTimeout(resolve, attempt * 800));
    }
    throw lastError ?? new Error("Falha no envio do arquivo.");
  };

  const send = async () => {
    setSubmitting(true);
    setSubmitError("");
    setUploadProgress(0);
    const whatsappWindow = window.open("about:blank", "_blank");
    try {
      const requestId = crypto.randomUUID();
      const paths: string[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (!file) continue;
        const extension = file.name.split(".").pop()?.toLowerCase() || (file.type.startsWith("video/") ? "mp4" : "jpg");
        const path = `requests/${requestId}/${crypto.randomUUID()}.${extension}`;
        await uploadWithRetry(file, path);
        paths.push(path);
        setUploadProgress(Math.round(((index + 1) / files.length) * 100));
      }
      const { error } = await supabase.from("quote_requests").insert({
        id: requestId,
        service: form.service,
        urgency: form.urgency,
        address: form.address,
        city: form.city,
        size: form.size || null,
        client_name: form.clientName,
        client_phone: form.clientPhone,
        files: paths,
      });
      if (error) throw error;

      const message = [
        "*NOVA SOLICITAÇÃO DE ORÇAMENTO*",
        "",
        `*Serviço:* ${form.service}`,
        `*Urgência:* ${form.urgency}`,
        `*Endereço:* ${form.address}`,
        `*Cidade/UF:* ${form.city}`,
        `*Tamanho aproximado:* ${form.size || "Não informado"}`,
        "",
        `*Cliente:* ${form.clientName}`,
        `*Telefone:* ${form.clientPhone}`,
        `*Mídias selecionadas:* ${files.length}`,
        "",
        "Vou anexar as fotos e vídeos nesta conversa.",
      ].join("\n");
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      if (whatsappWindow) whatsappWindow.location.href = url;
      else window.location.href = url;
      window.localStorage.removeItem(DRAFT_KEY);
      setSent(true);
    } catch {
      whatsappWindow?.close();
      setSubmitError("Não foi possível concluir o envio. Verifique sua conexão e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <header className="border-t-4 border-brand bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-card p-1 shadow-sm">
            <img src={brandLogo.url} alt="Logomarca DemolidoraSmart" width={56} height={56} className="size-14 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-extrabold leading-tight">DemolidoraSmart</p>
            <p className="text-xs font-semibold text-primary">Obra no prazo. Sem improviso.</p>
          </div>
          <span className="hidden rounded border border-secondary-foreground/20 px-2 py-1 text-xs font-semibold sm:block">ORÇAMENTO RÁPIDO</span>
        </div>
      </header>

      {!sent && <Progress step={step} />}

      <main className="mx-auto max-w-2xl px-4 py-6">
        {sent ? (
          <section className="animate-step py-12 text-center" aria-live="polite">
            <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground"><CheckCircle2 className="size-11" /></span>
            <p className="mt-7 text-sm font-bold uppercase text-muted-foreground">Pedido registrado</p>
            <h1 className="mt-2 text-3xl font-extrabold">Solicitação enviada!</h1>
            <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">Nossa equipe entrará em contato em até <strong className="text-foreground">{estimate}</strong>.</p>
            <div className="mt-8 border-l-4 border-primary bg-card p-4 text-left shadow-sm">
              <p className="font-semibold">Conclua no WhatsApp</p>
              <p className="mt-1 text-sm text-muted-foreground">Anexe as fotos e vídeos selecionados na conversa que foi aberta.</p>
            </div>
            <Button variant="outline" size="touch" className="mt-8" onClick={() => { setForm(emptyForm); setFiles([]); setStep(1); setSent(false); }}>Nova solicitação</Button>
          </section>
        ) : (
          <section key={step} className="animate-step">
            {step === 1 && <ServiceStep value={form.service} onChange={(value) => update("service", value)} />}
            {step === 2 && <DetailsStep form={form} update={update} locate={locate} locating={locating} locationError={locationError} />}
            {step === 3 && <ContactStep form={form} update={update} files={files} previews={previewUrls} chooseFiles={chooseFiles} removeFile={(index) => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} fileInputRef={fileInputRef} />}
            {step === 4 && <ReviewStep form={form} files={files} estimate={estimate} edit={setStep} submitting={submitting} uploadProgress={uploadProgress} submitError={submitError} send={send} />}

            {step < 4 && (
              <div className="mt-7 flex gap-3">
                {step > 1 && <Button variant="outline" size="touch" onClick={() => setStep((current) => current - 1)} aria-label="Voltar"><ArrowLeft /></Button>}
                <Button variant="industrial" size="touch" className="flex-1" disabled={!canContinue} onClick={() => setStep((current) => current + 1)}>Continuar <ArrowRight /></Button>
              </div>
            )}
          </section>
        )}
      </main>

      <TrustBar />
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex items-center justify-between text-xs font-bold"><span>ETAPA {step} DE 4</span><span className="text-muted-foreground">Menos de 2 minutos</span></div>
        <div className="mt-2 grid grid-cols-4 gap-1" aria-label={`Etapa ${step} de 4`}>{[1, 2, 3, 4].map((item) => <span key={item} className={`h-1.5 rounded-sm ${item <= step ? "bg-primary" : "bg-muted"}`} />)}</div>
      </div>
    </div>
  );
}

function StepHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="mb-6"><p className="text-xs font-bold uppercase text-brand">{eyebrow}</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{title}</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></div>;
}

function ServiceStep({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <><StepHeading eyebrow="Tipo de serviço" title="O que sua obra precisa?" text="Selecione uma opção para iniciar o orçamento." /><div className="grid grid-cols-2 gap-3">{services.map(({ label, icon: Icon }) => { const active = value === label; return <button key={label} type="button" onClick={() => onChange(label)} aria-pressed={active} className={`relative flex min-h-32 flex-col items-start justify-between rounded-md border-2 p-4 text-left transition ${active ? "border-brand bg-brand-soft shadow-sm" : "border-border bg-card hover:border-brand/60"}`}><Icon className={`size-7 ${active ? "text-brand" : "text-secondary"}`} /><span className="mt-4 text-sm font-bold leading-tight">{label}</span>{active && <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground"><Check className="size-4" /></span>}</button>; })}</div></>;
}

function DetailsStep({ form, update, locate, locating, locationError }: { form: FormData; update: (field: keyof FormData, value: string) => void; locate: () => void; locating: boolean; locationError: string }) {
  return <><StepHeading eyebrow="Detalhes da obra" title="Prazo e localização" text="Essas informações direcionam equipe e equipamentos." /><fieldset><legend className="mb-3 text-sm font-bold">Qual é a urgência?</legend><div className="space-y-2">{urgencies.map((item) => { const active = form.urgency === item.label; return <button key={item.label} type="button" onClick={() => update("urgency", item.label)} aria-pressed={active} className={`flex min-h-16 w-full items-center gap-3 rounded-md border-2 p-3 text-left ${active ? "border-primary bg-accent" : "border-border bg-card"}`}><CircleDot className={`size-5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} /><span className="flex-1"><strong className="block text-sm">{item.label}</strong><span className="text-xs text-muted-foreground">{item.response}</span></span></button>; })}</div></fieldset><div className="mt-6 space-y-4"><Field label="Endereço da obra" required><div className="flex gap-2"><input value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="Rua, número e bairro" className="min-h-12 min-w-0 flex-1 rounded-md border border-input bg-card px-3 outline-none focus:ring-2 focus:ring-ring" /><Button type="button" variant="outline" size="touch" onClick={locate} disabled={locating} aria-label="Usar localização atual">{locating ? <LoaderCircle className="animate-spin" /> : <LocateFixed />}</Button></div>{locationError && <p className="mt-1 text-xs text-destructive">{locationError}</p>}</Field><Field label="Cidade / UF" required><input value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="Ex.: São Paulo / SP" className="min-h-12 w-full rounded-md border border-input bg-card px-3 outline-none focus:ring-2 focus:ring-ring" /></Field><Field label="Tamanho aproximado"><input value={form.size} onChange={(event) => update("size", event.target.value)} placeholder="Ex.: 350 m² ou breve observação" maxLength={80} className="min-h-12 w-full rounded-md border border-input bg-card px-3 outline-none focus:ring-2 focus:ring-ring" /></Field></div></>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-bold">{label}{required && <span className="text-primary"> *</span>}</span>{children}</label>; }

function ContactStep({ form, update, files, previews, chooseFiles, removeFile, fileInputRef }: { form: FormData; update: (field: keyof FormData, value: string) => void; files: File[]; previews: string[]; chooseFiles: (files: FileList | null) => void; removeFile: (index: number) => void; fileInputRef: React.RefObject<HTMLInputElement | null> }) {
  return <><StepHeading eyebrow="Registro do local" title="Fotos, vídeos e contato" text="Imagens do acesso e da área aumentam a precisão da análise." /><input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(event) => { chooseFiles(event.target.files); event.target.value = ""; }} /><button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-32 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-primary bg-accent px-4 text-center"><span className="flex gap-2 text-primary"><Camera className="size-7" /><UploadCloud className="size-7" /></span><strong className="mt-3">Abrir câmera ou galeria</strong><span className="mt-1 text-xs text-muted-foreground">Até 12 fotos ou vídeos curtos</span></button>{files.length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="relative aspect-square overflow-hidden rounded-md border border-border bg-secondary">{file.type.startsWith("video/") ? <video src={previews[index]} className="size-full object-cover" muted /> : <img src={previews[index]} alt={`Pré-visualização ${index + 1}`} className="size-full object-cover" />}<span className="absolute bottom-1 left-1 rounded bg-secondary/90 px-1.5 py-0.5 text-xs text-secondary-foreground">{file.type.startsWith("video/") ? <Video className="size-3.5" /> : <Camera className="size-3.5" />}</span><button type="button" onClick={() => removeFile(index)} aria-label={`Remover ${file.name}`} className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><Trash2 className="size-4" /></button></div>)}</div>}<div className="mt-6 space-y-4"><Field label="Nome completo" required><div className="relative"><UserRound className="absolute left-3 top-3.5 size-5 text-muted-foreground" /><input value={form.clientName} onChange={(event) => update("clientName", event.target.value)} autoComplete="name" placeholder="Nome e sobrenome" className="min-h-12 w-full rounded-md border border-input bg-card pl-11 pr-3 outline-none focus:ring-2 focus:ring-ring" /></div></Field><Field label="Telefone / WhatsApp" required><input value={form.clientPhone} onChange={(event) => update("clientPhone", formatPhone(event.target.value))} inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" className="min-h-12 w-full rounded-md border border-input bg-card px-3 outline-none focus:ring-2 focus:ring-ring" /></Field></div></>;
}

function ReviewStep({ form, files, estimate, edit, submitting, uploadProgress, submitError, send }: { form: FormData; files: File[]; estimate: string; edit: (step: number) => void; submitting: boolean; uploadProgress: number; submitError: string; send: () => void }) {
  const groups = [{ title: "Serviço", value: form.service, step: 1, icon: HardHat }, { title: "Prazo e local", value: `${form.urgency}\n${form.address}\n${form.city}${form.size ? ` · ${form.size}` : ""}`, step: 2, icon: MapPin }, { title: "Contato e anexos", value: `${form.clientName}\n${form.clientPhone} · ${files.length} arquivo(s)`, step: 3, icon: Camera }];
  return <><StepHeading eyebrow="Revisão" title="Confira antes de enviar" text="Toque em qualquer bloco para corrigir as informações." /><div className="space-y-2">{groups.map(({ title, value, step, icon: Icon }) => <button key={title} type="button" onClick={() => edit(step)} className="flex min-h-20 w-full items-start gap-3 rounded-md border border-border bg-card p-4 text-left"><Icon className="mt-0.5 size-5 shrink-0 text-primary" /><span className="min-w-0 flex-1"><strong className="block text-xs uppercase text-muted-foreground">{title}</strong><span className="mt-1 block whitespace-pre-line text-sm font-semibold leading-relaxed">{value}</span></span><ChevronRight className="size-5 text-muted-foreground" /></button>)}</div><div className="mt-5 border-l-4 border-primary bg-accent p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-6 shrink-0 text-primary" /><div><p className="text-sm font-bold">Prazo estimado de resposta</p><p className="mt-1 font-display text-xl font-extrabold">Até {estimate}</p></div></div></div><div className="mt-5 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground"><p className="font-bold text-foreground">Sobre fotos e vídeos</p><p className="mt-1 leading-relaxed">Por segurança do navegador e do celular, o WhatsApp não permite anexar mídias automaticamente. A conversa abrirá com a mensagem pronta; anexe os arquivos nela.</p></div>{submitting && <div className="mt-5" aria-live="polite"><div className="flex justify-between text-sm font-semibold"><span>{files.length ? "Enviando arquivos..." : "Registrando solicitação..."}</span><span>{files.length ? `${uploadProgress}%` : ""}</span></div><div className="mt-2 h-2 overflow-hidden rounded bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${files.length ? uploadProgress : 65}%` }} /></div></div>}{submitError && <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{submitError}</p>}<div className="mt-6 flex gap-3"><Button variant="outline" size="touch" onClick={() => edit(3)} disabled={submitting} aria-label="Voltar"><ArrowLeft /></Button><Button variant="industrial" size="touch" className="flex-1" onClick={send} disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" /> : <Play />} Enviar via WhatsApp</Button></div></>;
}

function TrustBar() {
  return <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-secondary-foreground/10 bg-secondary text-secondary-foreground shadow-lg"><div className="mx-auto grid min-h-16 max-w-2xl grid-cols-3 divide-x divide-secondary-foreground/15 px-2"><div className="flex flex-col items-center justify-center text-center"><strong className="text-sm text-primary">15+ anos</strong><span className="text-[10px]">de obra</span></div><div className="flex flex-col items-center justify-center text-center"><strong className="text-sm text-primary">800+ projetos</strong><span className="text-[10px]">entregues</span></div><div className="flex flex-col items-center justify-center text-center"><strong className="text-sm text-primary">Frota própria</strong><span className="text-[10px]">CAT / Volvo</span></div></div></footer>;
}