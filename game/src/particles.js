// WOK HEI — flame, steam and sparks. Particles are drawn from the
// game's own state; the shot stager steps them forward like everything
// else, so a screenshot's fire is a real frame of the simulation.

export function spawnBurst(particles, x, y, kind, n) {
  for (let i = 0; i < n; i++) {
    particles.push({
      kind,
      x: x + (Math.random() - 0.5) * 26,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 90,
      vy: kind === 'flame' ? -60 - Math.random() * 90 : -20 - Math.random() * 40,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 1,
      size: 3 + Math.random() * 7,
    });
  }
}

export function spawnSteam(particles, x, y) {
  particles.push({
    kind: 'steam',
    x: x + (Math.random() - 0.5) * 40,
    y,
    vx: (Math.random() - 0.5) * 12,
    vy: -26 - Math.random() * 18,
    life: 0.9 + Math.random() * 0.5,
    maxLife: 1.4,
    size: 8 + Math.random() * 10,
  });
}

export function updateParticles(particles, dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.kind === 'flame') p.vy -= 40 * dt;
    if (p.kind === 'steam') p.size += 14 * dt;
  }
  if (particles.length > 400) particles.splice(0, particles.length - 400);
}

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    const a = Math.max(0, Math.min(1, p.life / p.maxLife));
    if (p.kind === 'flame') {
      ctx.globalAlpha = a;
      ctx.fillStyle = a > 0.5 ? '#ffc23d' : '#ff7a1a';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'steam') {
      ctx.globalAlpha = a * 0.35;
      ctx.fillStyle = '#fff3d6';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffd97a';
      ctx.fillRect(p.x - 1, p.y - 1, 2.5, 2.5);
    }
  }
  ctx.globalAlpha = 1;
}
