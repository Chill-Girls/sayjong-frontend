/**
 * landmarksDisplay.ts
 * 랜드마크 정보 표시 로직
 */

import { ALL_TRACKED_LANDMARKS } from '../constants/landmarks';
import {
  extractBlendshapes,
  displayBlendshapesAsObjects,
  displayBlendshapesAsNumbers,
} from './blendshapeProcessor';

/**
 * 랜드마크와 블렌드쉐이프 정보를 화면에 표시합니다
 * @param results - MediaPipe 감지 결과
 * @param displayElementId - 표시할 HTML 엘리먼트 ID
 * @param blendshapeSmoother - 블렌드쉐이프 평활화 객체 (선택적)
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
  const trackedLandmarks = ALL_TRACKED_LANDMARKS.map(idx => ({
    index: idx,
    x: allLandmarks[idx].x,
    y: allLandmarks[idx].y,
    z: allLandmarks[idx].z,
  }));
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

  displayHTML += `<br/><strong>Total Tracked:</strong> 44 points (4 face + 40 mouth) / 478<br/><br/>`;

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
