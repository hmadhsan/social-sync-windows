import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import appIcon from "@/assets/app-icon.png";
import winBuild from "@/assets/swingers-win64.zip.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "swingers for Windows — a tiny character on your desktop" },
      {
        name: "description",
        content:
          "Hang a swing from the top of your Windows screen or park a sitter in the corner. Free, tiny, lives in the system tray. Totally optional, btw.",
      },
      { property: "og:title", content: "swingers for Windows" },
      {
        property: "og:description",
        content: "Unnecessary shit on your Windows screen. Totally optional, btw.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Config = {
  mode: "swing" | "sitter";
  rope: number;
  amplitude: number;
  period: number;
  loops: boolean;
  twoSeater: boolean;
  corner: "left" | "right";
  anchor: number;
};

const initialConfig: Config = {
  mode: "swing",
  rope: 120,
  amplitude: 34,
  period: 2.6,
  loops: false,
  twoSeater: false,
  corner: "left",
  anchor: 0.5,
};

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

  useEffect(() => {
    const send = () =>
      frame.current?.contentWindow?.postMessage({ type: "swingers:config", config }, "*");
    send();
    const id = window.setTimeout(send, 300);
    return () => window.clearTimeout(id);
  }, [config]);

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
        <div className="relative h-[360px] bg-[radial-gradient(120%_100%_at_20%_0%,oklch(0.32_0.09_290),oklch(0.18_0.06_285))]">
          <iframe
            ref={frame}
            title="Live swing preview"
            src="/overlay.html?rope=120"
            className="absolute inset-0 size-full"
            style={{ border: 0, background: "transparent" }}
          />
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/60 px-3 py-1 text-xs text-muted-foreground">
            move your mouse — they watch
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active={config.mode === "swing"} onClick={() => patch({ mode: "swing" })}>
          Swing
        </Chip>
        <Chip active={config.mode === "sitter"} onClick={() => patch({ mode: "sitter" })}>
          Sitter
        </Chip>
        <Chip active={config.twoSeater} onClick={() => patch({ twoSeater: !config.twoSeater })}>
          Two-seater
        </Chip>
        <Chip active={config.loops} onClick={() => patch({ loops: !config.loops })}>
          Full loops
        </Chip>
        <Chip active={config.rope === 200} onClick={() => patch({ rope: config.rope === 200 ? 120 : 200 })}>
          Long rope
        </Chip>
        <Chip active={config.period === 1.6} onClick={() => patch({ period: config.period === 1.6 ? 2.6 : 1.6 })}>
          Hyper
        </Chip>
        <Chip
          active={config.corner === "right"}
          onClick={() => patch({ corner: config.corner === "right" ? "left" : "right" })}
        >
          Other corner
        </Chip>
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="glow-orb -left-40 top-[-10rem] size-[28rem] bg-accent/40" aria-hidden />
      <div className="glow-orb right-[-12rem] top-40 size-[30rem] bg-primary/30" aria-hidden />

      <header className="relative mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <a href="/" className="flex items-center gap-2.5 font-display text-lg font-bold">
          <img src={appIcon} alt="swingers app icon" width={32} height={32} className="size-8 rounded-lg" />
          swingers
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
            alt="A small character sitting on a wooden swing"
            width={1024}
            height={1024}
            className="mx-auto size-44 rounded-[2rem] shadow-glow"
          />
          <h1 className="mt-8 text-balance font-display text-5xl font-extrabold sm:text-6xl">
            Unnecessary shit on your Windows screen.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Totally optional, btw.</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href="/downloads/swingers-win64.zip"
              className="rounded-full bg-primary px-7 py-3.5 font-display text-lg font-bold text-primary-foreground transition-transform hover:scale-105"
            >
              Download for Windows
            </a>
            <span className="text-sm text-muted-foreground">
              Free · Windows 10 &amp; 11 · 64-bit
            </span>
          </div>
          <p className="mx-auto mt-8 max-w-xl rounded-2xl border border-border bg-card/70 p-5 text-sm text-muted-foreground">
            Unzip it anywhere and run <span className="text-foreground">swingers.exe</span>. It lives in
            your system tray, next to the clock: click the swing icon to set things up.
          </p>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-3" aria-label="Reactions">
          {[
            ["“wtf is this crap”", "— someone"],
            ["“why is he looking at me”", "— someone else"],
            ["“ok that's actually cool”", "— eventually, everyone"],
          ].map(([q, who]) => (
            <blockquote key={q} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display text-lg">{q}</p>
              <cite className="mt-2 block text-sm not-italic text-muted-foreground">{who}</cite>
            </blockquote>
          ))}
        </section>

        <section id="demo" className="mt-24">
          <h2 className="text-3xl font-bold">See it move</h2>
          <p className="mt-2 text-muted-foreground">
            This is the real thing running in your browser. Poke the buttons.
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
                "Hang a swing",
                "Pick where it hangs along the top of your screen. Rope length, amplitude, speed, full loops if you want them.",
              ],
              [
                "Or park a sitter",
                "A character sits on the floor of your screen, back to the edge, following your cursor with their eyes. Left corner or right.",
              ],
              [
                "Stays out of the way",
                "The overlay ignores clicks, skips the taskbar, and floats above your windows. Everything is set from the tray icon.",
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
              ["Does it get in the way of my clicks?", "No. Every click passes straight through to whatever is underneath."],
              ["Will it eat my battery?", "It draws one small animation, nothing else. No network, no accounts, no telemetry."],
              ["How do I turn it off?", "Tray icon → Quit. Settings are remembered for next time."],
              ["Is there a Mac version?", "Yes, that's the original. This one is the Windows build."],
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
        swingers · unnecessary since today
      </footer>
    </div>
  );
}
