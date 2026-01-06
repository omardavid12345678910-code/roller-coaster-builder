import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function Ground() {
  const basePath = import.meta.env.BASE_URL || '/';
  const texture = useTexture(`${basePath}textures/grass.png`);
  
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(200, 200);
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[800, 800]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
