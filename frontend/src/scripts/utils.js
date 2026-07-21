const randomRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

const generateParticles = (num) => {
  const particles = [];

  const massMin = 1;
  const massMax = 100;
  const spaceSize = 50;
  const velocityRange = 0.05;

  for (let i = 0; i < num; i++) {
    const mass = randomRange(massMin, massMax);
    const radius = Math.cbrt(mass) * 0.3;

    const x = randomRange(-spaceSize, spaceSize);
    const y = randomRange(-spaceSize, spaceSize);
    const z = randomRange(-spaceSize, spaceSize);

    const vx = randomRange(-velocityRange, velocityRange);
    const vy = randomRange(-velocityRange, velocityRange);
    const vz = randomRange(-velocityRange, velocityRange);

    particles.push({
      mass,
      radius,

      x,
      y,
      z,

      vx,
      vy,
      vz,

      ax: 0,
      ay: 0,
      az: 0
    });
  }

  return particles;
};

export default generateParticles;