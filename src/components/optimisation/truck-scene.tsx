"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { TRUCK } from "@/lib/constants";
import type { PlacedItem, TruckLoad } from "@/lib/types";
import * as THREE from "three";

function TruckWireframe() {
  return (
    <lineSegments
      position={[TRUCK.length / 2, TRUCK.height / 2, TRUCK.width / 2]}
    >
      <edgesGeometry
        args={[new THREE.BoxGeometry(TRUCK.length, TRUCK.height, TRUCK.width)]}
      />
      <lineBasicMaterial color={0x00f0ff} transparent opacity={0.4} />
    </lineSegments>
  );
}

function TruckFloor() {
  return (
    <>
      <mesh
        position={[TRUCK.length / 2, 0.01, TRUCK.width / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[TRUCK.length, TRUCK.width]} />
        <meshPhongMaterial
          color={0x0a0a2a}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Grid
        position={[TRUCK.length / 2, 0.02, TRUCK.width / 2]}
        args={[TRUCK.length + 1, TRUCK.width + 1]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#1a1a4a"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#0f0f30"
        fadeDistance={30}
        infiniteGrid={false}
      />
    </>
  );
}

function LoadedItem({
  item,
  delay,
}: {
  item: PlacedItem;
  delay: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (startTime.current === null) {
      startTime.current = clock.getElapsedTime() + delay / 1000;
    }

    const elapsed = clock.getElapsedTime() - startTime.current;
    if (elapsed < 0) {
      meshRef.current.scale.set(0, 0, 0);
      return;
    }

    const t = Math.min(elapsed / 0.4, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    meshRef.current.scale.set(ease, ease, ease);
  });

  return (
    <mesh
      ref={meshRef}
      position={[
        item.position.x + item.dims.l / 2,
        item.position.z + item.dims.h / 2,
        item.position.y + item.dims.w / 2,
      ]}
      castShadow
      receiveShadow
      scale={[0, 0, 0]}
    >
      <boxGeometry
        args={[item.dims.l * 0.98, item.dims.h * 0.98, item.dims.w * 0.98]}
      />
      <meshPhongMaterial
        color={item.color}
        transparent
        opacity={0.85}
        shininess={80}
        emissive={item.color}
        emissiveIntensity={0.1}
      />
      <lineSegments>
        <edgesGeometry
          args={[
            new THREE.BoxGeometry(
              item.dims.l * 0.98,
              item.dims.h * 0.98,
              item.dims.w * 0.98
            ),
          ]}
        />
        <lineBasicMaterial color={0xffffff} transparent opacity={0.2} />
      </lineSegments>
    </mesh>
  );
}

interface TruckSceneInnerProps {
  truck: TruckLoad;
}

function TruckSceneInner({ truck }: TruckSceneInnerProps) {
  return (
    <>
      <ambientLight intensity={0.6} color={0x404060} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={0.8}
        castShadow
      />
      <pointLight
        position={[6.5, 8, 1.2]}
        intensity={0.4}
        color={0x00f0ff}
        distance={50}
      />
      <TruckWireframe />
      <TruckFloor />
      {truck.items.map((item, i) => (
        <LoadedItem key={i} item={item} delay={i * 80} />
      ))}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        target={[TRUCK.length / 2, TRUCK.height / 2, TRUCK.width / 2]}
      />
    </>
  );
}

interface TruckSceneProps {
  truck: TruckLoad;
}

export function TruckScene({ truck }: TruckSceneProps) {
  return (
    <Canvas
      camera={{
        position: [18, 10, 12],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      shadows
      style={{ height: "500px", background: "#06060f" }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <fog attach="fog" args={[0x06060f, 20, 80]} />
      <TruckSceneInner truck={truck} />
    </Canvas>
  );
}
