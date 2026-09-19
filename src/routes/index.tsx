import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import appIcon from "@/assets/ammi-icon.png";
import macArm from "@/assets/ammi-mac-arm64.zip.asset.json";
import macIntel from "@/assets/ammi-mac-intel.zip.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ammi — Gentle reminders on your screen" },
      {
        name: "description",
        content:
          "Meet Ammi, a familiar, loving face looking out for you. Gentle reminders to drink water, eat and take a break, in Urdu and English. For macOS and Windows.",
      },
      { property: "og:title", content: "Ammi — Someone’s looking out for you." },
      {
        property: "og:description",
        content: "Pani pee lo. Khana kha liya? A little home in your machine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const REMINDERS = [
  { id: 0, urdu: "Pani pee lo.", en: "Drink some water.", label: "Water" },
  { id: 1, urdu: "Khana kha liya? Laptop ruk sakta hai.", en: "Have you eaten? The laptop can wait.", label: "Food" },
  { id: 2, urdu: "Bohat der baith gaye. Thora chal lo.", en: "You've been sitting a long time. Walk a little.", label: "Walk" },
  { id: 3, urdu: "Ankhon ko aaram do.", en: "Give your eyes a rest.", label: "Eyes" },
  { id: 4, urdu: "Chai bana doon?", en: "Shall I make you some tea?", label: "Chai" },
  { id: 5, urdu: "Seedhi tarhan baitho, kamar kharab ho jaye gi.", en: "Sit up straight, you'll ruin your back.", label: "Posture" },
  { id: 6, urdu: "Ab tak jaag rahe ho? Kal kaam nahi hai?", en: "Still awake? Don't you have work tomorrow?", label: "Sleep" },
  { id: 7, urdu: "Charger laga lo, battery khatam ho rahi hai.", en: "Plug the charger in, your battery is low.", label: "Charger" },
  { id: 8, urdu: "Dawai le li?", en: "Did you take your medicine?", label: "Medicine" },
  { id: 9, urdu: "Subha bakhair! Aaj apna khayal rakhna.", en: "Good morning! Look after yourself today.", label: "Morning" },
  { id: 10, urdu: "Break mein phone karna, awaz sunni hai.", en: "Call me on your break, I want to hear your voice.", label: "Call" },
  { id: 11, urdu: "Shabash mera bacha. Ab thora aaram karo.", en: "Well done, my child. Now rest a bit.", label: "Praise" },
  { id: 12, urdu: "Thori der phone rakh do.", en: "Put your phone away for a while.", label: "Phone" },
  { id: 13, urdu: "Duaon mein yaad rakhna.", en: "Remember me in your prayers.", label: "Dua" },
] as const;

