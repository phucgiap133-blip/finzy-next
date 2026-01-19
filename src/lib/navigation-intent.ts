let forward = false;

export function markForwardNavigation() {
  forward = true;
}

export function consumeForwardNavigation() {
  const v = forward;
  forward = false; // 🔥 reset NGAY, không để sót
  return v;
}
