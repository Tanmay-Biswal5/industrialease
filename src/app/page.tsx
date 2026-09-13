"use client";

import { useState } from "react";

const workflow = ["Profile", "Checklist", "Documents", "Pre-check", "Route", "Track", "Discover"];
const approvals = [
  { name: "Factory License", department: "Directorate of Industrial Safety", status: "In review", tone: "amber", date: "12 Sep 2026" },
  { name: "MPCB Consent to Establish", department: "Maharashtra Pollution Control Board", status: "Documents ready", tone: "blue", date: "11 Sep 2026" },
  { name: "Building Plan Approval", department: "Local Planning Authority", status: "Action needed", tone: "red", date: "09 Sep 2026" },
];

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [notice, setNotice] = useState("");
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">IL</span><span>INDUSTRIALEASE</span></div>
        <div className="workspace-label">APPLICANT WORKSPACE</div>
        <nav className="nav-list" aria-label="Primary navigation">
          {["Overview", "My applications", "Data vault", "Compliance AI", "Schemes & support"].map((item, index) => <button className={`nav-item ${active === item ? "active" : ""}`} key={item} onClick={() => setActive(item)}><span className="nav-icon">{["⌂", "▣", "▤", "✦", "◈"][index]}</span>{item}</button>)}
        </nav>
        <div className="sidebar-bottom"><div className="security-note"><span>🛡</span><div><strong>Security Sandbox</strong><small>Hardened headers &amp; edge guards</small></div></div><button className="profile-chip" onClick={() => showNotice("Account settings are protected by RBAC.")}><span className="avatar">DN</span><span><strong>Deepak Naik</strong><small>Business owner</small></span><span className="chevron">⌄</span></button></div>
      </aside>
      <section className="content">
        <header className="topbar"><div className="crumb">Home <span>/</span> {active}</div><div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={() => showNotice("No new notifications.")}>♢<i /></button><button className="help-button" onClick={() => showNotice("Support request channel is ready.")}>? Help &amp; support</button></div></header>
        <div className="main-inner">
          <div className="welcome-row"><div><p className="eyebrow">SATARA INDUSTRIAL ESTATE · MH</p><h1>Good morning, Deepak.</h1><p className="muted">Your approval journey is moving forward. Here is your latest status.</p></div><button className="primary-button" onClick={() => showNotice("New application flow opened.")}>+ Start new application</button></div>
          <section className="journey-panel"><div className="section-heading"><div><p className="eyebrow">APPLICATION JOURNEY</p><h2>Textile Manufacturing Unit</h2></div><span className="status-pill green"><span /> On track</span></div><div className="steps">{workflow.map((step, index) => <div className={`step ${index < 3 ? "done" : index === 3 ? "current" : ""}`} key={step}><div className="step-dot">{index < 3 ? "✓" : index + 1}</div><span>{step}</span></div>)}</div><div className="progress-line"><span /></div><div className="journey-footer"><span>Step 4 of 7 · AI pre-check</span><button className="text-button" onClick={() => showNotice("Opening the AI pre-check workspace.")}>Continue journey <span>→</span></button></div></section>
          <div className="metrics"><Metric number="08" label="Approvals identified" caption="Across 4 departments" /><Metric number="12" label="Documents secured" caption="100% vault coverage" /><Metric number="03" label="Active applications" caption="One needs attention" /></div>
          <div className="lower-grid"><section className="approvals-panel"><div className="section-heading compact"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Approval applications</h2></div><button className="text-button" onClick={() => setActive("My applications")}>View all <span>→</span></button></div><div className="approval-list">{approvals.map((approval) => <div className="approval-row" key={approval.name}><div className={`approval-icon ${approval.tone}`}>{approval.tone === "red" ? "!" : "✓"}</div><div className="approval-copy"><strong>{approval.name}</strong><span>{approval.department}</span></div><div className={`status-pill ${approval.tone}`}>{approval.status}</div><time>{approval.date}</time><button className="row-menu" aria-label={`Open ${approval.name}`}>•••</button></div>)}</div></section><aside className="support-panel"><div className="support-art">✦</div><p className="eyebrow">SMART SUPPORT</p><h2>One scheme matched<br />your business.</h2><p className="muted">Maharashtra Industrial Investment Subsidy</p><button className="outline-button" onClick={() => setActive("Schemes & support")}>Review scheme <span>→</span></button></aside></div>
          <div className="privacy-bar"><span className="lock">⌑</span><span><strong>Sandbox Mode</strong> · Zero-trust uploads, CSRF edge protection, and RBAC policies enabled.</span><button onClick={() => showNotice("Security controls: Strict CSP, Edge CSRF guard, and magic-byte document validation.")}>View security details →</button></div>
        </div>
      </section>
      {notice && <div className="toast">{notice}</div>}
    </main>
  );
}

function Metric({ number, label, caption }: { number: string; label: string; caption: string }) { return <div className="metric"><strong>{number}</strong><div><span>{label}</span><small>{caption}</small></div></div>; }
