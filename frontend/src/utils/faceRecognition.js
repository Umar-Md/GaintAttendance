let modelPromise = null;

const MODEL_URL = "/models";
const MODEL_VERSION = "2026-06-20-face-api-v1";
const REQUIRED_MODEL_FILES = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model-shard1",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2",
];

const createImage = (imageSrc) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to read face image"));
    image.src = imageSrc;
  });

const withModelVersion = (url) =>
  `${url}${url.includes("?") ? "&" : "?"}v=${MODEL_VERSION}`;

const assertModelFilesAvailable = async () => {
  const checks = await Promise.all(
    REQUIRED_MODEL_FILES.map(async (file) => {
      const url = `${MODEL_URL}/${file}`;
      try {
        const res = await window.fetch(withModelVersion(url), {
          cache: "no-store",
        });

        return {
          file,
          ok: res.ok,
          status: res.status,
        };
      } catch (error) {
        return {
          file,
          ok: false,
          status: error.message,
        };
      }
    })
  );

  const failed = checks.find((check) => !check.ok);

  if (failed) {
    throw new Error(
      `Face model file unavailable: /models/${failed.file} (${failed.status})`
    );
  }
};

const concatenateBuffers = (buffers) => {
  const totalBytes = buffers.reduce((total, buffer) => total + buffer.byteLength, 0);
  const result = new Uint8Array(totalBytes);
  let offset = 0;

  buffers.forEach((buffer) => {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });

  return result.buffer;
};

const fetchModelFile = async (file) => {
  const url = withModelVersion(`${MODEL_URL}/${file}`);
  const res = await window.fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Unable to load /models/${file} (${res.status})`);
  }

  return res;
};

const loadNetFromPublicModels = async (faceapi, net, modelName) => {
  const manifestRes = await fetchModelFile(`${modelName}-weights_manifest.json`);
  const manifest = await manifestRes.json();
  const weightMap = {};

  for (const group of manifest) {
    const buffers = await Promise.all(
      group.paths.map(async (path) => (await fetchModelFile(path)).arrayBuffer())
    );

    Object.assign(
      weightMap,
      faceapi.tf.io.decodeWeights(concatenateBuffers(buffers), group.weights)
    );
  }

  const recognitionProbe = weightMap["conv256_down/conv2/conv/filters"];

  if (modelName === "face_recognition_model" && recognitionProbe?.size !== 589824) {
    throw new Error(
      `Invalid face recognition model tensor: expected 589824 values, received ${recognitionProbe?.size || 0}`
    );
  }

  net.loadFromWeightMap(weightMap);
};

const loadFaceModels = async () => {
  if (!modelPromise) {
    modelPromise = import("face-api.js").then(async (faceapi) => {
      await assertModelFilesAvailable();

      await Promise.all([
        loadNetFromPublicModels(
          faceapi,
          faceapi.nets.tinyFaceDetector,
          "tiny_face_detector_model"
        ),
        loadNetFromPublicModels(
          faceapi,
          faceapi.nets.faceLandmark68Net,
          "face_landmark_68_model"
        ),
        loadNetFromPublicModels(
          faceapi,
          faceapi.nets.faceRecognitionNet,
          "face_recognition_model"
        ),
      ]);

      return faceapi;
    });

    modelPromise = modelPromise.catch((error) => {
      modelPromise = null;
      throw error;
    });
  }

  return modelPromise;
};

const getFaceDescriptorFromImage = async (imageSrc) => {
  const faceapi = await loadFaceModels();
  const image = await createImage(imageSrc);
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,
    scoreThreshold: 0.5,
  });

  const detections = await faceapi
    .detectAllFaces(image, options)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections.length === 0) {
    throw new Error("No clear face detected. Face the camera and try again.");
  }

  if (detections.length > 1) {
    throw new Error("Multiple faces detected. Only one face is allowed.");
  }

  return Array.from(detections[0].descriptor);
};

export { getFaceDescriptorFromImage, loadFaceModels };
