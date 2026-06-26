// VECTOR Scoring Engine Unit Tests
// Run: node test/scoring.test.js

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  const ok = Math.abs(actual - expected) < 0.01;
  if (ok) {
    console.log(`  PASS: ${description}`);
    passed++;
  } else {
    console.error(`  FAIL: ${description} — expected ${expected}, got ${actual}`);
    failed++;
  }
}
function assertEq(description, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    console.log(`  PASS: ${description}`);
    passed++;
  } else {
    console.error(`  FAIL: ${description} — expected "${expected}", got "${actual}"`);
    failed++;
  }
}

// ─── Scoring Engine (copied from VECTOR.html) ───────────────────────────────

function calculateValueScore(scores, criteria) {
  const activeCrit = criteria.filter(c => c.active);
  let numerator = 0, denominator = 0;
  for (const c of activeCrit) {
    const s = scores[c.id];
    if (s != null) { numerator += s * c.weight; denominator += c.weight; }
  }
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 20 * 10) / 10;
}

function calculateWSJF(valueScore, effort) {
  if (!effort || effort <= 0) return 0;
  return Math.round((valueScore / effort) * 10) / 10;
}

function getTrend(project) {
  if (!project.rounds || project.rounds.length === 0) return '—';
  if (project.rounds.length < 2) return '—';
  const latest = project.rounds[project.rounds.length - 1];
  const prev = project.rounds[project.rounds.length - 2];
  const diff = latest.wsjfScore - prev.wsjfScore;
  if (diff > 1) return '↑';
  if (diff < -1) return '↓';
  return '→';
}

// ─── Test Data ───────────────────────────────────────────────────────────────

const DEFAULT_CRITERIA = [
  { id: 'crit-strategic', name: 'Strategische Passung', weight: 30, active: true },
  { id: 'crit-market',    name: 'Marktpotenzial',       weight: 30, active: true },
  { id: 'crit-customer',  name: 'Kundennutzen',          weight: 25, active: true },
  { id: 'crit-urgency',   name: 'Dringlichkeit',         weight: 15, active: true }
];

// ─── calculateValueScore Tests ───────────────────────────────────────────────

console.log('\n=== calculateValueScore ===');

// All scores = 5 → max = 100
assert('All scores 5 → 100',
  calculateValueScore(
    { 'crit-strategic': 5, 'crit-market': 5, 'crit-customer': 5, 'crit-urgency': 5 },
    DEFAULT_CRITERIA
  ),
  100
);

// All scores = 1 → min = 20
assert('All scores 1 → 20',
  calculateValueScore(
    { 'crit-strategic': 1, 'crit-market': 1, 'crit-customer': 1, 'crit-urgency': 1 },
    DEFAULT_CRITERIA
  ),
  20
);

// All scores = 3 → mid = 60
assert('All scores 3 → 60',
  calculateValueScore(
    { 'crit-strategic': 3, 'crit-market': 3, 'crit-customer': 3, 'crit-urgency': 3 },
    DEFAULT_CRITERIA
  ),
  60
);

// All scores = 4 → 80
assert('All scores 4 → 80',
  calculateValueScore(
    { 'crit-strategic': 4, 'crit-market': 4, 'crit-customer': 4, 'crit-urgency': 4 },
    DEFAULT_CRITERIA
  ),
  80
);

// Mixed: [4,3,5,2] with weights [30,30,25,15]
// Numerator = 4×30 + 3×30 + 5×25 + 2×15 = 120+90+125+30 = 365
// Denominator = 100
// Score = 365/100 × 20 = 73.0
assert('Mixed scores [4,3,5,2] → 73',
  calculateValueScore(
    { 'crit-strategic': 4, 'crit-market': 3, 'crit-customer': 5, 'crit-urgency': 2 },
    DEFAULT_CRITERIA
  ),
  73
);

// Empty scores → 0
assert('Empty scores → 0',
  calculateValueScore({}, DEFAULT_CRITERIA),
  0
);

// One inactive criterion: only 3 criteria count
const criteriaWithInactive = [
  { id: 'crit-strategic', weight: 30, active: true },
  { id: 'crit-market',    weight: 30, active: false },  // inactive
  { id: 'crit-customer',  weight: 25, active: true },
  { id: 'crit-urgency',   weight: 15, active: true }
];
// Active weights: 30+25+15 = 70
// All scores = 5: 5×70/70×20 = 100
assert('Inactive criterion ignored → 100 when remaining all=5',
  calculateValueScore(
    { 'crit-strategic': 5, 'crit-market': 5, 'crit-customer': 5, 'crit-urgency': 5 },
    criteriaWithInactive
  ),
  100
);

// ─── calculateWSJF Tests ─────────────────────────────────────────────────────

console.log('\n=== calculateWSJF ===');

assert('80 / 2 = 40', calculateWSJF(80, 2), 40);
assert('90 / 5 = 18', calculateWSJF(90, 5), 18);
assert('73 / 2 = 36.5', calculateWSJF(73, 2), 36.5);
assert('60 / 3 = 20', calculateWSJF(60, 3), 20);
assert('100 / 1 = 100', calculateWSJF(100, 1), 100);
assert('20 / 5 = 4', calculateWSJF(20, 5), 4);
assert('0 / 1 = 0', calculateWSJF(0, 1), 0);
assert('Effort 0 → 0', calculateWSJF(80, 0), 0);
assert('Effort null → 0', calculateWSJF(80, null), 0);

// WSJF ranking: lower effort wins even with slightly lower value
const highValue = calculateWSJF(90, 5);   // 18
const fastProject = calculateWSJF(80, 2); // 40
assert('Fast project (80/2=40) beats high-value slow project (90/5=18)',
  fastProject > highValue ? fastProject : -1,
  fastProject
);

// ─── getTrend Tests ──────────────────────────────────────────────────────────

console.log('\n=== getTrend ===');

assertEq('No rounds → —', getTrend({ rounds: [] }), '—');
assertEq('One round → —', getTrend({ rounds: [{ wsjfScore: 40 }] }), '—');
assertEq('Stable (diff < 1) → →', getTrend({ rounds: [{ wsjfScore: 40 }, { wsjfScore: 40.5 }] }), '→');
assertEq('Up (diff > 1) → ↑', getTrend({ rounds: [{ wsjfScore: 30 }, { wsjfScore: 40 }] }), '↑');
assertEq('Down (diff < -1) → ↓', getTrend({ rounds: [{ wsjfScore: 40 }, { wsjfScore: 30 }] }), '↓');
assertEq('Exactly +1 (border) → →', getTrend({ rounds: [{ wsjfScore: 40 }, { wsjfScore: 41 }] }), '→');
assertEq('Exactly -1 (border) → →', getTrend({ rounds: [{ wsjfScore: 40 }, { wsjfScore: 39 }] }), '→');
assertEq('Three rounds uses last two', getTrend({
  rounds: [{ wsjfScore: 20 }, { wsjfScore: 30 }, { wsjfScore: 40 }]
}), '↑');

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('SOME TESTS FAILED');
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED ✓');
}
