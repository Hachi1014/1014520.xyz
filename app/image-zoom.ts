export type ImagePose = { scale: number; x: number; y: number };
export function zoomImage(previous: ImagePose, factor: number, x = 0, y = 0): ImagePose {
  const scale = Math.min(8, Math.max(.5, previous.scale * factor));
  const ratio = scale / previous.scale;
  return { scale, x: x - (x - previous.x) * ratio, y: y - (y - previous.y) * ratio };
}

export function stepImageZoom(previous: ImagePose, direction: -1 | 1): ImagePose {
  const nextPercent = Math.round(previous.scale * 100) + direction * 10;
  return zoomImage(previous, nextPercent / 100 / previous.scale);
}
