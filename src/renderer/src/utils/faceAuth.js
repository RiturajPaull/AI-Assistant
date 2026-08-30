import * as faceapi from '@vladmandic/face-api'

let modelsLoaded = false
const BASE_URL = (import.meta.env.BASE_URL || './').replace(/\/$/, '')
const LOCAL_MODEL_URL = `${BASE_URL}/models/`
const CDN_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'

/**
 * Loads TinyFaceDetector, FaceLandmark68Net, and FaceRecognitionNet models
 */
export async function loadFaceApiModels() {
  if (modelsLoaded) return true

  // Try local public models first for offline 100ms loading
  try {
    console.log('[FaceAuth] Loading FaceAPI models from local storage (/models/)...')
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(LOCAL_MODEL_URL)
    ])
    modelsLoaded = true
    console.log('[FaceAuth] Local FaceAPI models loaded successfully.')
    return true
  } catch (localErr) {
    console.warn('[FaceAuth] Local model load failed, trying CDN fallback:', localErr.message)
  }

  // Fallback to CDN
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(CDN_MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(CDN_MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(CDN_MODEL_URL)
    ])
    modelsLoaded = true
    console.log('[FaceAuth] CDN FaceAPI models loaded successfully.')
    return true
  } catch (cdnErr) {
    console.error('[FaceAuth] Error loading FaceAPI models from CDN:', cdnErr)
    return false
  }
}

/**
 * Detects single face and extracts 128D descriptor vector from video element
 */
export async function extractFaceDescriptor(videoElement) {
  if (!videoElement || videoElement.paused || videoElement.ended) return null

  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor()

    return detection ? detection.descriptor : null
  } catch (err) {
    console.warn('[FaceAuth] Detection error:', err.message)
    return null
  }
}

/**
 * Checks if an authorized face descriptor exists in local storage
 */
export function getStoredAuthorizedDescriptor() {
  const raw = localStorage.getItem('ev_authorized_face_descriptor')
  if (!raw) return null
  try {
    const arr = JSON.parse(raw)
    return new Float32Array(arr)
  } catch (err) {
    console.error('[FaceAuth] Failed to parse stored descriptor:', err)
    return null
  }
}

/**
 * Retrieves the stored owner name from local storage (defaults to "Boss")
 */
export function getStoredOwnerName() {
  return localStorage.getItem('ev_authorized_owner_name') || 'Boss'
}

/**
 * Saves a 128D Float32Array descriptor and owner name as the authorized owner face
 */
export function saveAuthorizedDescriptor(descriptor, ownerName = 'Boss') {
  if (!descriptor) return false
  const arr = Array.from(descriptor)
  const cleanName = (ownerName || 'Boss').trim()
  localStorage.setItem('ev_authorized_face_descriptor', JSON.stringify(arr))
  localStorage.setItem('ev_authorized_owner_name', cleanName)
  console.log(`[FaceAuth] New authorized face enrolled successfully for ${cleanName}.`)
  return true
}

/**
 * Clears stored authorized face descriptor and owner name
 */
export function clearAuthorizedDescriptor() {
  localStorage.removeItem('ev_authorized_face_descriptor')
  localStorage.removeItem('ev_authorized_owner_name')
}

/**
 * Verifies live descriptor against stored descriptor using Euclidean Distance.
 * Threshold < 0.48 indicates a facial match.
 */
export function verifyFaceDescriptor(liveDescriptor, storedDescriptor, threshold = 0.48) {
  if (!liveDescriptor || !storedDescriptor) return { isMatch: false, distance: 1.0 }

  const distance = faceapi.euclideanDistance(liveDescriptor, storedDescriptor)
  console.log(`[FaceAuth] Face match distance: ${distance.toFixed(4)} (threshold: ${threshold})`)

  return {
    isMatch: distance <= threshold,
    distance
  }
}
