export function softSpring(position: number, velocity: number, target: number, dt: number, speed = 1) {
  const decay = 10.5 * speed;
  const frequency = Math.sqrt(135 - 10.5 * 10.5) * speed;
  const x = position - target;
  const b = (velocity + decay * x) / frequency;
  const envelope = Math.exp(-decay * dt);
  const cosine = Math.cos(frequency * dt), sine = Math.sin(frequency * dt);
  return {
    position: target + envelope * (x * cosine + b * sine),
    velocity: envelope * (velocity * cosine - (decay * b + x * frequency) * sine),
  };
}
