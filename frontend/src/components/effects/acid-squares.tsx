"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, RenderTarget, Triangle } from "ogl";

export type AcidSquaresDetail = "low" | "medium" | "high";

export interface AcidSquaresProps {
  color1?: string;
  color2?: string;
  color3?: string;
  detail?: AcidSquaresDetail;
  speed?: number;
  waveDepth?: number;
  zoom?: number;
  density?: number;
  glow?: number;
  exposure?: number;
  spread?: number;
  stepSize?: number;
  colorShift?: number;
  contrast?: number;
  brightness?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  mouseRadius?: number;
  blur?: number;
  grain?: boolean;
  grainIntensity?: number;
  className?: string;
}

type UniformMap = Record<string, { value: unknown }>;

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];

  return [
    Number.parseInt(result[1], 16) / 255,
    Number.parseInt(result[2], 16) / 255,
    Number.parseInt(result[3], 16) / 255,
  ];
};

const DETAIL_STEPS: Record<AcidSquaresDetail, number> = {
  low: 20,
  medium: 32,
  high: 48,
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uWaveDepth;
uniform float uZoom;
uniform float uDensity;
uniform float uSpread;
uniform float uStepSize;
uniform float uGlow;
uniform float uExposure;
uniform float uColorShift;
uniform float uContrast;
uniform float uBrightness;
uniform float uOpacity;
uniform float uSteps;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uMouseRadius;
uniform float uEnableMouse;
uniform float uMouseActive;
uniform float uGrain;
uniform float uGrainIntensity;
out vec4 fragColor;

void main() {
  vec2 frag = gl_FragCoord.xy;
  float zoom = max(uZoom, 0.05);
  float aspect = iResolution.x / iResolution.y;
  vec2 ndc = (2.0 * frag - iResolution.xy) / iResolution.y;
  vec2 dir = ndc * (0.5 / zoom);

  vec2 mouseNdc = vec2(uMouse.x * aspect, uMouse.y);
  float mr = max(uMouseRadius, 0.01);
  vec2 md = ndc - mouseNdc;
  float dent = exp(-dot(md, md) / (mr * mr)) * (3.0 * uMouseStrength * uEnableMouse * uMouseActive);

  float travel = sin(iTime * uSpeed) * uWaveDepth;
  float density = max(uDensity, 1.0);
  float spread = clamp(uSpread, 0.05, 0.6);
  float stepSize = max(uStepSize, 0.0005);
  float glowGain = max(uGlow, 0.0);

  vec3 tOffset = vec3(0.0, dent, travel);
  vec3 p = vec3(0.0);
  float s = 0.0;
  float glow = 0.0;

  for (int i = 0; i < 64; i++) {
    if (float(i) >= uSteps) break;
    p += vec3(dir * s, s);
    vec3 q = p + tOffset;
    s += density - length(q.xz) + length(ceil(q).xy);
    s = stepSize + abs(s) * spread;
    glow += glowGain / s;
  }

  float e = glow / max(uExposure, 1.0);
  float shimmer = 0.5 + 0.5 * dot(cos(iTime * uColorShift + p), vec3(0.3333));
  float v = tanh(e * uBrightness * mix(0.7, 1.05, shimmer));
  v = clamp((v - 0.5) * uContrast + 0.5, 0.0, 1.0);

  vec3 col = mix(uColor1, uColor2, smoothstep(0.0, 0.55, v));
  col = mix(col, uColor3, smoothstep(0.55, 1.0, v));
  col *= v;

  float a = clamp(v, 0.0, 1.0) * uOpacity;
  vec3 outRgb = col * a;
  if (uGrain > 0.5) {
    float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + gv, 0.0, 1.0);
    a = clamp(a + gv, 0.0, 1.0);
  }
  fragColor = vec4(outRgb, a);
}
`;

const postFragment = `#version 300 es
precision highp float;
uniform sampler2D tMap;
uniform vec2 iResolution;
uniform vec2 uDirection;
uniform float uRadius;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float iTime;
out vec4 fragColor;

