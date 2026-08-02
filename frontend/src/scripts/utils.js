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

const generateParticlesWithStar = (num) => {
  const particles = [];

  const massMin = 1;
  const massMax = 100;
  const spaceSize = 50;
  // const velocityRange = 0.00025;  /realistic value
  const velocityRange = 0.005;

  for (let i = 0; i < num-1; i++) {
    const mass = randomRange(massMin, massMax);
    const radius = Math.cbrt(mass) * 0.1;

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
  particles.push({
      mass:1000000,
      radius:2.5,

      x:0,
      y:0,
      z:0,

      vx:0,
      vy:0,
      vz:0,

      ax: 0,
      ay: 0,
      az: 0
    });

  return particles;
};

const serializeParticles = (particles, valuesPerParticle) => {
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

const deserializeParticles = async (blob, valuesPerParticle) => {
  const buffer = await blob.arrayBuffer();

  const particles = new Float32Array(
    buffer
  );

  return particles;
}

const convertToJson = (floatArray, numofParticles) => {
  const particles = []
  const valuesPerParticle = 11;

  for (let i = 0; i < numofParticles; i++) {
    const offset = i * valuesPerParticle;

    particles.push({
      mass: floatArray[offset],
      radius: floatArray[offset + 1],
      x: floatArray[offset + 2],
      y: floatArray[offset + 3],
      z: floatArray[offset + 4],
      vx: floatArray[offset + 5],
      vy: floatArray[offset + 6],
      vz: floatArray[offset + 7],
      ax: floatArray[offset + 8],
      ay: floatArray[offset + 9],
      az: floatArray[offset + 10]
    });
  }
  return particles;
}

export { generateParticles,generateParticlesWithStar, serializeParticles, deserializeParticles, convertToJson };