import { RigidBody } from "@react-three/rapier";

const Ground = () => {
  const renderSize = 50;
  const blocks = [];

  for (let x = -renderSize / 2; x < renderSize / 2; x++) {
    for (let z = -renderSize / 2; z < renderSize / 2; z++) {
      blocks.push(
        <mesh
          key={`${x}-${z}`}
          position={[x, -0.5, z]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color="#22c55e"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      );
    }
  }

  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group>{blocks}</group>
    </RigidBody>
  );
};

export default Ground;