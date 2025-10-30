import { useRef } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";

const Player = () => {
  const playerRef = useRef<RapierRigidBody>(null);

  useFrame(() => {
    if (!playerRef.current) return;
    
    const position = playerRef.current.translation();
    
    if (position.y < -10) {
      playerRef.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={playerRef}
      position={[0, 5, 0]}
      colliders="ball"
      restitution={0.5}
      friction={0.7}
    >
      <mesh castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.7} roughness={0.2} />
      </mesh>
    </RigidBody>
  );
};

export default Player;
