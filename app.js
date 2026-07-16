const PARTS = ['clinical', 'architecture', 'mechanism', 'verification', 'industrial', 'service'];

const scenarios = {
  baseline: {
    title: 'Illustrative platform baseline',
    active: ['architecture', 'verification'], risk: [],
    values: { patient: 48, workflow: 36, uncertainty: 38, reversibility: 76 },
    authority: 'Confirm architecture boundaries and named decision owners.',
    evidence: 'Traceable verification, build readiness, and service recovery evidence.',
    cost: 'Late rework, field recurrence, and unclear accountability.',
    move: 'Make the accumulated tradeoff visible, convene the right owners, and turn the decision into a reusable architecture rule.'
  },
  mechanism: {
    title: 'Next-generation mechanism',
    active: ['clinical', 'mechanism'], risk: ['verification', 'industrial'],
    values: { patient: 72, workflow: 44, uncertainty: 82, reversibility: 52 },
    authority: 'Separate the clinical advantage from the mechanism novelty and define the architecture boundary.',
    evidence: 'Representative-use testing, failure modes, tolerance sensitivity, build repeatability, and service access.',
    cost: 'A locally elegant mechanism can export risk into verification, manufacturing, installation, and recovery.',
    move: 'Force novelty to carry its complete downstream evidence—not only its bench performance.'
  },
  supply: {
    title: 'Critical component substitution',
    active: ['architecture', 'industrial'], risk: ['mechanism', 'verification'],
    values: { patient: 58, workflow: 52, uncertainty: 67, reversibility: 61 },
    authority: 'Determine whether the substitution is equivalent, redesign, or temporary deviation.',
    evidence: 'Interface compatibility, performance margin, verification delta, supplier controls, and field identification.',
    cost: 'An “equivalent” part can silently consume tolerance margin and create mixed-field configurations.',
    move: 'Treat supply change as an architecture decision with configuration and service consequences.'
  },
  software: {
    title: 'Software release across devices',
    active: ['architecture', 'mechanism', 'verification'], risk: ['service'],
    values: { patient: 66, workflow: 63, uncertainty: 57, reversibility: 79 },
    authority: 'Clarify supported configurations, rollback authority, and device-cloud interface ownership.',
    evidence: 'Compatibility matrix, regression results, observability, rollback proof, and service playbook.',
    cost: 'A cloud or software improvement can create device variability that is difficult to diagnose in the field.',
    move: 'Make software-device coupling visible before deployment and preserve a credible recovery path.'
  },
  field: {
    title: 'Recurring field reliability signal',
    active: ['service', 'verification'], risk: ['architecture', 'mechanism'],
    values: { patient: 91, workflow: 76, uncertainty: 71, reversibility: 42 },
    authority: 'Decide whether the recurrence is service variation, product defect, interface weakness, or architecture debt.',
    evidence: 'Normalized field data, reproducible condition, containment, root cause, and recurrence test.',
    cost: 'Repeated fixes without architecture learning consume service capacity and let recurrence compound.',
    move: 'Close the loop from field symptom to reusable design rule, verification case, and owned corrective action.'
  }
};

const sliders = Object.fromEntries(
  [...document.querySelectorAll('.tolerance-slider input[type="range"]')].map((input) => [input.name, input])
);
const outputs = Object.fromEntries(
  Object.keys(sliders).map((key) => [key, document.querySelector(`#value-${key}`)])
);
let currentScenario = 'baseline';

