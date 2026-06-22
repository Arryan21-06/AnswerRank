"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

// Gentle float variants — each card gets a slightly different phase/amplitude
const floatVariants = {
  card1: {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 3.8, repeat: Infinity, ease: "easeInOut" },
    },
  },
  card2: {
    animate: {
      y: [0, 8, 0],
      transition: { duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
    },
  },
  card3: {
    animate: {
      y: [0, -7, 0],
      transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
    },
  },
};

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Wireframe globe
    const geometry = new THREE.SphereGeometry(6, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x333333,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Surface particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      const phi = Math.acos(-1 + (2 * i) / (particlesCount * 3));
      const theta = Math.sqrt(particlesCount * Math.PI) * phi;
      const r = 6.05;
      posArray[i]     = r * Math.cos(theta) * Math.sin(phi);
      posArray[i + 1] = r * Math.sin(theta) * Math.sin(phi);
      posArray[i + 2] = r * Math.cos(phi);
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0x000000 });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Animation loop
    let animationFrameId: number;
    let rotationSpeed = 0.001;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const targetSpeed = hovered ? 0.008 : 0.001;
      rotationSpeed += (targetSpeed - rotationSpeed) * 0.05;
      globe.rotation.y += rotationSpeed;
      globe.rotation.x += rotationSpeed * 0.2;
      particlesMesh.rotation.y += rotationSpeed;
      particlesMesh.rotation.x += rotationSpeed * 0.2;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount) currentMount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [hovered]);

  return (
    <div
      className="relative w-full h-[500px] flex items-center justify-center cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Three.js canvas */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* ── Card 1: top-right — ChatGPT Match ── */}
      <motion.div
        className="absolute z-10 top-[12%] right-[4%]"
        animate={floatVariants.card1.animate}
      >
        <div className="bg-white/95 backdrop-blur-md border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[176px]">
          {/* Sparkle icon */}
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
              <path
                d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"
                fill="currentColor"
              />
              <path d="M19 17l.75 2.25L22 20l-2.25.75L19 23l-.75-2.25L16 20l2.25-.75L19 17z" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-zinc-800 leading-tight">ChatGPT Match</span>
            <span className="text-lg font-bold text-black leading-tight">92%</span>
          </div>
          {/* Green indicator dot */}
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] shrink-0 ml-auto" />
        </div>
      </motion.div>

      {/* ── Card 2: middle-left — Missing FAQs ── */}
      <motion.div
        className="absolute z-10 top-[42%] left-[2%]"
        animate={floatVariants.card2.animate}
      >
        <div className="bg-white/95 backdrop-blur-md border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[160px]">
          {/* Warning icon */}
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-500">
              <path
                d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-zinc-500 leading-tight">Gap detected</span>
            <span className="text-sm font-bold text-zinc-900 leading-tight">Missing FAQs</span>
          </div>
          {/* Amber indicator dot */}
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] shrink-0 ml-auto" />
        </div>
      </motion.div>

      {/* ── Card 3: bottom-right — Structure Optimized ── */}
      <motion.div
        className="absolute z-10 bottom-[14%] right-[6%]"
        animate={floatVariants.card3.animate}
      >
        <div className="bg-white/95 backdrop-blur-md border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[176px]">
          {/* Check / structure icon */}
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-500">
              <path
                d="M9 11l3 3L22 4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-zinc-500 leading-tight">Structure</span>
            <span className="text-sm font-bold text-zinc-900 leading-tight">Optimized ✓</span>
          </div>
          {/* Blue indicator dot */}
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)] shrink-0 ml-auto" />
        </div>
      </motion.div>
    </div>
  );
}