function Index() {
  const [currentIdx, setCurrentIdx] = useState(1); // Default to "Khana kha liya?"
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [previewReminder, setPreviewReminder] = useState(1);
  const [quietHours, setQuietHours] = useState(true);
  // Auto-advance demo reminder every 4.5 seconds if not paused and not dismissed

  // Auto-advance demo reminder every 4.5 seconds if not paused and not dismissed
  useEffect(() => {
    if (isPaused || isDismissed) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % REMINDERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, isDismissed]);

  const activeReminder = REMINDERS[currentIdx] ?? REMINDERS[0];
  const currentPreview = REMINDERS[previewReminder] ?? REMINDERS[0];

  const handleNext = () => {
    setIsDismissed(false);
    setCurrentIdx((prev) => (prev + 1) % REMINDERS.length);
  };

  const handleSaySomething = () => {
    setIsDismissed(false);
    setCurrentIdx((prev) => (prev + 1) % REMINDERS.length);
  };

  return (
    <div className="maaa-page selection:bg-neutral-200">
      {/* =========================================================
          HERO & LIVE NOTCH DEMO (Maaa Style)
          ========================================================= */}
      <section className="relative flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 sm:px-11 py-7">
          <a href="/" className="text-[32px] sm:text-[34px] font-bold tracking-[-1.4px] leading-none text-[#151515]">
            ammi
          </a>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaySomething}
              className="inline-flex items-center gap-2 rounded-full border border-[#deded8] bg-white/80 backdrop-blur px-4 py-2 text-sm font-medium text-[#151515] transition-all hover:bg-white hover:shadow-sm"
            >
              <span>Say something</span>
            </button>
          </div>
        </header>

        {/* The Live Interactive Notch Demo */}
        <div className="absolute inset-x-0 top-0 z-20 h-[190px] pointer-events-none flex justify-center">
          {/* Avatar Demo */}
          <div
            className="maaa-notch group pointer-events-auto cursor-pointer"
            onClick={handleSaySomething}
            title="Click to hear Ammi speak"
          >
            <div className="w-[124px] sm:w-[140px] h-[126px] sm:h-[142px] overflow-hidden flex items-start justify-center transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.18)]">
              <img
                src={appIcon}
                alt="Ammi avatar portrait"
                width={140}
                height={142}
                className="w-full h-auto object-contain object-top"
              />
            </div>
          </div>

          {/* Speech Bubble */}
          {!isDismissed && (
            <div className="maaa-speech pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
              <p className="text-[16px] font-semibold text-[#151515] tracking-[-0.3px] leading-[1.3] pr-4">
                {activeReminder.urdu}
              </p>
              <p className="text-[14px] text-[#727270] mt-1.5 leading-[1.35]">
                {activeReminder.en}
              </p>
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="absolute top-2 right-2.5 size-5 flex items-center justify-center text-xs text-[#a0a09c] hover:text-[#151515] transition-colors rounded-full"
                aria-label="Dismiss reminder"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Hero Intro Content */}
        <div className="pt-[140px] sm:pt-[155px] pb-14 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[4.5px] text-[#727270] mb-4">
            A little home in your machine
          </p>
          <h1 className="text-[44px] sm:text-[64px] font-normal tracking-[-2.2px] sm:tracking-[-2.8px] leading-[1.12] text-[#151515] max-w-3xl">
            Someone’s looking out for you.
          </h1>
          <p className="text-[19px] sm:text-[22px] text-[#727270] tracking-[-0.5px] leading-[1.45] mt-3 sm:mt-4 mb-8 max-w-xl">
            Gentle reminders. A familiar voice. Right in your notch.
          </p>

          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <a
                href="https://github.com/hmadhsan/social-sync-windows/releases/download/v1.0.1/Ammi-Setup.exe"
                className="maaa-pill-btn"
              >
                <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M2 3.4 10.8 2v9.4H2V3.4Zm10 8V1.8L22 0v11.4H12ZM2 12.6h8.8V22L2 20.6v-8Zm10 0h10V24l-10-1.8v-9.6Z" />
                </svg>
                <span>Download for Windows</span>
              </a>

              <a href={macArm.url} download className="maaa-pill-btn">
                <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.82.93-2.87-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.76-.95 2.8.01 0 .03 0 .05 0 1.01 0 2.01-.54 2.64-1.3" />
                </svg>
                <span>Download for Mac</span>
              </a>
            </div>
            <p className="text-[13px] text-[#767674] tracking-tight text-center mt-1">
              Free · Windows 10 &amp; 11 · macOS 12+ ·{" "}
              <a href={macIntel.url} download className="underline underline-offset-2 hover:text-[#151515]">
                Older Intel Mac?
              </a>
            </p>
            <p className="text-[12.5px] text-[#8b8b88] tracking-tight text-center max-w-md leading-[1.5]">
              On a Mac, unzip and drag Ammi into Applications. The first time, right-click Ammi and choose
              “Open” — macOS asks once because Ammi comes from an independent developer.
            </p>
          </div>
        </div>

        {/* Demo Playback Control Bar (Maaa style) */}
        <footer className="w-full px-6 sm:px-11 py-5 border-t border-[#deded8]/70 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#727270]">
          <p className="m-0 font-normal">Made with care.</p>

          <div className="flex items-center gap-3 sm:gap-4 text-[#151515]">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="size-9 rounded-full flex items-center justify-center hover:bg-[#ecece8] transition-colors"
              aria-label={isPaused ? "Play demo" : "Pause demo"}
              title={isPaused ? "Resume rotation" : "Pause rotation"}
            >
              {isPaused ? (
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="size-4 stroke-current stroke-[2.5]" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14M16 5v14" />
                </svg>
              )}
            </button>

            <span className="text-[12px] tabular-nums text-[#727270]">
              {String(activeReminder.id + 1).padStart(2, "0")} / {String(REMINDERS.length).padStart(2, "0")}
            </span>

            <select
              value={activeReminder.id}
              onChange={(e) => {
                setIsDismissed(false);
                setCurrentIdx(Number(e.target.value));
              }}
              className="bg-transparent border-0 text-[13px] text-[#151515] py-1.5 px-2 rounded hover:bg-[#ecece8] cursor-pointer focus:outline-none"
            >
              {REMINDERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.urdu}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNext}
              className="size-9 rounded-full flex items-center justify-center hover:bg-[#ecece8] transition-colors"
              aria-label="Next reminder"
              title="Next reminder"
            >
              <svg className="size-4 stroke-current stroke-[2.5]" viewBox="0 0 24 24" fill="none">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 text-[12px]">
            <span className="text-[#999994]">Desktop Companion</span>
          </div>
        </footer>
      </section>

      {/* =========================================================
          SECTION 1: CARE THROUGHOUT YOUR DAY (Split Heading + 3 Cards)
          ========================================================= */}
      <section className="border-t border-[#deded8] px-6 sm:px-16 py-24 sm:py-28 max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[2.7px] text-[#727270] mb-4">
              Care throughout your day
            </p>
            <h2 className="text-[38px] sm:text-[56px] font-normal tracking-[-2px] leading-[1.08] text-[#151515]">
              For the things<br />you forget to do.
            </h2>
          </div>
          <p className="text-[18px] text-[#727270] leading-[1.65] max-w-[420px]">
            Another tab can wait.<br />
            A sip of water. A proper lunch.<br />
            A quick call home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-9 pt-6">
          {/* Card 1 */}
          <article className="border-t border-[#bdbdb7] pt-6 relative">
            <span className="absolute -top-[3px] left-0 size-[5px] rounded-full bg-[#151515]" />
            <p className="text-[10px] font-semibold tracking-[1.7px] uppercase text-[#727270] mb-6">
              01 / A little fuel
            </p>
            <div className="size-[110px] rounded-2xl overflow-hidden mb-6 shadow-sm border border-[#e8e8e2]">
              <img src={appIcon} alt="Ammi reminder avatar" width={110} height={110} className="size-full object-cover" />
            </div>
            <h3 className="text-[25px] font-normal tracking-[-0.7px] leading-[1.15] text-[#151515]">
              Khana kha liya?
            </h3>
            <p className="text-[15px] text-[#727270] mt-3">
              Meal-time check-ins when work gets intense.
            </p>
          </article>

          {/* Card 2 */}
          <article className="border-t border-[#bdbdb7] pt-6 relative">
            <span className="absolute -top-[3px] left-0 size-[5px] rounded-full bg-[#151515]" />
            <p className="text-[10px] font-semibold tracking-[1.7px] uppercase text-[#727270] mb-6">
              02 / A little pause
            </p>
            <div className="size-[110px] rounded-2xl overflow-hidden mb-6 shadow-sm border border-[#e8e8e2]">
              <img src={appIcon} alt="Ammi reminder avatar" width={110} height={110} className="size-full object-cover" />
            </div>
            <h3 className="text-[25px] font-normal tracking-[-0.7px] leading-[1.15] text-[#151515]">
              Pani pee lo.
            </h3>
            <p className="text-[15px] text-[#727270] mt-3">
              Water, movement, and resting your eyes.
            </p>
          </article>

          {/* Card 3 */}
          <article className="border-t border-[#bdbdb7] pt-6 relative">
            <span className="absolute -top-[3px] left-0 size-[5px] rounded-full bg-[#151515]" />
            <p className="text-[10px] font-semibold tracking-[1.7px] uppercase text-[#727270] mb-6">
              03 / A little care
            </p>
            <div className="size-[110px] rounded-2xl overflow-hidden mb-6 shadow-sm border border-[#e8e8e2]">
              <img src={appIcon} alt="Ammi reminder avatar" width={110} height={110} className="size-full object-cover" />
            </div>
            <h3 className="text-[25px] font-normal tracking-[-0.7px] leading-[1.15] text-[#151515]">
              Seedhi tarhan baitho.
            </h3>
            <p className="text-[15px] text-[#727270] mt-3">
              Posture checks and remembering to breathe.
            </p>
          </article>
        </div>

        <p className="text-[14px] text-[#727270] mt-12">
          Plus low-battery warnings, bedtime nudges, morning duayein, and chai prompts.
        </p>
      </section>

      {/* =========================================================
          SECTION 2: FEELS LIKE YOUR AMMI (4 Languages: English, Urdu, German, Punjabi)
          ========================================================= */}
      <section className="bg-[#f0f0eb] px-6 sm:px-16 py-24 sm:py-28 text-center border-t border-[#deded8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[2.7px] text-[#727270] mb-4">
            Feels like your Ammi
          </p>
          <h2 className="text-[38px] sm:text-[56px] font-normal tracking-[-2px] leading-[1.08] text-[#151515]">
            Same love.<br />Your kind of Ammi.
          </h2>

          {/* Portrait Row with subtle elevation variation */}
          <div className="flex justify-center items-center gap-3 sm:gap-4 my-10">
            <div className="size-20 sm:size-24 rounded-full overflow-hidden shadow-sm border border-white/60">
              <img src={appIcon} alt="Ammi portrait" className="size-full object-cover" />
            </div>
            <div className="size-20 sm:size-24 rounded-full overflow-hidden shadow-sm border border-white/60 translate-y-3">
              <img src={appIcon} alt="Ammi portrait" className="size-full object-cover" />
            </div>
            <div className="size-24 sm:size-28 rounded-full overflow-hidden shadow-md border-2 border-white scale-105">
              <img src={appIcon} alt="Ammi portrait" className="size-full object-cover" />
            </div>
            <div className="size-20 sm:size-24 rounded-full overflow-hidden shadow-sm border border-white/60 translate-y-3">
              <img src={appIcon} alt="Ammi portrait" className="size-full object-cover" />
            </div>
            <div className="size-20 sm:size-24 rounded-full overflow-hidden shadow-sm border border-white/60">
              <img src={appIcon} alt="Ammi portrait" className="size-full object-cover" />
            </div>
          </div>

          {/* Dynamic Dialogue Example */}
          <div className="min-h-[96px] flex flex-col justify-center items-center my-6">
            <p className="text-[32px] sm:text-[46px] font-normal tracking-[-1.5px] leading-[1.2] text-[#151515] transition-all duration-200">
              “{currentPreview.urdu}”
            </p>
            <p className="text-[16px] sm:text-[18px] text-[#727270] mt-3">
              {currentPreview.en}
            </p>
          </div>

          {/* 4 Focused Languages Selector */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-2xl mx-auto">
            {REMINDERS.slice(0, 8).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setPreviewReminder(r.id)}
                className={`px-4 py-2 text-[14px] rounded-full transition-all border ${
                  previewReminder === r.id
                    ? "bg-[#151515] text-white border-[#151515]"
                    : "bg-white/70 text-[#727270] border-[#deded8] hover:bg-white hover:text-[#151515]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <p className="text-[14px] text-[#727270] mt-8">
            Available in English, Urdu, German &amp; Punjabi · 3 mom energy tones · Gentle, playful or dramatic
          </p>
        </div>
      </section>

      {/* =========================================================
          SECTION 3: ON YOUR TERMS (Quiet Hours & Breathing Room)
          ========================================================= */}
      <section className="border-t border-[#deded8] px-6 sm:px-16 py-24 sm:py-28 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[2.7px] text-[#727270] mb-4">
              On your terms
            </p>
            <h2 className="text-[38px] sm:text-[56px] font-normal tracking-[-2px] leading-[1.08] text-[#151515]">
              A little care.<br />A little breathing room.
            </h2>
            <p className="text-[18px] text-[#727270] leading-[1.65] mt-6">
              Choose quiet hours, space out check-ins and pause whenever you need deep, uninterrupted focus.
            </p>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#deded8] shadow-sm">
            <div className="flex items-center justify-between pb-6 border-b border-[#deded8]">
              <div>
                <b className="block text-[18px] font-medium text-[#151515]">Quiet hours</b>
                <small className="block text-[14px] text-[#727270] mt-1">10:00 PM — 8:00 AM</small>
              </div>
              <button
                type="button"
                onClick={() => setQuietHours(!quietHours)}
                className={`maaa-switch ${quietHours ? "" : "off"}`}
                aria-label="Toggle quiet hours"
              >
                <div className="maaa-switch-handle" />
              </button>
            </div>

            <p className="text-[15px] text-[#727270] mt-5">
              {quietHours ? "A little peace until morning." : "Checking in throughout the night."}
            </p>

            <div className="flex flex-col gap-4 text-[14px] text-[#727270] mt-8 pt-6 border-t border-[#deded8]/50">
              <div className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-[#151515]" />
                <span>Your timing (10m, 25m, 1h, 2h).</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-[#151515]" />
                <span>Your screen position (left, centre, right).</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-[#151515]" />
                <span>Zero disruptive sounds or modal lockouts.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 4: HOW IT WORKS (3 Simple Steps)
          ========================================================= */}
      <section className="border-t border-[#deded8] px-6 sm:px-16 py-24 sm:py-28 max-w-[1280px] mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[2.7px] text-[#727270] mb-4">
          How it works
        </p>
        <h2 className="text-[38px] sm:text-[56px] font-normal tracking-[-2px] leading-[1.08] text-[#151515] mb-14">
          A few choices.<br />Then she’s there.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-14">
          <div>
            <span className="block text-[13px] text-[#727270] mb-5 font-mono">01</span>
            <h3 className="text-[24px] font-normal tracking-[-0.6px] text-[#151515]">
              Download &amp; install.
            </h3>
            <p className="text-[16px] text-[#727270] leading-[1.6] mt-3">
              Unzip and drag <span className="text-[#151515] font-medium">Ammi.app</span> into Applications on a Mac, or run <span className="text-[#151515] font-medium">Ammi-Setup.exe</span> on Windows. Zero configuration.
            </p>
          </div>

          <div>
            <span className="block text-[13px] text-[#727270] mb-5 font-mono">02</span>
            <h3 className="text-[24px] font-normal tracking-[-0.6px] text-[#151515]">
              Find your rhythm.
            </h3>
            <p className="text-[16px] text-[#727270] leading-[1.6] mt-3">
              Pick how often she checks in and where she sits. She lives right beside the clock in your system tray.
            </p>
          </div>

          <div>
            <span className="block text-[13px] text-[#727270] mb-5 font-mono">03</span>
            <h3 className="text-[24px] font-normal tracking-[-0.6px] text-[#151515]">
              Carry on.
            </h3>
            <p className="text-[16px] text-[#727270] leading-[1.6] mt-3">
              She’ll lean down from the top edge with care, speak her mind, and gently slide back up.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 5: YOUR MACHINE STAYS YOURS (Privacy)
          ========================================================= */}
      <section className="border-t border-[#deded8] px-6 sm:px-16 py-24 sm:py-28 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[2.7px] text-[#727270] mb-4">
              Your machine stays yours
            </p>
            <h2 className="text-[38px] sm:text-[56px] font-normal tracking-[-2px] leading-[1.08] text-[#151515]">
              A familiar face.<br />A little privacy, too.
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-[17px] text-[#151515] pb-4 border-b border-[#deded8]">
              No account to create.
            </p>
            <p className="text-[17px] text-[#151515] pb-4 border-b border-[#deded8]">
              No microphone, camera, or screen recording.
            </p>
            <p className="text-[17px] text-[#151515] pb-4 border-b border-[#deded8]">
              No background telemetry or network tracking.
            </p>
            <p className="text-[17px] text-[#151515] pb-4 border-b border-[#deded8]">
              Reminders and preferences stored 100% locally on your PC.
            </p>
            <small className="block text-[13px] text-[#727270] pt-2 leading-[1.7]">
              Completely self-contained. Delete the folder anytime and she is gone.
            </small>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 6: CLOSING HERO & FOOTER
          ========================================================= */}
      <section className="border-t border-[#deded8] px-6 py-28 text-center">
        <div className="w-24 sm:w-28 h-24 sm:h-28 mx-auto mb-6 flex items-center justify-center filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.14)]">
          <img src={appIcon} alt="Ammi avatar portrait" className="w-full h-auto object-contain" />
        </div>
        <h2 className="text-[44px] sm:text-[56px] font-normal tracking-[-2px] leading-[1.1] text-[#151515]">
          A little home.<br />Right here.
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <a
            href="https://github.com/hmadhsan/social-sync-windows/releases/download/v1.0.1/Ammi-Setup.exe"
            className="maaa-pill-btn"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M2 3.4 10.8 2v9.4H2V3.4Zm10 8V1.8L22 0v11.4H12ZM2 12.6h8.8V22L2 20.6v-8Zm10 0h10V24l-10-1.8v-9.6Z" />
            </svg>
            <span>Download for Windows</span>
          </a>

          <a href={macArm.url} download className="maaa-pill-btn">
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.82.93-2.87-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.76-.95 2.8.01 0 .03 0 .05 0 1.01 0 2.01-.54 2.64-1.3" />
            </svg>
            <span>Download for Mac</span>
          </a>
        </div>
        <p className="text-[13px] text-[#727270] mt-3">
          Free · Windows 10 &amp; 11 · macOS ·{" "}
          <a href={macIntel.url} download className="underline underline-offset-2 hover:text-[#151515]">
            Older Intel Mac?
          </a>
        </p>
      </section>

      {/* Page Footer */}
      <footer className="border-t border-[#deded8] px-6 sm:px-16 py-8 max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#727270]">
        <a href="/" className="text-[22px] font-bold tracking-[-1px] text-[#151515]">
          ammi
        </a>
        <span>Made with care.</span>
        <span>Windows &amp; macOS desktop companion</span>
      </footer>
    </div>
  );
}
