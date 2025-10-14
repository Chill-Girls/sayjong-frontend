import { drawConnectors } from '@mediapipe/drawing_utils';
import {
	FACEMESH_FACE_OVAL, /* FACEMESH_LEFT_EYE, FACEMESH_LEFT_EYEBROW, FACEMESH_LEFT_IRIS, */ FACEMESH_LIPS,
	/* FACEMESH_RIGHT_EYE, FACEMESH_RIGHT_EYEBROW, FACEMESH_RIGHT_IRIS, */ FACEMESH_TESSELATION,
	type NormalizedLandmark, type Results
} from '@mediapipe/face_mesh';

/**
 * 
 * @param ctx 
 * @param results 
 * @param bgImage capture image
 * @param emphasis 강조할 landmark의 index
 * @param anchoredPoints 고정점 정보 (optional)
 */
export const draw = (
	ctx: CanvasRenderingContext2D,
	results: Results,
	bgImage: boolean,
	emphasis: number,
	anchoredPoints?: any[]
) => {
	const width = ctx.canvas.width
	const height = ctx.canvas.height

	ctx.save()
	ctx.clearRect(0, 0, width, height)

	if (bgImage && results.image) {
		ctx.drawImage(results.image, 0, 0, width, height)
	}

	if (results.multiFaceLandmarks) {
		const lineWidth = 1
		const tesselation = { color: '#C0C0C070', lineWidth }
		// const right_eye = { color: '#FF3030', lineWidth }
		// const left_eye = { color: '#30FF30', lineWidth }
		const face_oval = { color: '#E0E0E0', lineWidth }

		for (const landmarks of results.multiFaceLandmarks) {
			// 얼굴의 표면（덮어쓰기）
			drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, tesselation)
			// 오른쪽 눈・눈썹・눈동자
			//drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, right_eye)
			//drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, right_eye)
			//drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS, right_eye)
			// 왼쪽 눈・눈썹・눈동자
			//drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, left_eye)
			//drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, left_eye)
			//drawConnectors(ctx, landmarks, FACEMESH_LEFT_IRIS, left_eye)
			// 얼굴의 윤곽
			drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, face_oval)
			// 입술
			drawConnectors(ctx, landmarks, FACEMESH_LIPS, face_oval)

			// landmark 강조 그리기
			drawPoint(ctx, landmarks[emphasis])
		}
	}

	// 고정점 그리기
	if (anchoredPoints && anchoredPoints.length > 0) {
		drawAnchoredPoints(ctx, anchoredPoints)
	}

	ctx.restore()
}

/**
 * 特定のlandmarkを強調する
 * @param ctx
 * @param point
 */
const drawPoint = (ctx: CanvasRenderingContext2D, point: NormalizedLandmark) => {
	const x = ctx.canvas.width * point.x
	const y = ctx.canvas.height * point.y
	const r = 5

	ctx.fillStyle = '#22a7f2'
	ctx.beginPath()
	ctx.arc(x, y, r, 0, Math.PI * 2, true)
	ctx.fill()
}

/**
 * 고정점들을 그리기
 * @param ctx
 * @param anchoredPoints
 */
const drawAnchoredPoints = (ctx: CanvasRenderingContext2D, anchoredPoints: any[]) => {
	anchoredPoints.forEach((point, /* index */) => {
		const x = ctx.canvas.width * point.x
		const y = ctx.canvas.height * point.y
		const r = 8

		// 고정점은 빨간색 원으로 표시
		ctx.fillStyle = '#ff0000'
		ctx.strokeStyle = '#ffffff'
		ctx.lineWidth = 2
		
		ctx.beginPath()
		ctx.arc(x, y, r, 0, Math.PI * 2, true)
		ctx.fill()
		ctx.stroke()

		// 고정점 번호 표시
		ctx.fillStyle = '#ffffff'
		ctx.font = '12px Arial'
		ctx.textAlign = 'center'
		ctx.fillText(`${point.index}`, x, y - 15)
	})
}