const FACE_DESCRIPTOR_SIZE = 128;
const FACE_MATCH_THRESHOLD = 0.35;
const REQUIRED_LIVE_SAMPLES = 3;

const isValidDescriptor = (descriptor) =>
  Array.isArray(descriptor) &&
  descriptor.length === FACE_DESCRIPTOR_SIZE &&
  descriptor.every((value) => Number.isFinite(value));

const toDescriptorArray = (descriptor) => {
  if (!descriptor) return null;

  const values = Array.isArray(descriptor)
    ? descriptor
    : typeof descriptor === "object"
    ? Object.keys(descriptor)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => descriptor[key])
    : null;

  if (!values) return null;

  const normalized = values.map((value) => Number(value));

  return normalized.length === FACE_DESCRIPTOR_SIZE ? normalized : null;
};

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

const normalizeLiveDescriptors = ({ faceDescriptor, faceDescriptors }) => {
  if (Array.isArray(faceDescriptors)) {
    return faceDescriptors
      .map(toDescriptorArray)
      .filter((descriptor) => descriptor !== null);
  }

  const descriptor = toDescriptorArray(faceDescriptor);
  if (descriptor) return [descriptor];

  return [];
};

const verifyLiveFaceDescriptors = (registeredDescriptor, liveDescriptors) => {
  if (!isValidDescriptor(registeredDescriptor)) {
    return {
      match: false,
      distance: null,
      threshold: FACE_MATCH_THRESHOLD,
      message: "Registered face data is invalid",
    };
  }

  if (!Array.isArray(liveDescriptors) || liveDescriptors.length < REQUIRED_LIVE_SAMPLES) {
    return {
      match: false,
      distance: null,
      threshold: FACE_MATCH_THRESHOLD,
      message: "Multiple face verification samples required",
    };
  }

  const checks = liveDescriptors.map((descriptor) =>
    verifyFaceDescriptor(registeredDescriptor, descriptor)
  );
  const failedCheck = checks.find((check) => !check.match);
  const maxDistance = Math.max(...checks.map((check) => check.distance ?? Infinity));

  return {
    match: !failedCheck,
    distance: Number(maxDistance.toFixed(4)),
    threshold: FACE_MATCH_THRESHOLD,
    samples: checks.length,
    message: failedCheck?.message,
  };
};

export {
  FACE_DESCRIPTOR_SIZE,
  FACE_MATCH_THRESHOLD,
  REQUIRED_LIVE_SAMPLES,
  isValidDescriptor,
  normalizeLiveDescriptors,
  verifyFaceDescriptor,
  verifyLiveFaceDescriptors,
};
