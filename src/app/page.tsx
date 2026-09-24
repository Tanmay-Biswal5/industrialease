"use client";

import { useState } from "react";

type GovAssistAnswers = {
  idea: string;
  activity: "product" | "service" | "both" | "";
  state: string;
  district: string;
  city: string;
  premises: "owned" | "rented" | "leased" | "shared" | "virtual" | "";
  stage: string;
  structure: string;
  investment: string;
  turnover: string;
  employees: string;
  machinery: boolean;
};

const emptyAnswers: GovAssistAnswers = {
  idea: "",
  activity: "",
  state: "Maharashtra",
  district: "",
  city: "",
  premises: "",
  stage: "",
  structure: "",
  investment: "",
  turnover: "",
  employees: "",
  machinery: false,
};

type SavedWorkspace = {
  email: string;
  passwordHash: string;
  answers: GovAssistAnswers;
  step: number;
  showPlan: boolean;
};

const WORKSPACE_STORAGE_KEY = "industria-lease-workspaces";

async function hashCredential(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function Home() {
  const [access, setAccess] = useState<"pending" | "account" | "guest">("pending");
  const [workspace, setWorkspace] = useState<SavedWorkspace | null>(null);
  const [notice, setNotice] = useState("");

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  function openWorkspace(nextWorkspace: SavedWorkspace) {
    setWorkspace(nextWorkspace);
    setAccess("account");
    showNotice("Workspace opened. Your progress will be saved as you go.");
  }

  if (access === "pending") {
    return <AccessScreen onOpen={openWorkspace} onGuest={() => { setAccess("guest"); showNotice("Guest workspace opened. Guest progress is temporary."); }} />;
  }

  return <><GovAssistFlow account={workspace} onAccountChange={setWorkspace} onNotice={showNotice} />{notice && <div className="toast"><span>!</span>{notice}</div>}</>;

  /* return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">IL</span><span>INDUSTRIALEASE</span></div>
        <div className="workspace-label">APPLICANT WORKSPACE</div>
        <nav className="nav-list" aria-label="Primary navigation">
          {navigation.map((item, index) => <a className={`nav-item ${active === item ? "active" : ""}`} href={item === "Overview" ? "/" : `/${item === "My applications" ? "applications" : item === "Data vault" ? "vault" : item === "Compliance AI" ? "compliance" : "schemes"}`} key={item}><span className="nav-icon">{["01", "02", "03", "04", "05"][index]}</span>{item}<span className="nav-arrow">→</span></a>)}
        </nav>
        <div className="sidebar-bottom"><div className="security-note"><span>+</span><div><strong>Protected workspace</strong><small>Encrypted and access-controlled</small></div></div><button className="profile-chip" onClick={() => showNotice("Account settings are protected by RBAC.")}><span className="avatar">DN</span><span><strong>Deepak Naik</strong><small>Business owner</small></span><span className="chevron">⌄</span></button></div>
      </aside>

      <section className="content">
        <header className="topbar"><div className="crumb"><span className="crumb-home">Workspace</span><span>/</span>{active}</div><div className="top-actions"><span className="live-status"><i /> Systems operational</span><button className="icon-button" aria-label="Notifications" onClick={() => showNotice("You have one approval requiring attention.")}>!</button><button className="help-button" onClick={() => setDialog("support")}>Help center <span>?</span></button></div></header>
        <div className="main-inner">
          {active === "Overview" ? <>
          <div className="welcome-row"><div><p className="eyebrow">TUESDAY · 22 SEPTEMBER 2026 · SATARA, MH</p><h1>Good morning, Deepak.</h1><p className="muted">Your next decision is waiting in the approval journey.</p></div><button className="primary-button" onClick={() => setDialog("application")}><span>+</span> Start new application</button></div>

          <section className="hero-panel"><div className="hero-copy"><div className="hero-kicker"><span className="pulse" /> APPLICATION 01 <span className="hero-slash">/</span> IN PROGRESS</div><h2>Textile Manufacturing<br /><em>Unit</em></h2><p>Turn one business profile into every approval your unit needs.</p><button className="hero-link" onClick={() => showNotice("Opening the AI pre-check workspace.")}>Continue from AI pre-check <span>→</span></button></div><div className="hero-art" aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-grid" /><div className="art-label">MH<br /><span>01</span></div></div><div className="hero-meta"><span><strong>04</strong><small>of 07 steps</small></span><span><strong>57%</strong><small>complete</small></span><span className="hero-meta-right"><small>Last updated</small><strong>Today, 10:42 AM</strong></span></div></section>

          <section className="journey-strip"><div className="strip-label"><p className="eyebrow">YOUR PATH</p><strong>Approval journey</strong></div><div className="steps">{workflow.map((step, index) => <button className={`step ${index < 3 ? "done" : index === 3 ? "current" : ""}`} key={step} onClick={() => showNotice(index <= 3 ? `${step} is available in your journey.` : `${step} unlocks after pre-check.`)}><span className="step-dot">{index < 3 ? "OK" : `0${index + 1}`}</span><span>{step}</span></button>)}</div></section>

          <div className="section-heading section-heading-top"><div><p className="eyebrow">AT A GLANCE</p><h2>What needs your attention</h2></div><a className="text-button" href="/applications">Open workspace <span>→</span></a></div>
          <div className="metrics"><Metric number="08" label="Approvals identified" caption="Across 4 departments" accent="teal" /><Metric number="12" label="Documents secured" caption="100% vault coverage" accent="gold" /><Metric number="01" label="Needs your attention" caption="Building plan approval" accent="coral" /></div>

          <div className="lower-grid"><section className="approvals-panel"><div className="section-heading compact"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Approval applications</h2></div><button className="text-button" onClick={() => setActive("My applications")}>View all <span>→</span></button></div><div className="approval-list">{approvals.map((approval) => <button className={`approval-row ${selectedApproval.name === approval.name ? "selected" : ""}`} key={approval.name} onClick={() => setSelectedApproval(approval)}><div className={`approval-icon ${approval.tone}`}>{approval.tone === "red" ? "!" : "✓"}</div><div className="approval-copy"><strong>{approval.name}</strong><span>{approval.department}</span></div><div className={`status-pill ${approval.tone}`}>{approval.status}</div><time>{approval.date}</time><span className="row-menu">→</span></button>)}</div><div className="selected-detail"><span className={`detail-dot ${selectedApproval.tone}`} /><div><strong>{selectedApproval.name}</strong><span>{selectedApproval.action}</span></div><button onClick={() => showNotice(`Opening ${selectedApproval.name}.`)}>Open application <span>↗</span></button></div></section><aside className="support-panel"><div className="support-number">01</div><p className="eyebrow">SMART SUPPORT</p><h2>A better route<br />starts here.</h2><p className="muted">Maharashtra Industrial Investment Subsidy matched to your business profile.</p><button className="outline-button" onClick={() => setActive("Schemes & support")}>Review scheme <span>→</span></button><div className="support-line" /></aside></div>
          <div className="privacy-bar"><span className="lock">⌑</span><span><strong>Your data is protected</strong> · Access is logged and controlled with role-based permissions.</span><button onClick={() => setDialog("security")}>View security details →</button></div>
          </> : <WorkspaceView active={active} onAction={(message) => showNotice(message)} />}
        </div>
      </section>
      {notice && <div className="toast"><span>✓</span>{notice}</div>}
      {dialog && <Dialog type={dialog} onClose={() => setDialog(null)} onAction={(message) => { setDialog(null); showNotice(message); }} />}
    </main>
  ); */
}

function GovAssistFlow({ account, onAccountChange, onNotice }: { account: SavedWorkspace | null; onAccountChange: (account: SavedWorkspace | null) => void; onNotice: (message: string) => void }) {
  const [answers, setAnswers] = useState(account?.answers || emptyAnswers);
  const [step, setStep] = useState(account?.step || 0);
  const [showPlan, setShowPlan] = useState(account?.showPlan || false);
  const fields = ["Business idea", "Location", "Business stage", "Business scale"];

  function saveProgress(nextAnswers: GovAssistAnswers, nextStep: number, nextShowPlan = showPlan) {
    setAnswers(nextAnswers);
    setStep(nextStep);
    setShowPlan(nextShowPlan);
    if (account) {
      const nextAccount = { ...account, answers: nextAnswers, step: nextStep, showPlan: nextShowPlan };
      onAccountChange(nextAccount);
      const stored = JSON.parse(window.localStorage.getItem(WORKSPACE_STORAGE_KEY) || "{}");
      window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({ ...stored, [account.email]: nextAccount }));
    }
  }

  function update<K extends keyof GovAssistAnswers>(key: K, value: GovAssistAnswers[K]) {
    saveProgress({ ...answers, [key]: value }, step);
  }

  function next() {
    if (step === 0 && answers.idea.trim().length < 4) return onNotice("Describe the business you want to start.");
    if (step === 1 && (!answers.state || !answers.district)) return onNotice("Choose a state and add a district.");
    if (step === 2 && (!answers.stage || !answers.structure)) return onNotice("Choose a business stage and structure.");
    if (step < fields.length - 1) saveProgress(answers, step + 1);
    else saveProgress(answers, step, true);
  }

  if (showPlan) return <GovAssistPlan answers={answers} onRestart={() => saveProgress(emptyAnswers, 0, false)} onNotice={onNotice} />;

  return <main className="gov-shell">
    <header className="gov-header"><div className="access-brand"><span className="brand-mark">IL</span><span>INDUSTRIALEASE</span></div><div className="gov-header-actions"><span className="gov-header-note">INDIA · SOURCE-BACKED DECISION SUPPORT</span>{account && <span className="account-badge">{account.email}</span>}</div></header>
    <section className="gov-intake">
      <div className="gov-intro"><p className="access-kicker"><span /> YOUR BUSINESS CHECK</p><h1>Tell us what you want<br /><em>to build.</em></h1><p>We will map likely registrations, licences, documents, and government schemes. Your result is a screening aid, not a legal or financial guarantee.</p><div className="gov-trust"><strong>State-aware</strong><strong>Source-backed</strong><strong>No guarantees</strong></div></div>
      <div className="gov-form-wrap"><div className="gov-progress"><span>0{step + 1} / 0{fields.length}</span><strong>{fields[step]}</strong><div><i style={{ width: `${((step + 1) / fields.length) * 100}%` }} /></div></div>
        {step === 0 && <div className="gov-question"><p className="eyebrow">STEP 01 · INDUSTRY SEARCH</p><h2>What industry are you entering?</h2><p className="gov-help">Describe the activity in plain language. GovAssist will suggest relevant schemes, licences, and documents.</p><div className="industry-search"><span aria-hidden="true">⌕</span><input value={answers.idea} onChange={(event) => update("idea", event.target.value)} placeholder="e.g. textile manufacturing in Pune" autoFocus aria-label="Search for your industry" /><b>AI</b></div><div className="search-hints"><span>Try:</span>{["Food processing", "Textile manufacturing", "IT services"].map((example) => <button type="button" key={example} onClick={() => update("idea", example)}>{example}</button>)}</div><label>What will you offer?</label><div className="option-grid">{[["product", "A product"], ["service", "A service"], ["both", "Both"]].map(([value, label]) => <button type="button" className={answers.activity === value ? "selected" : ""} key={value} onClick={() => update("activity", value as GovAssistAnswers["activity"])}>{label}<span>{answers.activity === value ? "✓" : "○"}</span></button>)}</div></div>}
        {step === 1 && <div className="gov-question"><p className="eyebrow">STEP 02 · LOCATION</p><h2>Where will you operate?</h2><p className="gov-help">Local permissions and state incentives can change by jurisdiction.</p><label>State or Union Territory<select value={answers.state} onChange={(event) => update("state", event.target.value)}><option>Maharashtra</option><option>Odisha</option><option>Karnataka</option><option>Gujarat</option><option>Delhi</option><option>Other</option></select></label><label>District<input value={answers.district} onChange={(event) => update("district", event.target.value)} placeholder="e.g. Pune" /></label><label>City / municipality<input value={answers.city} onChange={(event) => update("city", event.target.value)} placeholder="e.g. Pimpri-Chinchwad" /></label><label>Premises status<select value={answers.premises} onChange={(event) => update("premises", event.target.value as GovAssistAnswers["premises"])}><option value="">Choose one</option><option value="owned">Owned</option><option value="rented">Rented</option><option value="leased">Leased</option><option value="shared">Shared</option><option value="virtual">Virtual</option></select></label></div>}
        {step === 2 && <div className="gov-question"><p className="eyebrow">STEP 03 · BUSINESS STAGE</p><h2>Where are you in the journey?</h2><p className="gov-help">This helps separate registrations from renewals and expansion approvals.</p><div className="stack-options">{[["idea", "Idea only"], ["planning", "Planning / pre-registration"], ["registered", "Newly registered"], ["operating", "Already operating"], ["expanding", "Expanding an existing business"]].map(([value, label]) => <button type="button" className={answers.stage === value ? "selected" : ""} key={value} onClick={() => update("stage", value)}><span>{label}</span><b>{answers.stage === value ? "✓" : "→"}</b></button>)}</div><label>Legal structure<select value={answers.structure} onChange={(event) => update("structure", event.target.value)}><option value="">Choose one</option><option>Sole proprietorship</option><option>Partnership</option><option>LLP</option><option>One Person Company</option><option>Private Limited Company</option><option>Not decided yet</option></select></label></div>}
        {step === 3 && <div className="gov-question"><p className="eyebrow">STEP 04 · BUSINESS SCALE</p><h2>Help us size the checklist.</h2><p className="gov-help">Use estimates if you are still planning. Monetary fields are in INR.</p><div className="two-fields"><label>Initial investment<input inputMode="numeric" value={answers.investment} onChange={(event) => update("investment", event.target.value)} placeholder="₹ 40,00,000" /></label><label>Expected annual turnover<input inputMode="numeric" value={answers.turnover} onChange={(event) => update("turnover", event.target.value)} placeholder="₹ 80,00,000" /></label></div><label>Expected employees<input inputMode="numeric" value={answers.employees} onChange={(event) => update("employees", event.target.value)} placeholder="e.g. 12" /></label><button type="button" className={`toggle-option ${answers.machinery ? "selected" : ""}`} onClick={() => update("machinery", !answers.machinery)}><span>Will you use machinery or factory equipment?</span><b>{answers.machinery ? "YES" : "NO"}</b></button></div>}
        <div className="gov-form-actions">{step > 0 && <button type="button" className="back-button" onClick={() => saveProgress(answers, step - 1)}>← Back</button>}<button type="button" className="gov-next" onClick={next}>{step === fields.length - 1 ? "Build my plan" : "Continue"}<span>→</span></button></div>
      </div>
    </section>
    <footer className="gov-footer">Information is checked against official sources where available. Rules and scheme criteria can change.</footer>
  </main>;
}

