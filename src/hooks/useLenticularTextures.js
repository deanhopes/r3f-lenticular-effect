import { useVideoTexture } from '@react-three/drei';

/**
 * Loads and returns lenticular video textures for the carousel.
 * Returns an array of { textureA, textureB, key }
 */
export function useLenticularTextures() {
  const videoNostalgiaTrain = useVideoTexture('textures/nostalgia/nostalgia-train.mp4');
  const videoNostalgiaWoman = useVideoTexture('textures/nostalgia/nostalgia-woman.mp4');
  const videoVhsTrain = useVideoTexture('textures/vhs/vhs-train.mp4');
  const videoVhsRunning = useVideoTexture('textures/vhs/vhs-running.mp4');
  const videoWaterCloseUp = useVideoTexture('textures/water/water-closeup.mp4');
  const videoWaterShirt = useVideoTexture('textures/water/water-shirt.mp4');

  return [
    {
      textureA: videoNostalgiaTrain,
      textureB: videoNostalgiaWoman,
      key: 'nostalgia',
    },
    {
      textureA: videoVhsTrain,
      textureB: videoVhsRunning,
      key: 'vhs',
    },
    {
      textureA: videoWaterCloseUp,
      textureB: videoWaterShirt,
      key: 'water',
    },
  ];
} 