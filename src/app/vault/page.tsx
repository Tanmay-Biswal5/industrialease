import Link from "next/link";

export default function VaultPage() {
  return <main className="workspace-page"><Link href="/" className="back-link">← Back to overview</Link><section className="workspace-intro"><p className="eyebrow">SECURE STORAGE</p><h1>Your data vault</h1><p>12 encrypted documents are ready to reuse across applications.</p></section><section className="workspace-cards"><article className="workspace-card"><span>12</span><h2>Documents secured</h2><button>Open document vault →</button></article><article className="workspace-card"><span>+</span><h2>Upload a document</h2><button>Start secure upload →</button></article></section></main>;
}
