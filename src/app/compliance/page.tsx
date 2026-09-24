import Link from "next/link";

export default function CompliancePage() {
  return <main className="workspace-page"><Link href="/" className="back-link">← Back to overview</Link><section className="workspace-intro"><p className="eyebrow">AI ASSISTED REVIEW</p><h1>Compliance pre-check</h1><p>Review document readiness and flags before routing to departments.</p></section><section className="workspace-cards"><article className="workspace-card"><span>01</span><h2>Run pre-check</h2><button>Start secure review →</button></article><article className="workspace-card"><span>02</span><h2>Review flagged items</h2><button>Open review queue →</button></article></section></main>;
}
