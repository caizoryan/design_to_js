// sorry i just like arrow functions and snake case

import { $, button, div, eff, render, sig, monke_slider as slider, p } from "./solid_monke/solid_monke.js"
import * as THREE from "three";

// variables
let scene, renderer, camera, grid, light, ambient;



const width = window.innerWidth;
const height = window.innerHeight;

/*
 * The sig function (short for signal) is a reactive variable
 * - To get the value of a sig, call sig.is()
 * - To set the value of a sig, call sig.set(new_value)
 *
 * ps: when using it in the div function, we dont call the function, 
 * just pass the reference, I'll add a comment downstairs to make it clear
 *
 * I'm using it for all the places where we need to update the value of a variable
 * in the ui, its just easier... 
 *
 */
const aspect = sig(width / height);
const zoom = sig(1094);
const max_amt = 300;
const size_max = 200
const size_min = 50

// const x = sig(-10) const y = sig(-10)

const x = sig(1500)
const y = sig(900)
const z = sig(3000)

const ambient_intensity = sig(1)


// ----------------
// helpers or utils
// ----------------

/** will take an object and add it to the scene */
const put = obj => scene.add(obj);

/** will take a number and return an array of that length filled with 0s
 * @returns {array} The array of 0s. */
const list = num => new Array(num).fill(0);

/** will take a min and max and return a random number between them
 * @returns {number} The random number between min and max. */
const random = (min, max) => Math.random() * (max - min) + min;

/** will take a position and return a new position with a random offset, default is -400 and 400
 * @returns {array} The new position with the offset. */
const offset_position = (x, y, z = 0, [min, max] = [-400, 400]) => [x + random(min, max), y + random(min, max), z + random(min, max)];

/** will take an id and remove the object with that id from the scene */
const remove_from_scene = id => scene.remove(scene.getObjectById(id))

/** will take an id and remove the object with that id from the grid */
const remove_from_grid = id => grid.grid = grid.grid.filter(b => b.three.id !== id)

/** will take an id and remove the object with that id from the scene and the grid */
const dispose = id => {
  remove_from_grid(id)
  remove_from_scene(id)
}

// ----------------
// Constructors of various things
// ----------------
//
//

/** will take a number and return a grid of that size, fills it with box_manager objects, inside a flattened grid
 * @returns {object} The grid object. */
const make_grid = (rows, cols) => {
  let grid = {};
  grid.grid = list(rows).map((_, r) => list(cols).map((_, c) => box_manager(...make_grid_position(r, c)))).flat();
  grid.full = () => grid.grid.length >= max_amt
  return grid
};

/** 
 * This is where we can add interesting things, right now it just has a lifetime
 * - We can make it change color based on lifetime
 * - Make it animate rotation, size, etc
 * -> stuff like that
 * */
const box_manager = (x, y, z) => {
  return {
    x, y, z,
    three: make_box_at(x, y, z),
    lifetime: Math.random() * 1000,

    // this is the tick function, it will run every frame
    // see it being called in the animate function
    tick: function() {

      // reduce lifetime
      this.lifetime -= 1;

      // this.three.material.color.setRGB(this.lifetime / 1000, this.lifetime / 1000, this.lifetime / 1000)

      // if roll of die is greater than 0.99 and the grid is not full, add a new box
      if (Math.random() > 0.99 && !grid.full()) {
        const b = box_manager(...offset_position(this.x, this.y))

        // need to add to the scene and the grid array
        put(b.three)
        grid.grid.push(b)
      }

      // if lifetime is less than 0, dispose of the object
      this.lifetime < 0 ? dispose(this.three.id) : null
    }
  };
};

/** will take a row and col and return a position for that box by multiplying by 200
 * @returns {array} The position of the box.
 **/
const make_grid_position = (row, col) => {
  let x = row * 200
  let y = col * 200

  return [x, y, 0]
}


/** will take a position and return a box at that position
 * @returns {object} The box object. */
const make_box_at = (x, y, z) => {
  let s = random(size_min, size_max)
  // const geometry = random(0, 1) > .5 ? new THREE.BoxGeometry(s, s, s) : new THREE.SphereGeometry(s /4, 32, 32);
  const geometry = new THREE.SphereGeometry(s / 1.7, 32, 32);
  // const geometry = new THREE.BoxGeometry(s, s, s)

  const mat = new THREE.MeshStandardMaterial(
    {
      color: 0xdddddd,
      shininess: 200,
    });
  const mesh = new THREE.Mesh(geometry, mat);

  mesh.receiveShadow = true;
  mesh.position.set(x, y, z);

  return mesh
};

const init_camera = () => {
  camera = new THREE.OrthographicCamera(
    (zoom.is() * aspect.is()) / -2,
    (zoom.is() * aspect.is()) / 2,
    zoom.is() / 2,
    zoom.is() / -2,
    1,
    10000,
  );
};

const init = () => {
  scene = new THREE.Scene();

  // setup renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true
    // , alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // lights
  light = new THREE.DirectionalLight(0xffffff, 5);
  light.position.set(900, 5000, 1000);

  put(light);

  ambient = new THREE.AmbientLight(0xffffff, 3);
  put(ambient);



  // camera
  init_camera();

  // action
  $("#three").appendChild(renderer.domElement);
  renderer.domElement.style.mixBlendMode = "multiply";
  put(make_box_at(0, 0, 0));

  grid = make_grid(10, 10)
  grid.grid.forEach(b => put(b.three))

};
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  grid.grid.forEach(b => b.tick())
};


init();
animate();

// ----------------
// UI stuff
// ----------------
// if you see here, the val is a sig(nal) but we dont call it, we just pass it in as val.is,
// this is a solid.js thing, if its a reference to a function it creates a dependency so whenever 
// the value changes, it will change it in the dom, hence we dont call it and pass the reference
//
// for the slider, we pass the val and not val.is because it also needs to use val.set to set the variable
// so we pass the top level object so it can access both.
const slide = (val, name, [min, max] = [-5000, 5000]) => {
  return div({ class: "slide" }, p(name, val.is), slider(val, [min, max], { step: 0.1 }))
}

const UI = () => {
  return div(
    { class: "ui" },
    slide(x, "x: "),
    slide(y, "y: "),
    slide(z, "z: ", [3000, 5000]),

    slide(zoom, "zoom: ", [100, 5000]),
    slide(ambient_intensity, "ambient: ", [0, 10],),
  )
}

render(UI, $("#ui"))

// ----------------
// Effects
// ----------------
// these are just reactive effects, so whenever the value of the sig changes, it will run the function
// so we can update the camera values whenever the zoom or aspect changes
eff(() => {
  camera.left = (zoom.is() * aspect.is()) / -2
  camera.right = (zoom.is() * aspect.is()) / 2
  camera.top = zoom.is() / 2
  camera.bottom = zoom.is() / -2
  camera.updateProjectionMatrix()

  ambient.intensity = ambient_intensity.is()
})


// same here with position stuff, in theory we could just combine them 
// into one eff(ect) but this will probably 
// help with performance stuff, but that too is negligible
eff(() => {
  camera.position.x = x.is();
  camera.position.y = y.is();
  camera.position.z = z.is();
  camera.lookAt(new THREE.Vector3(0, 0, 0));
})
