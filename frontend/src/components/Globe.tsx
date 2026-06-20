"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // pure white background

    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 15; // move camera back

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Create wireframe globe
    const geometry = new THREE.SphereGeometry(6, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x333333, // grey/black lines
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add some subtle points on the surface for visual interest
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      // distribute points on sphere surface
      const phi = Math.acos(-1 + (2 * i) / (particlesCount * 3));
      const theta = Math.sqrt(particlesCount * Math.PI) * phi;

      const r = 6.05; // slightly larger than globe
      posArray[i] = r * Math.cos(theta) * Math.sin(phi);
      posArray[i + 1] = r * Math.sin(theta) * Math.sin(phi);
      posArray[i + 2] = r * Math.cos(phi);
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x000000,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Animation loop
    let animationFrameId: number;
    let rotationSpeed = 0.001;
    const targetSpeed = hovered ? 0.008 : 0.001;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smoothly interpolate rotation speed
      rotationSpeed += (targetSpeed - rotationSpeed) * 0.05;

      globe.rotation.y += rotationSpeed;
      globe.rotation.x += rotationSpeed * 0.2;

      particlesMesh.rotation.y += rotationSpeed;
      particlesMesh.rotation.x += rotationSpeed * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
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
      <div ref={mountRef} className="absolute inset-0" />

      {/* Floating Metric Card */}
      <div className="absolute z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-zinc-100 flex flex-col items-center gap-2 transform translate-x-12 -translate-y-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900">John Doe</span>
            <span className="text-xs text-zinc-500">Tech Creator</span>
          </div>
        </div>
        <div className="w-full bg-[#E8F4FF] rounded-lg p-3 flex items-center justify-between gap-4 mt-1">
          <span className="text-xs font-semibold text-black">AnswerRank</span>
          <span className="text-lg font-bold text-black">84/100</span>
        </div>
      </div>
    </div>
  );
}