function GovAssistPlan({ answers, onRestart, onNotice }: { answers: GovAssistAnswers; onRestart: () => void; onNotice: (message: string) => void }) {
  const foodBusiness = /food|snack|restaurant|cafe|café|beverage|bakery/i.test(answers.idea);
  const manufacturing = /manufactur|factory|production|process/i.test(answers.idea) || answers.machinery;
  const importExport = /export|import|trade/i.test(answers.idea);
  const employeeCount = Number(answers.employees.replace(/[^0-9]/g, "")) || 0;
  const items = [
    { title: "Business structure and tax identity", status: answers.structure === "Not decided yet" ? "Needs verification" : "Likely required", reason: `Your ${answers.stage || "planned"} business needs a structure-specific registration review, plus PAN/TAN/GST checks where applicable.`, authority: "MCA / Income Tax / GST authorities", source: "https://www.india.gov.in/", tone: "teal" },
    { title: `${answers.state} industrial incentive scheme`, status: "Scheme match", reason: `Your ${answers.idea} profile will be screened against state investment subsidies, MSME support, and sector incentives available in ${answers.state}.`, authority: `${answers.state} Industries Department`, source: "https://www.india.gov.in/", tone: "gold" },
    { title: "Core application document pack", status: "Prepare these documents", reason: "Keep identity proof, PAN, constitution documents, address or lease proof, project report, investment estimate, and bank details ready for scheme and approval applications.", authority: "Common application requirements", source: "https://www.india.gov.in/", tone: "blue" },
    ...(foodBusiness ? [{ title: "Food safety registration or licence", status: "Likely required", reason: "Your description suggests that the business will handle or manufacture food. Current FSSAI/FoSCoS rules must determine the exact category.", authority: "FSSAI / competent food safety authority", source: "https://foscos.fssai.gov.in/", tone: "gold" }] : []),
    ...(manufacturing ? [{ title: "Pollution and factory approval review", status: "Needs verification", reason: "Manufacturing, machinery, emissions, effluent, and worker details determine whether consent and factory/labour approvals are triggered.", authority: `${answers.state} Pollution Control Board / labour authority`, source: "https://cpcb.nic.in/", tone: "coral" }] : []),
    ...(importExport ? [{ title: "Importer Exporter Code review", status: "Likely required", reason: "Import or export activity generally requires a current DGFT eligibility and product-specific review.", authority: "Directorate General of Foreign Trade", source: "https://www.dgft.gov.in/", tone: "blue" }] : []),
    { title: "Local premises and fire-safety review", status: answers.city ? "Conditional" : "Needs verification", reason: "Local body, premises use, occupancy, public access, and activity risk determine the applicable permissions.", authority: `${answers.city || "District/local authority"} / Fire Services`, source: "https://www.india.gov.in/", tone: "violet" },
  ];
  const missing = [!answers.city ? "city or local body" : "", !answers.premises ? "premises status" : "", !answers.turnover ? "expected turnover" : "", !answers.employees ? "employee count" : "", employeeCount > 0 && employeeCount < 10 ? "exact labour coverage facts" : ""].filter((value): value is string => Boolean(value));
  return <main className="plan-shell"><header className="plan-header"><div className="access-brand"><span className="brand-mark">GA</span><span>GOVASSIST</span></div><div className="plan-header-actions"><span className="source-badge">● SOURCES REQUIRED</span><button onClick={onRestart}>Start over</button></div></header><div className="plan-inner"><div className="plan-title"><div><p className="eyebrow">YOUR BUSINESS COMPLIANCE & SCHEME PLAN</p><h1>A clearer next step for <em>{answers.idea}</em></h1><p>Screening results for {answers.district || "your district"}, {answers.state}. Verify every item against the linked official source before applying.</p></div><button className="outline-action" onClick={() => onNotice("Your plan is ready to refine with more answers.")}>Refine answers ↗</button></div><div className="profile-strip"><div><span>BUSINESS</span><strong>{answers.idea}</strong></div><div><span>LOCATION</span><strong>{answers.district ? `${answers.district}, ` : ""}{answers.state}</strong></div><div><span>STAGE</span><strong>{answers.stage || "Not provided"}</strong></div><div><span>STRUCTURE</span><strong>{answers.structure || "Not provided"}</strong></div></div><div className="plan-grid"><section><div className="plan-section-heading"><div><p className="eyebrow">COMPLIANCE SNAPSHOT</p><h2>{items.length} areas to review</h2></div><span className="verification-label">Verification required</span></div><div className="compliance-cards">{items.map((item) => <article className="compliance-card" key={item.title}><div className={`card-status ${item.tone}`} /><div className="card-content"><div className="card-topline"><span className="status-text">{item.status}</span><span className="jurisdiction">{item.authority}</span></div><h3>{item.title}</h3><p>{item.reason}</p><a href={item.source} target="_blank" rel="noreferrer">Open official source ↗</a><small>Last verified: not yet verified in this prototype</small></div></article>)}</div></section><aside className="plan-aside"><p className="eyebrow">I CAN NARROW THIS DOWN</p><h2>{missing.length ? `${missing.length} more answers would help` : "Your core profile is ready"}</h2>{missing.length > 0 && <ul>{missing.map((item) => <li key={item}>{item}</li>)}</ul>}<button className="assistant-button" onClick={() => onNotice("The assistant will use your saved profile in the next implementation step.")}>Ask the assistant <span>→</span></button><div className="plan-disclaimer">This is decision support, not legal, financial, or government approval. Rules and benefits can change.</div></aside></div><section className="action-plan"><div><p className="eyebrow">RECOMMENDED WORKFLOW</p><h2>Action plan</h2></div><div className="action-steps">{["Decide legal structure", "Complete entity registration", "Secure premises documents", "Review local and sector approvals", "Apply for source-verified schemes"].map((step, index) => <div key={step}><span>0{index + 1}</span><strong>{step}</strong><b>→</b></div>)}</div></section></div></main>;
}

