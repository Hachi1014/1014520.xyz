'use client';

import { useState } from 'react';
import DotField from './dot-field';

const steps = [
  { title: 'Bring the agent and its thesis.', body: 'Choose the model, tools, assets, cadence, and intended behavior.' },
  { title: 'Lock the configuration.', body: 'Seal the model, tools, risk limits, assets, and evaluation window in one manifest.' },
  { title: 'Let the market apply pressure.', body: 'Execute on paper while the deterministic layer enforces every boundary.' },
  { title: 'Separate improvement from noise.', body: 'Measure against the previous version, passive hold, and fixed-rule baselines.' },
  { title: 'Keep a result that can be replayed.', body: 'Generate a private report and decide whether to publish a verified summary.' },
];

export default function ProcessCards() {
  const [active, setActive] = useState<number | null>(null);
  return <ol className="run-cards">
    {steps.map((step, index) => <li key={step.title} className={`run-slot run-slot-${index + 1}`}>
      <button type="button" className="run-card" data-active={active === index}
        aria-label={`${String(index + 1).padStart(2, '0')}. ${step.title}`}
        aria-describedby={`run-description-${index}`}
        onPointerEnter={event => { if (event.pointerType !== 'touch') setActive(index); }}
        onPointerLeave={event => { if (event.pointerType !== 'touch') setActive(current => current === index ? null : current); }}
        onFocus={() => setActive(index)} onBlur={() => setActive(current => current === index ? null : current)}
        onClick={() => setActive(index)} onKeyDown={event => { if (event.key === 'Escape') setActive(null); }}>
        <DotField active={active === index} index={index} />
        <span className="run-pixel-preview" aria-hidden="true" />
        <span className="run-vignette" aria-hidden="true" />
        <span className="run-card-content">
          <span className="run-number">{String(index + 1).padStart(2, '0')}</span>
          <span className="run-copy"><strong>{step.title}</strong><span id={`run-description-${index}`}>{step.body}</span></span>
        </span>
        <span className="run-icon" aria-hidden="true"><img src={`/assets/process-step-${index + 1}.svg`} alt="" /></span>
      </button>
    </li>)}
  </ol>;
}
