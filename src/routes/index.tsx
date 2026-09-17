import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import appIcon from "@/assets/ammi-icon.png";
import winBuild from "@/assets/ammi-win64.zip.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ammi for Windows — someone's looking out for you" },
      {
        name: "description",
        content:
          "A Pakistani mum who leans in from the top of your screen to remind you to drink water, eat, sit straight and sleep. Free, tiny, lives in your system tray.",
      },
      { property: "og:title", content: "Ammi for Windows" },
      {
        property: "og:description",
        content: "Pani pee lo. Khana kha liya? A little mum on your Windows screen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Config = {
  position: "left" | "center" | "right";
  interval: number;
  visible: number;
  translation: boolean;
  scale: number;
  auto: boolean;
  scenario: number;
};

const initialConfig: Config = {
  position: "center",
  interval: 10,
  visible: 9,
  translation: true,
  scale: 1,
  auto: true,
  scenario: 0,
};

const LINES = [
  ["Pani pee lo", 0],
  ["Khana kha liya?", 1],
  ["Thora chal lo", 2],
  ["Chai bana doon?", 4],
  ["Seedhi tarhan baitho", 5],
  ["Ab so jao", 6],
  ["Dawai le li?", 8],
  ["Shabash mera bacha", 11],
] as const;

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-secondary text-secondary-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Demo() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [config, setConfig] = useState<Config>(initialConfig);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "ammi:ready") setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const send = () =>
      frame.current?.contentWindow?.postMessage({ type: "ammi:config", config }, "*");
    send();
    const ids = [80, 300, 900].map((d) => window.setTimeout(send, d));
    return () => ids.forEach(window.clearTimeout);
  }, [config, ready]);

  const patch = (p: Partial<Config>) => setConfig((c) => ({ ...c, ...p }));

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-glow">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
          <span className="size-3 rounded-full bg-muted-foreground/40" />
          <span className="size-3 rounded-full bg-muted-foreground/40" />
          <span className="size-3 rounded-full bg-muted-foreground/40" />
          <span className="ml-2 text-xs text-muted-foreground">Your desktop, roughly</span>
        </div>
        <div className="relative h-[380px] bg-[radial-gradient(120%_100%_at_20%_0%,oklch(0.92_0.05_80),oklch(0.82_0.06_60))]">
          <iframe
            ref={frame}
            title="Live Ammi preview"
            src="/overlay.html?interval=10"
            className="absolute inset-0 size-full"
            style={{ border: 0, background: "transparent" }}
            onLoad={() => setReady(true)}
          />
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/70 px-3 py-1 text-xs text-muted-foreground">
            move your mouse — she watches
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {LINES.map(([label, id]) => (
          <Chip key={label} active={config.scenario === id} onClick={() => patch({ scenario: id })}>
            {label}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Where she appears:</span>
        {(["left", "center", "right"] as const).map((p) => (
          <Chip key={p} active={config.position === p} onClick={() => patch({ position: p })}>
            {p === "center" ? "Centre" : p === "left" ? "Left" : "Right"}
          </Chip>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <Chip
          active={config.translation}
          onClick={() => patch({ translation: !config.translation })}
        >
          English translation
        </Chip>
        <Chip active={config.scale === 1.3} onClick={() => patch({ scale: config.scale === 1.3 ? 1 : 1.3 })}>
          Bigger
        </Chip>
        <Chip active={!config.auto} onClick={() => patch({ auto: !config.auto })}>
          Pause her
        </Chip>
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="glow-orb -left-40 top-[-10rem] size-[28rem] bg-accent/30" aria-hidden />
      <div className="glow-orb right-[-12rem] top-40 size-[30rem] bg-primary/20" aria-hidden />

      <header className="relative mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <a href="/" className="flex items-center gap-2.5 font-display text-lg font-bold">
          <img src={appIcon} alt="Ammi app icon" width={32} height={32} className="size-8 rounded-lg" />
          Ammi
        </a>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <a href="#demo" className="hover:text-foreground">
            Demo
          </a>
          <a href="#how" className="hover:text-foreground">
            How it works
          </a>
          <a href="#faq" className="hover:text-foreground">
            FAQ
          </a>
          <a
            href="#download"
            className="rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground transition-transform hover:scale-105"
          >
            Download
          </a>
        </nav>
      </header>

      <main className="relative mx-auto max-w-5xl px-6 pb-24">
        <section id="download" className="pt-10 text-center">
          <img
            src={appIcon}
            alt="An illustration of a smiling Pakistani mother in a dupatta"
            width={1024}
            height={1024}
            className="mx-auto size-44 rounded-[2rem] shadow-glow"
          />
          <h1 className="mt-8 text-balance font-display text-5xl font-extrabold sm:text-6xl">
            A little home in your machine
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Someone&rsquo;s looking out for you.
          </p>
          <p className="mt-2 text-lg text-muted-foreground">
            Gentle reminders. A familiar voice. Right in your notch.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href={winBuild.url}
              download="ammi-win64.zip"
              className="rounded-full bg-primary px-7 py-3.5 font-display text-lg font-bold text-primary-foreground transition-transform hover:scale-105"
            >
              Download for Windows
            </a>
            <span className="text-sm text-muted-foreground">Free · Windows 10 &amp; 11 · 64-bit</span>
          </div>
          <p className="mx-auto mt-8 max-w-xl rounded-2xl border border-border bg-card/80 p-5 text-sm text-muted-foreground">
            Unzip it anywhere and double-click <span className="text-foreground">Ammi.exe</span>. She
            puts an icon on your desktop the first time she runs, and sits in your system tray next to
            the clock — that's where everything is set, including “Start with Windows”.
          </p>

          <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-accent/40 bg-accent/10 p-5 text-left text-sm">
            <p className="font-display text-base font-bold text-foreground">
              Windows may say “Windows protected your PC”
            </p>
            <p className="mt-2 text-muted-foreground">
              That blue screen appears for every brand-new app that hasn't paid for a publisher
              certificate yet. It isn't a virus warning — Windows simply hasn't seen this file before.
              Click <span className="text-foreground">More info</span> →{" "}
              <span className="text-foreground">Run anyway</span> and you're in. It stops appearing
              after that.
            </p>
            <p className="mt-2 text-muted-foreground">
              No installer, no admin rights, no internet, no accounts, no tracking. Delete the folder
              and she's completely gone.
            </p>
          </div>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-3" aria-label="Reactions">
          {[
            ["“Chai bana doon?”", "— every twenty minutes"],
            ["“Seedhi tarhan baitho”", "— and you did"],
            ["“Shabash mera bacha”", "— worth the download"],
          ].map(([q, who]) => (
            <blockquote key={q} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display text-lg">{q}</p>
              <cite className="mt-2 block text-sm not-italic text-muted-foreground">{who}</cite>
            </blockquote>
          ))}
        </section>

        <section id="demo" className="mt-24">
          <h2 className="text-3xl font-bold">Meet her</h2>
          <p className="mt-2 text-muted-foreground">
            This is the real thing running in your browser. Pick a reminder.
          </p>
          <div className="mt-8">
            <Demo />
          </div>
        </section>

        <section id="how" className="mt-24">
          <h2 className="text-3xl font-bold">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              [
                "She checks in",
                "Every 10 minutes, 25 minutes, hour or two hours — your choice. She leans in, says her line, and slides back up.",
              ],
              [
                "In Urdu, with English",
                "Pani pee lo. Khana kha liya? Dawai le li? The English translation sits underneath, or you can switch it off.",
              ],
              [
                "Choose her reminders",
                "Water, food, breaks, eyes, chai, posture, bedtime, charger, medicine, prayers — tick the ones you want from the tray.",
              ],
            ].map(([title, body], i) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-6">
                <div className="font-display text-3xl font-extrabold text-primary">{i + 1}</div>
                <h3 className="mt-3 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="mt-24">
          <h2 className="text-3xl font-bold">FAQ</h2>
          <div className="mt-8 space-y-4">
            {[
              [
                "Does she get in the way of my clicks?",
                "No. She floats above your windows and every click passes straight through to whatever is underneath.",
              ],
              [
                "Will she eat my battery?",
                "She draws one small animation now and then. No internet, no accounts, no tracking.",
              ],
              [
                "Can I make her quiet?",
                "Tray icon → “Pause her reminders”, or Quit. Your settings are remembered for next time.",
              ],
              [
                "Can I ask her to say something now?",
                "Yes — tray icon → “Say something now”.",
              ],
            ].map(([q, a]) => (
              <details key={q} className="rounded-2xl border border-border bg-card p-5">
                <summary className="cursor-pointer font-display text-lg font-bold">{q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border py-8 text-center text-sm text-muted-foreground">
        Ammi · someone's looking out for you
      </footer>
    </div>
  );
}
