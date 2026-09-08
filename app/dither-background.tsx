'use client';

import { useEffect, useRef } from 'react';
import { waveFragment, ditherFragment } from './shader-source';

// Two-pass Web Graphics Library (WebGL) rendering preserves the reference's
// four-level Bayer dithering, pixel size, and noise field.
const vertexSource = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const bayer = [
  0, 48, 12, 60, 3, 51, 15, 63, 32, 16, 44, 28, 35, 19, 47, 31,
  8, 56, 4, 52, 11, 59, 7, 55, 40, 24, 36, 20, 43, 27, 39, 23,
  2, 50, 14, 62, 1, 49, 13, 61, 34, 18, 46, 30, 33, 17, 45, 29,
  10, 58, 6, 54, 9, 57, 5, 53, 42, 26, 38, 22, 41, 25, 37, 21,
];

export default function DitherBackground() {
  const container = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = container.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    function initialize() {
      if (!host || !canvas) return () => {};
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false });
      if (!gl) return () => {};
      const activateProgram = gl.useProgram.bind(gl);
      const programs: WebGLProgram[] = [];
      const shaders: WebGLShader[] = [];
      const textures: WebGLTexture[] = [];
      const buffer = gl.createBuffer();
      const framebuffer = gl.createFramebuffer();
      let frame = 0;
      let disposed = false;
      let visible = false;
      let nextPaint = 0;
      let width = 1;
      let height = 1;
      let waveWidth = 1;
      let waveHeight = 1;
      const pointer = { x: 0, y: 0, strength: 0, targetStrength: 0 };
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const started = performance.now();
      let lastFrame = started;

      const release = () => {
        disposed = true;
        cancelAnimationFrame(frame);
        for (const program of programs) gl.deleteProgram(program);
        for (const shader of shaders) gl.deleteShader(shader);
        for (const texture of textures) gl.deleteTexture(texture);
        gl.deleteBuffer(buffer);
        gl.deleteFramebuffer(framebuffer);
        host.dataset.ready = 'false';
      };

      try {
        const compile = (type: number, source: string) => {
          const shader = gl.createShader(type);
          if (!shader) throw new Error('Unable to allocate shader');
          shaders.push(shader);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed');
          return shader;
        };
        const vertex = compile(gl.VERTEX_SHADER, vertexSource);
        const createProgram = (source: string) => {
          const program = gl.createProgram();
          if (!program) throw new Error('Unable to allocate program');
          programs.push(program);
          gl.attachShader(program, vertex);
          gl.attachShader(program, compile(gl.FRAGMENT_SHADER, source));
          gl.linkProgram(program);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Unable to link shader');
          return program;
        };
        const wave = createProgram(waveFragment);
        const dither = createProgram(ditherFragment);
        const uniforms = (program: WebGLProgram, names: string[]) => Object.fromEntries(names.map(name => [name, gl.getUniformLocation(program, name)]));
        const wu = uniforms(wave, ['resolution', 'time', 'waveSpeed', 'waveFrequency', 'waveAmplitude', 'waveColor', 'mousePos', 'mouseStrength', 'mouseRadius']);
        const du = uniforms(dither, ['inputBuffer', 'bayerTex', 'resolution', 'colorNum', 'pixelSize', 'baseColor', 'inkColor']);
        let light = document.documentElement.dataset.theme === 'light';
        const wavePosition = gl.getAttribLocation(wave, 'position');
        const ditherPosition = gl.getAttribLocation(dither, 'position');
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

        const createTexture = () => {
          const texture = gl.createTexture();
          if (!texture) throw new Error('Unable to allocate texture');
          textures.push(texture);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          return texture;
        };
        const waveTexture = createTexture();
        const bayerTexture = createTexture();
        if (gl.getExtension('OES_texture_float')) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 8, 8, 0, gl.LUMINANCE, gl.FLOAT, new Float32Array(bayer.map(value => value / 64)));
        } else {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 8, 8, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array(bayer.map(value => Math.round(value / 64 * 255))));
        }

        activateProgram(wave);
        gl.uniform1f(wu.waveSpeed, 0.04);
        gl.uniform1f(wu.waveFrequency, 3);
        gl.uniform1f(wu.waveAmplitude, 0.3);
        gl.uniform3f(wu.waveColor, 0.85, 0.85, 0.87);
        gl.uniform1f(wu.mouseRadius, 0.24);
        activateProgram(dither);
        gl.uniform1i(du.inputBuffer, 0);
        gl.uniform1i(du.bayerTex, 1);
        gl.uniform1f(du.colorNum, 4);
        gl.uniform1f(du.pixelSize, 2);

        const draw = (now: number) => {
          if (disposed || gl.isContextLost()) return;
          const delta = Math.min(Math.max((now - lastFrame) / 1000, 0), 0.05);
          lastFrame = now;
          pointer.strength += (pointer.targetStrength - pointer.strength) * (1 - Math.exp(-delta * 10));
          gl.viewport(0, 0, waveWidth, waveHeight);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
          activateProgram(wave);
          gl.enableVertexAttribArray(wavePosition);
          gl.vertexAttribPointer(wavePosition, 2, gl.FLOAT, false, 0, 0);
          gl.uniform2f(wu.resolution, waveWidth, waveHeight);
          gl.uniform1f(wu.time, reducedMotion.matches ? 0 : (now - started) / 1000);
          gl.uniform2f(wu.mousePos, pointer.x * waveWidth / width, pointer.y * waveHeight / height);
          gl.uniform1f(wu.mouseStrength, reducedMotion.matches ? 0 : pointer.strength);
          gl.drawArrays(gl.TRIANGLES, 0, 3);

          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          gl.viewport(0, 0, width, height);
          activateProgram(dither);
          gl.uniform3f(du.baseColor, ...(light ? [0.953, 0.969, 0.992] : [0.039, 0.039, 0.039]) as [number, number, number]);
          gl.uniform3f(du.inkColor, ...(light ? [0.075, 0.34, 0.92] : [0.66, 0.66, 0.66]) as [number, number, number]);
          gl.enableVertexAttribArray(ditherPosition);
          gl.vertexAttribPointer(ditherPosition, 2, gl.FLOAT, false, 0, 0);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, waveTexture);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, bayerTexture);
          gl.uniform2f(du.resolution, width, height);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        const resize = () => {
          width = Math.max(1, host.clientWidth);
          height = Math.max(1, host.clientHeight);
          waveWidth = Math.max(1, Math.ceil(width / 2));
          waveHeight = Math.max(1, Math.ceil(height / 2));
          canvas.width = width;
          canvas.height = height;
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, waveTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, waveWidth, waveHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
          gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, waveTexture, 0);
          if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Unable to create render target');
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          draw(performance.now());
        };
        const tick = (now: number) => {
          frame = 0;
          if (disposed || document.hidden || !visible || reducedMotion.matches) return;
          if (now >= nextPaint) {
            draw(now);
            nextPaint = now + 1000 / 30 - 1;
          }
          frame = requestAnimationFrame(tick);
        };
        const updateMotion = () => {
          cancelAnimationFrame(frame);
          frame = 0;
          if (document.hidden || reducedMotion.matches) {
            pointer.strength = 0;
            pointer.targetStrength = 0;
          }
          if (document.hidden || disposed || !visible) return;
          draw(performance.now());
          if (!reducedMotion.matches) frame = requestAnimationFrame(tick);
        };
        const onPointer = (event: PointerEvent) => {
          if (reducedMotion.matches || !visible || document.hidden) return;
          const rect = host.getBoundingClientRect();
          pointer.x = event.clientX - rect.left;
          pointer.y = event.clientY - rect.top;
          pointer.targetStrength = pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height ? 1 : 0;
        };
        const onPointerLeave = () => { pointer.targetStrength = 0; };
        const onPointerUp = (event: PointerEvent) => {
          if (event.pointerType === 'touch') onPointerLeave();
        };
        resize();
        const visibilityObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          updateMotion();
        });
        visibilityObserver.observe(host);
        const observer = new ResizeObserver(resize);
        observer.observe(host);
        const themeObserver = new MutationObserver(() => {
          light = document.documentElement.dataset.theme === 'light';
          draw(performance.now());
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        window.addEventListener('pointermove', onPointer, { passive: true });
        document.addEventListener('pointerleave', onPointerLeave);
        window.addEventListener('pointercancel', onPointerLeave);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('blur', onPointerLeave);
        reducedMotion.addEventListener('change', updateMotion);
        document.addEventListener('visibilitychange', updateMotion);
        host.dataset.ready = 'true';
        updateMotion();
        return () => {
          observer.disconnect();
          visibilityObserver.disconnect();
          themeObserver.disconnect();
          window.removeEventListener('pointermove', onPointer);
          document.removeEventListener('pointerleave', onPointerLeave);
          window.removeEventListener('pointercancel', onPointerLeave);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('blur', onPointerLeave);
          reducedMotion.removeEventListener('change', updateMotion);
          document.removeEventListener('visibilitychange', updateMotion);
          release();
        };
      } catch {
        release();
        return () => {};
      }
    }

    let dispose = initialize();
    const contextLost = (event: Event) => { event.preventDefault(); dispose(); };
    const contextRestored = () => { dispose = initialize(); };
    canvas.addEventListener('webglcontextlost', contextLost);
    canvas.addEventListener('webglcontextrestored', contextRestored);
    return () => {
      dispose();
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
    };
  }, []);

  return <div ref={container} className="dither-background" aria-hidden="true">
    <canvas ref={canvasRef} />
  </div>;
}