function decisionFrom(values) {
  const consequence = (values.patient * 0.44) + (values.workflow * 0.20) + (values.uncertainty * 0.36);
  const recoveryMargin = values.reversibility;
  const gap = consequence - (recoveryMargin * 0.42);
  const dominant = [
    ['patient / medication consequence', values.patient],
    ['workflow disruption', values.workflow],
    ['technical uncertainty', values.uncertainty],
    ['limited reversibility', 100 - values.reversibility]
  ].sort((a, b) => b[1] - a[1])[0][0];

  if (values.patient >= 86 || gap >= 58) {
    return {
      label: 'Hold and contain',
      status: 'Hold — consequence exceeds the recovery margin',
      posture: 'Contain the exposure, name the safety and technical authorities, and require causal evidence before expanding release scope.',
      summary: `The dominant driver is ${dominant}. The decision needs containment, explicit authority, and a higher evidence threshold before scale.`
    };
  }
  if (values.uncertainty >= 70 || gap >= 38) {
    return {
      label: 'Prototype and prove',
      status: 'Bound the scope — uncertainty is still carrying the decision',
      posture: 'Use a reversible, representative proof with clear stop conditions and a defined route back to architecture review.',
      summary: `The dominant driver is ${dominant}. Preserve reversibility while converting uncertainty into testable evidence.`
    };
  }
  if (gap >= 20 || values.workflow >= 60) {
    return {
      label: 'Controlled release',
      status: 'Proceed only within a monitored evidence envelope',
      posture: 'Limit configuration and deployment scope, instrument the field response, and define rollback and escalation ownership.',
      summary: `The dominant driver is ${dominant}. A controlled release is credible only with observability, recovery, and named decision ownership.`
    };
  }
  return {
    label: 'Bounded proceed',
    status: 'Proceed with bounded evidence',
    posture: 'Proceed within an explicit evidence envelope and keep the field-learning path open.',
    summary: `The dominant driver is ${dominant}, but the illustrative recovery margin remains sufficient for a bounded, observable decision.`
  };
}

function readValues() {
  return Object.fromEntries(Object.entries(sliders).map(([key, input]) => [key, Number(input.value)]));
}

function updateDecisionModel() {
  const values = readValues();
  Object.entries(values).forEach(([key, value]) => {
    const input = sliders[key];
    input.style.setProperty('--pct', `${value}%`);
    input.setAttribute('aria-valuetext', `${value} out of 100`);
    if (outputs[key]) outputs[key].value = String(value);
  });

  const decision = decisionFrom(values);
  const status = document.querySelector('#scenario-status');
  const posture = document.querySelector('#posture');
  const summary = document.querySelector('#decision-summary');
  const badge = document.querySelector('#decision-badge');
  if (status) status.textContent = decision.status;
  if (posture) posture.textContent = decision.posture;
  if (summary) summary.textContent = decision.summary;
  if (badge) badge.textContent = decision.label;

  document.body.dataset.decision = decision.label.toLowerCase().replaceAll(' ', '-');
  const heroState = document.querySelector('.readout-state');
  if (heroState) heroState.textContent = decision.status;
}

function replayHeroAssembly() {
  const stack = document.querySelector('#hero-stack');
  if (!stack || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  stack.classList.remove('is-replaying');
  void stack.offsetWidth;
  stack.classList.add('is-replaying');
  window.setTimeout(() => stack.classList.remove('is-replaying'), 1700);
}

function applyScenario(key) {
  const scenario = scenarios[key];
  if (!scenario) return;
  currentScenario = key;

  document.querySelectorAll('.scenario-button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.scenario === key));
  });

  document.querySelectorAll('.chain-item').forEach((item) => {
    const isActive = scenario.active.includes(item.dataset.part);
    const isRisk = scenario.risk.includes(item.dataset.part);
    item.classList.toggle('active', isActive);
    item.classList.toggle('risk', isRisk);
    const label = item.querySelector('.chain-state');
    if (label) label.textContent = isRisk ? 'Open tolerance' : (isActive ? 'Decision focus' : 'Nominal');
  });

  document.querySelectorAll('.module').forEach((module, index) => {
    const part = PARTS[index];
    module.classList.toggle('active', scenario.active.includes(part));
    module.classList.toggle('risk', scenario.risk.includes(part));
  });

  Object.entries(scenario.values).forEach(([keyName, value]) => {
    if (sliders[keyName]) sliders[keyName].value = String(value);
  });

  const title = document.querySelector('#scenario-title');
  if (title) title.textContent = scenario.title;
  const fields = {
    authority: scenario.authority,
    evidence: scenario.evidence,
    cost: scenario.cost,
    move: scenario.move
  };
  Object.entries(fields).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  });

  updateDecisionModel();
  replayHeroAssembly();
}

document.querySelectorAll('.scenario-button').forEach((button) => {
  button.addEventListener('click', () => applyScenario(button.dataset.scenario));
});
document.querySelector('#reset-scenario')?.addEventListener('click', () => applyScenario('baseline'));
Object.values(sliders).forEach((input) => input.addEventListener('input', updateDecisionModel));

applyScenario(currentScenario);
