
// This utility handles loading face-api.js and its models from a CDN
// to provide real facial recognition without local dependencies.

const FACE_API_JS = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js";
const MODELS_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

let isLoaded = false;

export async function loadFaceApi() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (isLoaded) return win.faceapi;

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = FACE_API_JS;
        script.async = true;
        script.onload = async () => {
            try {
                const faceapi = win.faceapi;
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
                ]);
                isLoaded = true;
                resolve(faceapi);
            } catch (err) {
                reject(err);
            }
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export async function getFaceDescriptor(videoOrImage: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const faceapi = (window as any).faceapi;
    if (!faceapi) await loadFaceApi();

    const detection = await faceapi
        .detectSingleFace(videoOrImage, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

    return detection ? Array.from(detection.descriptor) : null;
}

export function compareFaces(descriptor1: number[], descriptor2: number[], threshold = 0.5) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const faceapi = win.faceapi;
    if (!faceapi) return false;

    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    // distance < threshold means it's the same person. 
    // Lower threshold = more strict. Higher = more loose.
    return distance < threshold;
}
