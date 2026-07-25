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

const serializeParticles=(particles,valuesPerParticle)=>{
  const data = new Float32Array(particles.length * valuesPerParticle);

particles.forEach((particle, i) => {
  const offset = i * valuesPerParticle;

  data[offset] = particle.mass;
  data[offset + 1] = particle.radius;

  data[offset + 2] = particle.x;
  data[offset + 3] = particle.y;
  data[offset + 4] = particle.z;

  data[offset + 5] = particle.vx;
  data[offset + 6] = particle.vy;
  data[offset + 7] = particle.vz;

  data[offset + 8] = particle.ax;
  data[offset + 9] = particle.ay;
  data[offset + 10] = particle.az;
});
 return data;
}

const deserializeParticles=async (blob,valuesPerParticle)=>{
  const buffer =await blob.arrayBuffer();

  const particles = new Float32Array(
      buffer
    );

 return particles;
}

export {generateParticles,serializeParticles,deserializeParticles};