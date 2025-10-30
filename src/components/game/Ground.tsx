import { RigidBody } from "@react-three/rapier";

const Ground = () => {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[50, 1, 50]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <gridHelper args={[50, 50, '#444444', '#333333']} position={[0, 0.01, 0]} />
    </RigidBody>
  );
};

export default Ground;
