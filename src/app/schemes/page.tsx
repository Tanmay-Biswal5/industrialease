import Link from "next/link";

export default function SchemesPage() {
  return <main className="workspace-page"><Link href="/" className="back-link">← Back to overview</Link><section className="workspace-intro"><p className="eyebrow">SMART SUPPORT</p><h1>Schemes matched to you</h1><p>Explore support programmes matched to your business profile.</p></section><section className="workspace-cards"><article className="workspace-card"><span>98%</span><h2>Maharashtra Industrial Investment Subsidy</h2><button>Review scheme →</button></article><article className="workspace-card"><span>+</span><h2>Find more schemes</h2><button>Explore support →</button></article></section></main>;
}
