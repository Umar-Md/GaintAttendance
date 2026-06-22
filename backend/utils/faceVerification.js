  const FACE_DESCRIPTOR_SIZE = 128;
const FACE_MATCH_THRESHOLD = 0.6;

const isValidDescriptor = (descriptor) =>
  Array.isArray(descriptor) &&
  descriptor.length === FACE_DESCRIPTOR_SIZE &&
  descriptor.every((value) => Number.isFinite(value));

const getFaceDistance = (registeredDescriptor, liveDescriptor) => {
  if (!isValidDescriptor(registeredDescriptor) || !isValidDescriptor(liveDescriptor)) {
    return null;
  }

  const sum = registeredDescriptor.reduce((total, value, index) => {
    const diff = value - liveDescriptor[index];
    return total + diff * diff;
  }, 0);

  return Math.sqrt(sum);
};

const verifyFaceDescriptor = (registeredDescriptor, liveDescriptor) => {
  const distance = getFaceDistance(registeredDescriptor, liveDescriptor);

  if (distance === null) {
    return {
      match: false,
      distance: null,
      message: "Invalid face verification data",
    };
  }

  return {
    match: distance <= FACE_MATCH_THRESHOLD,
    distance: Number(distance.toFixed(4)),
    threshold: FACE_MATCH_THRESHOLD,
  };
};

export {
  FACE_DESCRIPTOR_SIZE,
  FACE_MATCH_THRESHOLD,
  isValidDescriptor,
  verifyFaceDescriptor,
};