vec4 samp(vec2 uv) {
  return texture(tMap, uv);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution;
  vec2 texel = uDirection / iResolution;
  float st = uRadius * 0.25;
  vec4 sum = samp(uv) * 0.2026;
  sum += (samp(uv + texel * st) + samp(uv - texel * st)) * 0.179;
  sum += (samp(uv + texel * (st * 2.0)) + samp(uv - texel * (st * 2.0))) * 0.124;
  sum += (samp(uv + texel * (st * 3.0)) + samp(uv - texel * (st * 3.0))) * 0.0672;
  sum += (samp(uv + texel * (st * 4.0)) + samp(uv - texel * (st * 4.0))) * 0.0285;
  vec4 col = sum;
  if (uGrain > 0.5) {
    float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    col.rgb = clamp(col.rgb + gv, 0.0, 1.0);
    col.a = clamp(col.a + gv, 0.0, 1.0);
  }
  fragColor = col;
}
`;

type AcidSquaresContext = {
  program: InstanceType<typeof Program>;
  render: () => void;
};

const contextMap = new WeakMap<HTMLDivElement, AcidSquaresContext>();

export default function AcidSquares({
  color1 = "#5227FF",
  color2 = "#A855F7",
  color3 = "#FFFFFF",
  detail = "medium",
  speed = 0.7,
  waveDepth = 1,
  zoom = 1.3,
  density = 10,
  glow = 1,
  exposure = 2700,
  spread = 0.3,
  stepSize = 0.002,
  colorShift = 0,
  contrast = 1,
  brightness = 1,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 0.1,
  mouseRadius = 0.35,
  blur = 0,
  grain = true,
  grainIntensity = 0.05,
  className = "",
}: AcidSquaresProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseTarget = useRef<[number, number]>([0, 0]);
  const mouseCurrent = useRef<[number, number]>([0, 0]);
  const enableMouseRef = useRef(mouseInteraction);
  const mouseStrengthRef = useRef(mouseStrength);
  const mouseActive = useRef(0);
  const mouseActiveTarget = useRef(0);
  const blurRef = useRef(blur);
  const grainRef = useRef(grain);
  const grainIntensityRef = useRef(grainIntensity);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let renderer: InstanceType<typeof Renderer>;

    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        dpr: reducedMotion ? 1 : Math.min(window.devicePixelRatio || 1, 1.35),
      });
    } catch {
      container.dataset.webglUnavailable = "true";
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: 0.7 },
        uWaveDepth: { value: 1 },
        uZoom: { value: 1.3 },
        uDensity: { value: 10 },
        uSpread: { value: 0.3 },
        uStepSize: { value: 0.002 },
        uGlow: { value: 1 },
        uExposure: { value: 2700 },
        uColorShift: { value: 0 },
        uContrast: { value: 1 },
        uBrightness: { value: 1 },
        uOpacity: { value: 1 },
        uSteps: { value: 32 },
        uColor1: { value: new Float32Array([1, 1, 1]) },
        uColor2: { value: new Float32Array([1, 1, 1]) },
        uColor3: { value: new Float32Array([1, 1, 1]) },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseStrength: { value: 0.1 },
        uMouseRadius: { value: 0.35 },
        uEnableMouse: { value: 1 },
        uMouseActive: { value: 0 },
        uGrain: { value: 1 },
        uGrainIntensity: { value: 0.05 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const postProgram = new Program(gl, {
      vertex,
      fragment: postFragment,
      uniforms: {
        tMap: { value: null },
        iResolution: { value: new Float32Array([1, 1]) },
        uDirection: { value: new Float32Array([1, 0]) },
        uRadius: { value: 0 },
        uGrain: { value: 0 },
        uGrainIntensity: { value: 0.05 },
        iTime: { value: 0 },
      },
    });
    const postMesh = new Mesh(gl, { geometry, program: postProgram });
    const primaryUniforms = program.uniforms as UniformMap;
    const postUniforms = postProgram.uniforms as UniformMap;

    let firstTarget: InstanceType<typeof RenderTarget> | null = null;
    let secondTarget: InstanceType<typeof RenderTarget> | null = null;

    const ensureTargets = () => {
      if (firstTarget) return;
      firstTarget = new RenderTarget(gl, {
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
        depth: false,
      });
      secondTarget = new RenderTarget(gl, {
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
        depth: false,
      });
    };

    const renderFrame = () => {
      const grainEnabled = grainRef.current ? 1 : 0;
      primaryUniforms.uGrainIntensity.value = grainIntensityRef.current;
      postUniforms.uGrainIntensity.value = grainIntensityRef.current;

      if (blurRef.current > 0) {
        ensureTargets();
        primaryUniforms.uGrain.value = 0;
        renderer.render({ scene: mesh, target: firstTarget ?? undefined });
        postUniforms.uRadius.value = blurRef.current * 14;
        postUniforms.tMap.value = firstTarget?.texture ?? null;
        const direction = postUniforms.uDirection.value as Float32Array;
        direction[0] = 1;
        direction[1] = 0;
        postUniforms.uGrain.value = 0;
        renderer.render({ scene: postMesh, target: secondTarget ?? undefined });
        postUniforms.tMap.value = secondTarget?.texture ?? null;
        direction[0] = 0;
        direction[1] = 1;
        postUniforms.uGrain.value = grainEnabled;
        renderer.render({ scene: postMesh });
      } else {
        primaryUniforms.uGrain.value = grainEnabled;
        renderer.render({ scene: mesh });
      }
    };

    contextMap.set(container, { program, render: renderFrame });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
      const resolution = primaryUniforms.iResolution.value as Float32Array;
      const postResolution = postUniforms.iResolution.value as Float32Array;
      resolution[0] = width;
      resolution[1] = height;
      postResolution[0] = width;
      postResolution[1] = height;
      firstTarget?.setSize(width, height);
      secondTarget?.setSize(width, height);
      renderFrame();
    };

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    setSize();

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseTarget.current = [
        ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        -((event.clientY - rect.top) / rect.height - 0.5) * 2,
      ];
      mouseActiveTarget.current = 1;
    };
    const handlePointerLeave = () => {
      mouseActiveTarget.current = 0;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);

    let animationFrame = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const startTime = performance.now();

    const loop = (time: number) => {
      primaryUniforms.iTime.value = (time - startTime) * 0.001;
      const current = mouseCurrent.current;
      const target = mouseTarget.current;
      current[0] += 0.05 * (target[0] - current[0]);
      current[1] += 0.05 * (target[1] - current[1]);
      const mouse = primaryUniforms.uMouse.value as Float32Array;
      mouse[0] = current[0];
      mouse[1] = current[1];
      const activeTarget = enableMouseRef.current && finePointer ? mouseActiveTarget.current : 0;
      mouseActive.current += 0.05 * (activeTarget - mouseActive.current);
      primaryUniforms.uMouseActive.value = mouseActive.current;
      primaryUniforms.uEnableMouse.value = enableMouseRef.current && finePointer ? 1 : 0;
      primaryUniforms.uMouseStrength.value = mouseStrengthRef.current;
      postUniforms.iTime.value = primaryUniforms.iTime.value;
      renderFrame();
      animationFrame = window.requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (!reducedMotion && isVisible && isPageVisible && animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(loop);
      }
    };
    const tryStop = () => {
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) tryStart();
      else tryStop();
    });
    intersectionObserver.observe(container);

    const handleVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) tryStart();
      else tryStop();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    tryStart();

    return () => {
      tryStop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      contextMap.delete(container);

      if (firstTarget && secondTarget) {
        gl.deleteFramebuffer(firstTarget.buffer);
        gl.deleteFramebuffer(secondTarget.buffer);
        firstTarget.textures.forEach((texture) => gl.deleteTexture(texture.texture));
        secondTarget.textures.forEach((texture) => gl.deleteTexture(texture.texture));
      }

      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const context = contextMap.get(container);
    if (!context) return;
    const uniforms = context.program.uniforms as UniformMap;

    uniforms.uSpeed.value = speed;
    uniforms.uWaveDepth.value = waveDepth;
    uniforms.uZoom.value = zoom;
    uniforms.uDensity.value = density;
    uniforms.uSpread.value = spread;
    uniforms.uStepSize.value = stepSize;
    uniforms.uGlow.value = glow;
    uniforms.uExposure.value = exposure;
    uniforms.uColorShift.value = colorShift;
    uniforms.uContrast.value = contrast;
    uniforms.uBrightness.value = brightness;
    uniforms.uOpacity.value = opacity;
    uniforms.uSteps.value = DETAIL_STEPS[detail];
    uniforms.uMouseRadius.value = mouseRadius;

    const colors = [
      ["uColor1", hexToRgb(color1)],
      ["uColor2", hexToRgb(color2)],
      ["uColor3", hexToRgb(color3)],
    ] as const;

    colors.forEach(([uniformName, color]) => {
      const target = uniforms[uniformName].value as Float32Array;
      target[0] = color[0];
      target[1] = color[1];
      target[2] = color[2];
    });

    enableMouseRef.current = mouseInteraction;
    mouseStrengthRef.current = mouseStrength;
    blurRef.current = blur;
    grainRef.current = grain;
    grainIntensityRef.current = grainIntensity;
    context.render();
  }, [
    blur,
    brightness,
    color1,
    color2,
    color3,
    colorShift,
    contrast,
    density,
    detail,
    exposure,
    glow,
    grain,
    grainIntensity,
    mouseInteraction,
    mouseRadius,
    mouseStrength,
    opacity,
    speed,
    spread,
    stepSize,
    waveDepth,
    zoom,
  ]);

  return <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className}`.trim()} />;
}
