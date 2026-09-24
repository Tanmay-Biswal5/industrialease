import Link from "next/link";

export default function ApplicationsPage() {
  return <WorkspacePage eyebrow="APPLICATIONS" title="Your approval applications" description="Track every submission from one auditable workspace." cards={["Textile Manufacturing Unit", "Factory license · In review", "Building plan approval · Action needed"]} />;
}

function WorkspacePage({ eyebrow, title, description, cards }: { eyebrow: string; title: string; description: string; cards: string[] }) {
  return <main className="workspace-page"><Link href="/" className="back-link">← Back to overview</Link><section className="workspace-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></section><section className="workspace-cards">{cards.map((card, index) => <article className="workspace-card" key={card}><span>0{index + 1}</span><h2>{card}</h2><button>Open details →</button></article>)}</section></main>;
}
