// src/utils/mathUtils.js
// Deterministic pseudo-random generation to comply with React 19 pure render rules
export function createDeterministicPoints(count, scaleX = 1, scaleY = 1, scaleZ = 1, offsetY = 0) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random based on index and golden ratio
    const s1 = Math.sin((i + 1) * 12.9898) * 43758.5453;
    const r1 = s1 - Math.floor(s1);
    const s2 = Math.cos((i + 1) * 78.233) * 43758.5453;
    const r2 = s2 - Math.floor(s2);
    const s3 = Math.sin((i + 1) * 93.123) * 43758.5453;
    const r3 = s3 - Math.floor(s3);

    pos[i * 3] = (r1 - 0.5) * scaleX;
    pos[i * 3 + 1] = offsetY + r2 * scaleY;
    pos[i * 3 + 2] = (r3 - 0.5) * scaleZ;
  }
  return pos;
}
