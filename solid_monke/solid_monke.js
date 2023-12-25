/* A work in progress handcrafted appropriation of Solid.js  
 *
 *  /~\
 * C oo
 *  ( ^)
 *  / ~\
 *
 *  |____
 *  A SOLID MONKE
 *  ____|
 *
 * Tools are personal, language is a tool, code is a language.
 * I like writing my code in very personal, often stupid and 
 * esoteric ways. This is something that I have been slowly developing
 * over the past few months.
 *
 * Feel free to look around, use whatever you might find is useful, 
 * 
 * This code is licesned under the GPL license.
 * You can read about it more here
 * https://www.gnu.org/licenses/quick-guide-gplv3.html
 *
 */

import h from "./h/h.js";
import {
  For,
  createSignal,
  createMemo,
  createEffect,
  on,
  Switch,
  Show,
  onMount,
} from "./solid.js";
import { render, renderToString } from "./web/web.js";
import { createStore, produce, createMutable } from "./store/store.js";


// The core, the heart and the soul

// Reactivity
/**
 * Creates a signal object with a getter and setter.
 * @param {any} val - The initial value of the signal.
 * @returns {object} - An object with `is` property representing the getter and `set` property representing the setter.
 */
const sig = (val) => {
  const [getter, setter] = createSignal(val);
  return {
    is: getter,
    set: setter,
  };
};

// Dependent Reactivity
/**
 * Creates a memoized version of the provided callback function.
 *
 * @param {Function} callback - The callback function to be memoized.
 * @returns {Function} - The memoized value returned by the callback function.
 */
const mem = callback => createMemo(callback);

/**
 * Creates an effect by wrapping a callback function.
 *
 * @param {Function} callback - The callback function to be wrapped.
 * @returns {Effect} The created effect.
 */
const eff = callback => createEffect(callback);
/**
 * Applies an effectful operation on a dependency and invokes a callback.
 *
 * @param {Function} dependency - The dependency to apply the effect based on.
 * @param {Function} callback - The callback function to invoke.
 * @returns {void}
 */
const eff_on = (dep, callback) => eff(on(dep, callback));

// Rendering Control Flow,
// Essentially the for loop —> but for rendering (keyed) 
const each = (dep, children) => For({ each: dep, children });

// The switch statement for rendering
/**
 * Creates a conditional statement with multiple branches.
 * Each branch consists of a condition and a set of child elements.
 * 
 * Can be provided as an array of arrays or an array of objects.
 * eg. [condition, child], or { if: condition, then: child }
 * 
 * @param {...(Array|Object)} etc - The branches of the conditional statement.
 * @returns {Object} - The conditional statement object.
 */
const if_then = (...etc) => {
  const kids = etc.map((item) => {
    const [when, children] = Array.isArray(item) ? item : if_then_object(item);
    return () => ({ when, children, });
  });

  return Switch({
    fallback: null,
    children: kids,
  });
};

/** Creates a conditional statement with multiple branches.
 * 
 * Can be provided as an array of arrays or an array of objects.
 * eg. (condition, [value, child]) 
 * 
 * @param {any, ...(Array)} etc - The branches of the conditional statement.
 * @returns {Object} - The conditional statement object.
 */
const when = (condition, ...etc) => {
  let kids = etc.map((item) => {
    let cond = () =>
      typeof condition === "function"
        ? condition() === item[0]
        : condition === item[0];

    return [cond, item[1]];
  })

  return if_then(...kids);
};

// Helpers for h() essentially just like JSX
// But its just javascript and no black boxes
// This is just a personal take but I quite prefer this
// over JSX... why mix html and javascript syntactically like that?
const div = (...args) => h("div", ...args);
const span = (...args) => h("span", ...args);
const br = (...args) => h("br", ...args);

const p = (...args) => h("p", ...args);
const a = (link, ...args) => h("a", combined({ href: link, target: "_blank" }, ...args), ...args)
const img = (link, ...args) => h("img", combined({ src: link }, ...args), ...args)
const video = (link, ...args) => h("video", { controls: true, height: "90%" }, h("source", ({ src: link }), ...args), ...args)

const h1 = (...args) => h("h1", ...args);
const h2 = (...args) => h("h2", ...args);
const h3 = (...args) => h("h3", ...args);
const h4 = (...args) => h("h4", ...args);

const button = (click, ...args) => h("button", combined({ onclick: click }, ...args), ...args);
const slider = (change, ...args) => h("input", combined({ type: "range", oninput: change }, ...args), ...args);
const monke_slider = (setter, [min, max], ...args) => h("input", combined({ type: "range", min, max, oninput: (e) => setter.set(e.target.value), value: setter.is }, ...args), ...args);

// this just cuz jquery is king
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// This is utilities for larger reactive structures 
const dukan = createStore;
const prod = produce;
const hogaya = onMount;
const simple_dukan = createMutable;

const inn = (time, callback) => setTimeout(callback, time)
const every = (time, callback) => setInterval(callback, time)

export {
  render,
  h, sig, mem,
  eff, eff_on, each, if_then,
  when, div, span, p, a, h1, h2, h3, h4, br, $, $$, button,
  slider, monke_slider,
  img, video,
  dukan, prod, hogaya, simple_dukan,
  inn, every,
  renderToString as render_to_string
}

const if_then_object = (obj) => {
  let cond = obj.if;
  let child = obj.then;

  return [cond, child]
}

const combined = (obj, ...args) => {
  const arg = args.find(item => typeof item === "object");
  return args.find(item => typeof item === "object") ? { ...obj, ...arg } : obj;
};

// ....................................................
// ....................................................
// ........................./\.........................
// ..................______/__\_______.................
// ..................||-------------||.................
// ..................||             ||.................
// ..................||    \|||/    ||.................
// ..................||   [ @-@ ]   ||.................
// ..................||    ( ' )    ||.......       ...
// ..................||    _(O)_    ||.......|EXIT |...
// ..................||   / >=< \   ||.......|==>> |...
// ..................||__/_|_:_|_\__||.................
// ..................-----------------.................
// ....................................................
// ....................................................
// Monkey with a bowtie in the museum-- >
