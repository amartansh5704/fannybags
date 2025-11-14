export async function loadVantaBirds() {
  const THREE = await import("three");
  window.THREE = THREE; // Vanta needs THREE globally

  const VANTA = (await import("vanta/dist/vanta.birds.min.js")).default;
  return VANTA;
}
