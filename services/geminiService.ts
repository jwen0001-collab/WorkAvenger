import { GestureType, Language } from "../types";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { getRandomReaction, BODY_ASSETS } from "../data/staticAssets";

let handLandmarker: HandLandmarker | null = null;

// Initialize MediaPipe HandLandmarker
const initializeHandLandmarker = async () => {
  if (handLandmarker) return;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });
  } catch (error) {
    console.error("Failed to initialize MediaPipe:", error);
  }
};

// Trigger initialization immediately
initializeHandLandmarker();

// Keep image detection for static images if needed (though we likely won't use it for live game)
export const detectGestureFromImage = async (base64Data: string): Promise<GestureType> => {
  return GestureType.NONE;
}

export const detectGestureFromVideo = async (video: HTMLVideoElement, startTimeMs: number): Promise<GestureType> => {
  if (!handLandmarker) {
    await initializeHandLandmarker();
    if (!handLandmarker) return GestureType.NONE;
  }

  try {
    const result = handLandmarker.detectForVideo(video, startTimeMs);

    // Check for TEAR (Two hands detected)
    if (result.landmarks && result.landmarks.length === 2) {
      // Logic for TEAR: Just two hands present is enough for now, 
      // or we could check if they are moving apart (requires history, maybe simplified as just 2 hands being open/fist doesn't matter, just 2 hands = TEAR)
      // IMPROVEMENT: Check if both hands are somewhat open or interacting. 
      // Let's keep it simple: 2 hands visible = TEAR (Special move)
      return GestureType.TEAR;
    }

    if (result.landmarks && result.landmarks.length === 1) {
      const lm = result.landmarks[0];

      // Improved FIST vs PALM logic based on finger curl
      // A finger is curled if the Tip is closer to the Wrist (0) than the PIP joint (6, 10, 14, 18) is.
      // Actually simpler: Tip distance to Wrist < MCP distance to Wrist? 
      // Standard robust way: Tip vs PIP relative to wrist.
      // Let's use distance to wrist (Vertex 0).

      const dist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
      const wrist = lm[0];

      // Check 4 fingers (Index, Middle, Ring, Pinky)
      // Tip indices: 8, 12, 16, 20
      // PIP indices: 6, 10, 14, 18 (Knuckle middle) or MCP 5, 9, 13, 17?
      // Let's stick to TipToWrist vs PIPToWrist

      const isReviewingFingerCurled = (tipIdx: number, pipIdx: number) => {
        return dist(lm[tipIdx], wrist) < dist(lm[pipIdx], wrist);
      };

      const indexCurled = isReviewingFingerCurled(8, 6);
      const middleCurled = isReviewingFingerCurled(12, 10);
      const ringCurled = isReviewingFingerCurled(16, 14);
      const pinkyCurled = isReviewingFingerCurled(20, 18);

      const curledCount = [indexCurled, middleCurled, ringCurled, pinkyCurled].filter(Boolean).length;

      if (curledCount >= 3) return GestureType.FIST; // Most fingers curled
      if (curledCount <= 1) return GestureType.PALM; // Most fingers extended
    }

    return GestureType.NONE;
  } catch (error) {
    console.error("Gesture recognition failed:", error);
    return GestureType.NONE;
  }
};

export const generateCharacterReaction = async (
  characterName: string,
  role: string,
  gesture: string,
  hpPercent: number,
  lang: Language
): Promise<{ dialogue: string, effect: 'HIT' | 'DODGE' | 'TORN' | 'FLY' }> => {
  // Mock response using static local database
  // Simulate network delay for "feel"
  await new Promise(resolve => setTimeout(resolve, 300));

  // Randomly pick a reaction
  return getRandomReaction();
};

export const generateStylizedImage = async (prompt: string, gender: 'male' | 'female', base64Image?: string): Promise<string> => {
  let bodyAsset;
  try {
    // 1. Filter bodies by gender and pick random
    const availableBodies = BODY_ASSETS.filter(b => b.gender === gender);
    // Fallback to all if no specific gender found (shouldn't happen with correct assets)
    const pool = availableBodies.length > 0 ? availableBodies : BODY_ASSETS;

    bodyAsset = pool[Math.floor(Math.random() * pool.length)];

    // 2. Create off-screen canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas not supported");

    // 3. Load Body Image
    const bodyImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      // Handle relative paths for dev/prod
      img.src = bodyAsset.image;
    });

    canvas.width = bodyImg.naturalWidth;
    canvas.height = bodyImg.naturalHeight;

    // Re-doing draw order:
    // 1. Draw Body
    ctx.filter = 'none';
    ctx.drawImage(bodyImg, 0, 0);

    // 2. Draw Face (if exists) ON TOP (since it's a standee cutout style, usually the face is pasted on)
    if (base64Image) {
      const faceImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = `data:image/jpeg;base64,${base64Image}`;
      });

      // Calculate hole position
      const h = bodyAsset.hole;
      const hX = (h.x / 100) * canvas.width;
      const hY = (h.y / 100) * canvas.height;
      const hW = (h.w / 100) * canvas.width;
      const hH = (h.h / 100) * canvas.height;

      // Draw Face (Centered in hole, maybe scaled to fit cover)
      ctx.save();
      // Create oval clip for face
      ctx.beginPath();
      ctx.ellipse(hX, hY, hW / 2, hH / 2, 0, 0, 2 * Math.PI);
      ctx.clip();

      // Draw face image to cover the hole area
      // Calculate aspect ratio to "cover"
      const faceRatio = faceImg.width / faceImg.height;
      const holeRatio = hW / hH;
      let drawW, drawH, drawX, drawY;

      if (faceRatio > holeRatio) {
        drawH = hH;
        drawW = drawH * faceRatio;
        drawX = hX - drawW / 2;
        drawY = hY - hH / 2;
      } else {
        drawW = hW;
        drawH = drawW / faceRatio;
        drawX = hX - hW / 2;
        drawY = hY - drawH / 2;
      }

      // Apply some filters to face to match style
      ctx.filter = 'contrast(1.2) saturate(1.2)';
      ctx.drawImage(faceImg, drawX, drawY, drawW, drawH);
      ctx.restore();
    }

    return canvas.toDataURL('image/png');

  } catch (err) {
    console.error("Cutout generation failed", err);
    // Fallback
    // Ensure bodyAsset is defined before trying to access its properties
    return (bodyAsset && bodyAsset.image) || `https://picsum.photos/seed/${Date.now()}/400/400`;
  }
};
