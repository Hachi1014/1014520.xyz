import type { Metadata } from 'next';
import ProcessCards from './process-cards';
import './process.css';

export const metadata: Metadata = {
  title: 'From thesis to evidence · AINFT',
  description: 'Five steps with interactive pixel reveals.',
};

export default function HowItWorksPage() {
  return <main className="run-page" lang="en">
    <header className="run-navigation">
      <a className="run-brand" href="https://ainft.com/" aria-label="AINFT home">
        <img src="/assets/brand-mark.svg" alt="" />
        <span>AINFT</span>
      </a>
      <nav className="run-nav" aria-label="Main navigation">
        <a href="https://ainft.com/#overview">Overview</a>
        <a href="#process" aria-current="page">How it works</a>
        <a href="https://ainft.com/#scoring">Leaderboard</a>
        <a href="https://ainft.com/#trace">Trace</a>
        <a href="/">Guardrails</a>
      </nav>
    </header>
    <section className="run-content" id="process" aria-labelledby="run-heading">
      <div className="run-heading-row">
        <h1 id="run-heading">From thesis to evidence.</h1>
        <p>One controlled sequence turns an agent idea into a result another developer can understand and review.</p>
      </div>
      <div className="run-divider" aria-hidden="true" />
      <ProcessCards />
    </section>
  </main>;
}
