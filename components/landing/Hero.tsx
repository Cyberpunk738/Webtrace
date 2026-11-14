"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Braces,
  Globe2,
  Zap,
  MousePointer2,
  Radio,
  Layers3,
} from "lucide-react";
import { UrlInput } from "./UrlInput";
import { ReportHistory } from "../analysis/ReportTools";

const features = [
  {
    title: "See every request.",
    text: "Follow the network waterfall. Find the scripts, images and API calls holding your page back.",
    Icon: Radio,
    color: "yellow",
    tag: "01 / INSPECT",
  },
  {
    title: "Find the friction.",
    text: "Turn captured requests into a focused list of bottlenecks, with practical fixes for each one.",
    Icon: Zap,
    color: "purple",
    tag: "02 / UNDERSTAND",
  },
  {
    title: "Track your progress.",
    text: "Save recent reports in your browser, compare repeat runs and export the evidence.",
    Icon: Layers3,
    color: "pink",
    tag: "03 / IMPROVE",
  },
];
const steps = [
  [
    "Paste. Trace. Discover.",
    "Enter a public website URL. WebTrace opens a browser and observes its network activity. If Chromium is unavailable, a clearly labeled HTTP inspection keeps you moving.",
  ],
  [
    "Find your next fix.",
    "Review resource sizes, slow requests and failures. Open a request to inspect its details, then use the audit recommendations to decide what to tackle first.",
  ],
  [
    "Make the next run better.",
    "Re-analyze the same URL after a change. Compare with the previous capture of the same type, then download a JSON report or a CSV request list.",
  ],
];

export function Hero() {
  const [step, setStep] = useState(0);
  return (
    <div className="landing">
      <section className="trace-hero">
        <div className="hero-kicker">
          <span className="live-dot" /> YOUR WEBSITE HAS A STORY. FOLLOW THE
          TRACE.
        </div>
        <div className="hero-title-wrap">
          <span className="hero-sticker globe-sticker" aria-hidden="true">
            <Globe2 />
          </span>
          <h1 className="display hero-title">
            SMALL REQUESTS.
            <br />
            <span className="yellow-text">BIG IMPACT.</span>
            <br />
            <span className="outline-text">MAKE IT</span>{" "}
            <span className="purple-text">FAST.</span>
          </h1>
          <span className="hero-sticker bolt-sticker" aria-hidden="true">
            <Zap />
          </span>
          <span className="round-sticker" aria-hidden="true">
            <ArrowUpRight />
            FOLLOW
            <br />
            THE TRACE
          </span>
          <span className="cursor-sticker" aria-hidden="true">
            <MousePointer2 />
          </span>
        </div>
        <p className="hero-description">
          Get under the hood of any public website.
          <br className="hidden sm:block" /> Uncover heavy assets, slow calls
          and the fixes that matter.
        </p>
        <UrlInput />
        <div className="hero-footnote">
          <span>REAL REQUESTS</span>
          <span>10 AUDIT RULES</span>
          <span>NO SIGN-UP</span>
        </div>
        <a href="#toolkit" className="scroll-link">
          MEET YOUR NEW TOOLKIT <ArrowDown size={14} />
        </a>
      </section>
      <section id="toolkit" className="toolkit-section">
        <div className="section-heading">
          <h2 className="display">
            LESS MYSTERY.
            <br />
            MORE <span className="label-sticker green-sticker">CLARITY.</span>
          </h2>
          <p>
            Everything you need to understand
            <br />
            what your website is really loading.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ title, text, Icon, color, tag }) => (
            <article key={title} className={`feature-card ${color}-card`}>
              <span className="feature-tag">{tag}</span>
              <div className="feature-illustration" aria-hidden="true">
                <div className="illustration-orbit" />
                <Icon />
                <span className="little-star">✦</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <ArrowUpRight className="feature-arrow" size={22} />
            </article>
          ))}
        </div>
        <ReportHistory />
        <div className="section-heading how-heading">
          <h2 className="display">
            YOUR NEXT <span className="green-text">“AHA!”</span>
            <br />
            IS JUST ONE TRACE AWAY.
          </h2>
          <Braces className="how-icon" aria-hidden="true" />
        </div>
        <div
          className="how-tabs"
          role="tablist"
          aria-label="How WebTrace works"
        >
          {["Capture", "Investigate", "Improve"].map((label, index) => (
            <button
              key={label}
              id={`step-${index}`}
              role="tab"
              aria-selected={step === index}
              aria-controls="step-panel"
              tabIndex={step === index ? 0 : -1}
              onKeyDown={(e) => {
                if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
                  e.preventDefault();
                  const next = (step + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                  setStep(next);
                  document.getElementById(`step-${next}`)?.focus();
                }
              }}
              onClick={() => setStep(index)}
            >
              {`0${index + 1}`} <span>{label}</span>
            </button>
          ))}
        </div>
        <div
          id="step-panel"
          className={`how-panel step-${step}`}
          role="tabpanel"
          aria-labelledby={`step-${step}`}
        >
          <div>
            <span className="eyebrow">FROM URL TO UNDERSTANDING</span>
            <h3 className="display">{steps[step][0]}</h3>
            <p>{steps[step][1]}</p>
            <button
              className="ink-button"
              onClick={() => {
                document.getElementById("target-url")?.focus();
                document
                  .getElementById("target-url")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              Start your trace <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="mini-browser" aria-hidden="true">
            <div className="mini-browser-bar">
              <i />
              <i />
              <i />
              <span>THE NETWORK, UNPACKED.</span>
            </div>
            <div className="mini-stat">
              <span>EVERY MILLISECOND COUNTS</span>
              <Zap />
              <strong>
                Make room
                <br />
                for speed.
              </strong>
            </div>
            <div className="mini-waterfall">
              {[26, 55, 38, 76, 46].map((n, i) => (
                <div key={i}>
                  <span>
                    {
                      [
                        "index.html",
                        "app.js",
                        "styles.css",
                        "hero.webp",
                        "api/data",
                      ][i]
                    }
                  </span>
                  <i style={{ marginLeft: `${i * 6}px`, width: `${n}%` }} />
                </div>
              ))}
            </div>
            <span className="demo-label">ILLUSTRATION / NOT LIVE DATA</span>
          </div>
        </div>
      </section>
      <footer className="landing-footer">
        <span className="eyebrow">BUILD BETTER. SHIP FASTER.</span>
        <h2 className="display">
          GOOD WEBSITES
          <br />
          LEAVE <span>GREAT TRACES.</span>
        </h2>
        <button
          className="ink-button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            document.getElementById("target-url")?.focus();
          }}
        >
          Find yours <ArrowUpRight size={18} />
        </button>
        <div className="footer-bottom">
          <strong>WEBTRACE®</strong>
          <span>Website performance, made visible.</span>
          <a
            href="https://github.com/Cyberpunk738/Webtrace"
            target="_blank"
            rel="noreferrer"
          >
            View source ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
