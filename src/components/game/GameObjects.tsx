import { RigidBody } from "@react-three/rapier";
import { GameObject } from "@/pages/Index";

interface GameObjectsProps {
  objects: GameObject[];
}

const GameObjects = ({ objects }: GameObjectsProps) => {
  return (
    <>
      {objects.map((obj) => (
        <RigidBody
          key={obj.id}
          position={obj.position}
          colliders="auto"
          restitution={0.6}
          friction={0.8}
        >
          <mesh castShadow receiveShadow>
            {obj.type === 'box' && <boxGeometry args={[1, 1, 1]} />}
            {obj.type === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
            {obj.type === 'cylinder' && <cylinderGeometry args={[0.5, 0.5, 1, 32]} />}
            <meshStandardMaterial
              color={obj.color}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
};

export default GameObjects;