function AccessScreen({ onOpen, onGuest }: { onOpen: (workspace: SavedWorkspace) => void; onGuest: () => void }) {
  const [mode, setMode] = useState<"register" | "signin">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@gmail.com")) return setError("Use a valid Gmail address.");
    if (password.length < 8) return setError("Create a workspace password with at least 8 characters.");
    const stored = JSON.parse(window.localStorage.getItem(WORKSPACE_STORAGE_KEY) || "{}");
    const passwordHash = await hashCredential(password);
    const existing = stored[normalizedEmail] as SavedWorkspace | undefined;
    if (mode === "signin") {
      if (!existing || existing.passwordHash !== passwordHash) return setError("That email or password does not match a registered workspace.");
      onOpen(existing);
      return;
    }
    if (existing) return setError("An account already exists for this email. Switch to Sign in.");
    const newWorkspace: SavedWorkspace = { email: normalizedEmail, passwordHash, answers: emptyAnswers, step: 0, showPlan: false };
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({ ...stored, [normalizedEmail]: newWorkspace }));
    onOpen(newWorkspace);
  }

  return <main className="access-shell">
    <div className="access-brand"><span className="brand-mark">IL</span><span>INDUSTRIALEASE</span></div>
    <section className="access-layout">
      <div className="access-intro">
        <p className="access-kicker"><span /> MAHARASHTRA INDUSTRIAL APPROVALS</p>
        <h1>Make the next approval<br /><em>easier to reach.</em></h1>
        <p className="access-description">One calm, auditable workspace for applications, documents, compliance checks, and support schemes.</p>
        <div className="access-proof"><span className="proof-mark">+</span><div><strong>Built for confident decisions</strong><small>Your progress, documents, and next steps stay together.</small></div></div>
      </div>
      <div className="access-card">
        <p className="eyebrow">WELCOME TO INDUSTRIALEASE</p>
        <div className="access-tabs" role="tablist"><button type="button" className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>New account</button><button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); }}>Sign in</button></div>
        <h2>{mode === "register" ? "Sign in with Google." : "Welcome back."}</h2>
        <p className="access-card-copy">{mode === "register" ? "Use your Google account to create a private workspace. Your Google password stays with Google." : "Pick up your saved application journey from this browser."}</p>
        <a className="google-oauth-button" href="/api/auth/login/google"><img className="google-logo" src="/google-g.svg" alt="Google" /> Continue with Google <b>→</b></a>
        <div className="access-divider"><span>or use a workspace password</span></div>
        <form onSubmit={submit}>
          <label htmlFor="gmail-address">Gmail address</label>
          <input id="gmail-address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@gmail.com" autoComplete="email" />
          <label htmlFor="workspace-password">Workspace password</label>
          <input id="workspace-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={mode === "register" ? "new-password" : "current-password"} />
          {error && <p className="access-error" role="alert">{error}</p>}
          <button className="access-primary" type="submit"><img className="google-logo" src="/google-g.svg" alt="Google" /> {mode === "register" ? "Create account" : "Sign in"}<b>→</b></button>
        </form>
        <div className="access-divider"><span>or explore</span></div>
        <button className="access-guest" type="button" onClick={onGuest}>Continue as guest <span>→</span></button>
        <p className="access-footnote">Google handles your Gmail login securely. The optional workspace password is separate and never replaces Google authentication.</p>
      </div>
    </section>
    <footer className="access-footer"><span>INDUSTRIALEASE / 2026</span><span>Protected workspace · Maharashtra, India</span></footer>
  </main>;
}

