import { button, div, eff, render, sig, monke_slider as slider } from "./solid_monke/solid_monke.js"
import * as THREE from "three";

const width = window.innerWidth;
const height = window.innerHeight;

const aspect = sig(width / height);
const size = sig(3000);
const max_amt = 300;

const x = sig(200)
const y = sig(-100)
const z = sig(700)
const zoom = sig(1)

let scene, renderer, camera, g;

// helpers or utils
const put = obj => scene.add(obj);
const list = num => new Array(num).fill(0);
const random = (min, max) => Math.random() * (max - min) + min;

const offset_position = (x, y, z = 0, [min, max] = [-400, 400]) => [x + random(min, max), y + random(min, max), z + random(min, max)];

const remove_from_scene = id => scene.remove(scene.getObjectById(id))

const remove_from_grid = id => g.grid = g.grid.filter(b => b.three.id !== id)

const dispose = id => {
  remove_from_grid(id)
  remove_from_scene(id)
}

const grid = (rows, cols) => {
  let grid = {};
  grid.grid = list(rows).map((_, r) => list(cols).map((_, c) => box_manager(...make_grid_position(r, c)))).flat();
  grid.full = () => g.grid.length >= max_amt
  return grid
};

const box_manager = (x, y, z) => {
  return {
    x, y, z,
    three: make_box_at(x, y, z),
    lifetime: Math.random() * 1000,
    tick: function() {
      this.lifetime -= 1;
      if (Math.random() > 0.99 && !g.full()) {
        const b = box_manager(...offset_position(this.x, this.y))
        put(b.three)
        g.grid.push(b)
      }
      this.lifetime < 0 ? dispose(this.three.id) : null
    }
  };
};


const make_grid_position = (row, col) => {
  let x = row * 200
  let y = col * 200

  return [x, y, 0]
}


const make_box_at = (x, y, z) => {
  let s = Math.random() * 100 + 50
  const geometry = new THREE.BoxGeometry(s, s, s);
  const mat = make_material(0xffffff);
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);

  return mesh
};

const make_material = color => new THREE.MeshStandardMaterial({ color });


const init_camera = () => {
  camera = new THREE.OrthographicCamera(
    (size.is() * aspect.is()) / -2,
    (size.is() * aspect.is()) / 2,
    size.is() / 2,
    size.is() / -2,
    1,
    10000,
  );
};
const init = () => {
  scene = new THREE.Scene();

  // setup renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // lights
  const directionalLight = new THREE.DirectionalLight(0xffffff, 20);
  directionalLight.position.set(0, 0, 100);
  put(directionalLight);

  const ambient = new THREE.AmbientLight(0xffffff, 1);
  put(ambient);

  // camera
  init_camera();

  // action
  document.body.appendChild(renderer.domElement);
  put(make_box_at(0, 0, 0));

  g = grid(10, 10)
  g.grid.forEach(b => put(b.three))

};
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  g.grid.forEach(b => b.tick())
};


init();
animate();

// UI stuff
const UI = () => {
  return div(
    { class: "ui" },
    div(x.is, slider(x, [-5000, 5000])),
    slider(y, [-5000, 5000]),
    slider(z, [-5000, 5000]),

    div(size.is, slider(size, [100, 5000])),
    slider(aspect, [0.1, 10]),

  )
}

render(UI, document.body)


eff(() => {
  camera.left = (size.is() * aspect.is()) / -2
  camera.right = (size.is() * aspect.is()) / 2
  camera.top = size.is() / 2
  camera.bottom = size.is() / -2
  camera.updateProjectionMatrix()
})

eff(() => {
  camera.position.x = x.is();
  camera.position.y = y.is();
  camera.position.z = z.is();
  camera.lookAt(new THREE.Vector3(0, 0, 0));
})
