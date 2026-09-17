import assert from 'node:assert/strict';
import { softSpring } from '../app/soft-spring.ts';
import { EdgePull, edgeDirection, EDGE_PULL_LIMIT, EDGE_RELEASE_DELAY } from '../app/edge-elasticity.ts';

for (const position of [100, 280, 350, 700, 1800]) {
  assert.equal(edgeDirection(position, 2400, 120), 0);
  assert.equal(edgeDirection(position, 2400, -120), 0);
}
assert.equal(edgeDirection(0, 2400, 120), 0);
assert.equal(edgeDirection(0, 2400, -120), 1);
assert.equal(edgeDirection(2400, 2400, -120), 0);
assert.equal(edgeDirection(2400, 2400, 120), -1);
assert.equal(edgeDirection(0, 0, -120), 0);
for (const direction of [-1, 1] as const) {
  const saturated = new EdgePull();
  for (let now = 0; now < 20000; now += 8) {
    saturated.pull(1000000, direction, now);
    saturated.step(now, .008);
    assert.ok(Math.abs(saturated.position) <= EDGE_PULL_LIMIT);
    assert.ok(Math.abs(saturated.target) <= EDGE_PULL_LIMIT);
  }
  assert.ok(Math.abs(saturated.position) > EDGE_PULL_LIMIT - .1);
}

for (const direction of [-1, 1] as const) {
  const pull = new EdgePull();
  let previous = 0;
  // Repeated detents maintain the pull beyond the former 180ms snap timer.
  for (let now = 0; now < 4000; now += 10) {
    if (now % 200 === 0) pull.pull(120, direction, now);
    pull.step(now, .01);
    assert.ok(pull.heldUntil > now);
    assert.ok(Math.abs(pull.position) + .01 >= previous);
    assert.ok(Math.abs(pull.position) <= EDGE_PULL_LIMIT);
    previous = Math.abs(pull.position);
  }
  assert.ok(Math.abs(pull.position) > 60);
  for (let now = 4000; now < 6000; now += 10) pull.step(now, .01);
  assert.equal(pull.position, 0);
  assert.equal(pull.direction, 0);
  pull.pull(120, direction, 6000);
  pull.step(6016, .016);
  pull.reset();
  assert.equal(pull.position, 0);
  assert.equal(pull.heldUntil, 0);
}
// Both saturated edges should visually settle within 350ms after release.
for (const direction of [-1, 1] as const) {
  const fast = new EdgePull();
  fast.position = fast.target = direction * EDGE_PULL_LIMIT;
  fast.direction = direction;
  for (let now = 0; now < 350; now += 10) fast.step(now, .01);
  assert.ok(Math.abs(fast.position) * .34 < .1);
}
const returning = new EdgePull();
returning.pull(120, 1, 0);
for (let now = 0; now < EDGE_RELEASE_DELAY + 100; now += 10) returning.step(now, .01);
const resumedAt = returning.position;
returning.pull(120, 1, 400);
assert.equal(returning.position, resumedAt);
assert.ok(returning.target > resumedAt);
assert.equal(returning.heldUntil, 400 + EDGE_RELEASE_DELAY);
for(const destination of [0,700,2400]) {
  let low={position:350,velocity:0},high={...low};
  for(let i=0;i<120;i++)low=softSpring(low.position,low.velocity,destination,1/60);
  for(let i=0;i<240;i++)high=softSpring(high.position,high.velocity,destination,1/120);
  assert.ok(Math.abs(low.position-high.position)<1e-8);
  assert.ok(Math.abs(low.position-destination)<.001);
}
console.log('PASS: native interior scrolling, outward boundaries only, sustained pull, idle release, reversal reset, and refresh-rate independent spring.');