/**
 * landmarksDisplay.ts
 * 랜드마크 정보 표시 로직
 */

import { FACE_ANCHORS, MOUTH_LANDMARKS } from '../constants/landmarks';
import {
  extractBlendshapes,
  displayBlendshapesAsObjects,
  displayBlendshapesAsNumbers,
} from './blendshapeProcessor';

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

// All tracked landmarks (43 points: 3 face anchors + 40 mouth landmarks)
const TRACKED_LANDMARKS = [...FACE_ANCHORS, ...MOUTH_LANDMARKS];

/**
 * 추적 중인 랜드마크만 추출합니다.
 */
export function extractTrackedLandmarks(landmarks: LandmarkPoint[]) {
  return TRACKED_LANDMARKS.map(index => ({
    index,
    ...landmarks[index],
  }));
}

/**
 * 랜드마크와 blendshape 정보를 화면에 표시합니다.
 */
export function updateLandmarksDisplay(
  results: any,
  displayElementId: string = 'landmarks-display',
  blendshapeSmoother?: { smooth: (data: number[]) => number[] },
) {
  const displayElement = document.getElementById(displayElementId);

  if (!displayElement) return;
  if (!results) {
    displayElement.innerHTML = '<div>No results available</div>';
    return;
  }
  if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
    displayElement.innerHTML = '<div>No face detected</div>';
    return;
  }

  const allLandmarks = results.faceLandmarks[0];
  const trackedLandmarks = extractTrackedLandmarks(allLandmarks);
  let blendshapes = extractBlendshapes(results);

  if (blendshapes.length > 0 && typeof blendshapes[0] === 'number' && blendshapeSmoother) {
    blendshapes = blendshapeSmoother.smooth(blendshapes);
  }

  let displayHTML = '<div><strong>Live Stream Mode</strong><br/>';

  displayHTML += '<strong>Face Anchors (Head Pose):</strong><br/>';
  trackedLandmarks.slice(0, 3).forEach((landmark: any) => {
    const label =
      landmark.index === 1 ? 'Nose' : landmark.index === 133 ? 'L Eye Inner' : 'R Eye Inner';
    displayHTML += `<span class="landmarkPoint">${label} [${landmark.index}]:</span> (${landmark.x.toFixed(3)}, ${landmark.y.toFixed(3)}, ${landmark.z.toFixed(3)})<br/>`;
  });

  displayHTML += '<br/><strong>Outer Lip Landmarks (20 points):</strong><br/>';
  const outerLipLandmarks = trackedLandmarks.slice(3, 23);
  outerLipLandmarks.forEach((landmark: any) => {
    displayHTML += `<span class="landmarkPoint">[${landmark.index}]:</span> (${landmark.x.toFixed(3)}, ${landmark.y.toFixed(3)}, ${landmark.z.toFixed(3)})<br/>`;
  });

  displayHTML += '<br/><strong>Inner Lip Landmarks (20 points):</strong><br/>';
  const innerLipLandmarks = trackedLandmarks.slice(23);
  innerLipLandmarks.forEach((landmark: any) => {
    displayHTML += `<span class="landmarkPoint">[${landmark.index}]:</span> (${landmark.x.toFixed(3)}, ${landmark.y.toFixed(3)}, ${landmark.z.toFixed(3)})<br/>`;
  });

  displayHTML += `<br/><strong>Total Tracked:</strong> 43 points (3 face + 40 mouth) / 478<br/><br/>`;

  if (blendshapes.length > 0) {
    displayHTML += '<strong>Face Blend Shapes:</strong><br/>';

    if (typeof blendshapes[0] === 'number') {
      displayHTML += displayBlendshapesAsNumbers(blendshapes);
    } else if (typeof blendshapes[0] === 'object' && blendshapes[0] !== null) {
      displayHTML += displayBlendshapesAsObjects(blendshapes);
    } else {
      displayHTML += 'Unsupported blendshapes format<br/>';
    }
  } else {
    displayHTML += '<strong>Face Blend Shapes:</strong> No blendshapes data<br/>';
  }

  displayHTML += '</div>';
  displayElement.innerHTML = displayHTML;
}
