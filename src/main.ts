const canvas = <HTMLCanvasElement>document.getElementById("canv");
const fps = <HTMLParagraphElement>document.getElementById("fps");
const renderer = new Renderer(canvas);

renderer.Initialize();

let last_time = performance.now();

requestAnimationFrame(function tick() {
  renderer.render();
  const elapsed = performance.now() - last_time;
  last_time = performance.now();
  fps.innerText = Math.round((1 / elapsed) * 1000).toString() + " fps";
  requestAnimationFrame(tick);
});
