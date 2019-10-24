/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';

const color = 'aqua';
const boundingBoxColor = 'red';

export const tryResNetButtonName = 'tryResNetButton';
export const tryResNetButtonText = '[New] Try ResNet50';
const tryResNetButtonTextCss = 'width:100%;text-decoration:underline;';
const tryResNetButtonBackgroundCss = 'background:#e61d5f;';

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobile() {
  return isAndroid() || isiOS();
}

function setDatGuiPropertyCss(propertyText, liCssString, spanCssString = '') {
  var spans = document.getElementsByClassName('property-name');
  for (var i = 0; i < spans.length; i++) {
    var text = spans[i].textContent || spans[i].innerText;
    if (text == propertyText) {
      spans[i].parentNode.parentNode.style = liCssString;
      if (spanCssString !== '') {
        spans[i].style = spanCssString;
      }
    }
  }
}

export function updateTryResNetButtonDatGuiCss() {
  setDatGuiPropertyCss(
      tryResNetButtonText, tryResNetButtonBackgroundCss,
      tryResNetButtonTextCss);
}

/**
 * Toggles between the loading UI and the main canvas UI.
 */
export function toggleLoadingUI(
    showLoadingUI, loadingDivId = 'loading', mainDivId = 'main') {
  if (showLoadingUI) {
    document.getElementById(loadingDivId).style.display = 'block';
    document.getElementById(mainDivId).style.display = 'none';
  } else {
    document.getElementById(loadingDivId).style.display = 'none';
    document.getElementById(mainDivId).style.display = 'block';
  }
}

function toTuple({y, x}) {
  return [y, x];
}

export function drawPoint(selection, y, x, r, color) {
    selection.append('circle')
        .classed('overlay_item', true)
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', r)
        .attr('fill', color);
}

/**
 * Draws a line on a canvas, i.e. a joint
 */
export function drawSegment([ay, ax], [by, bx], info, selection) {
  const scale = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by)) / info.height;
  const angle = Math.atan2(by-ay, bx-ax) * 180 / Math.PI - 90;
  selection.append('image')
      .classed('overlay_item', true)
      .attr('x', -200)
      .attr('y', -info.y)
      .attr('width', 400)
      .attr('height', 1000)
      .attr('xlink:href', 'assets/skeletonImages/' + info.name)
      .attr('transform', `translate(${ax} ${ay}) scale(${scale}) rotate(${angle})`);
}

export function drawSurface(keypoints, imageInfo, selection) {
  const [ay, ax] = toTuple(keypoints[0].position);
  const [by, bx] = toTuple(keypoints[1].position);
  const [cy, cx] = toTuple(keypoints[2].position);
  const [dy, dx] = toTuple(keypoints[3].position);

  const [leftX, leftY] = [bx - ax, by - ay];
  const [downX, downY] = [(ax + bx - cx - dx) / 2, (ay + by - cy - dy) / 2];

  let scaleX = Math.sqrt(leftX*leftX + leftY*leftY) / imageInfo.width;
  let scaleY = Math.sqrt(downX*downX + downY*downY) / imageInfo.height;
  if(leftX * downY > leftY * downX) scaleY *= -1;

  const angle = Math.atan2(leftY, leftX) * 180 / Math.PI;

  const surf = selection.append('image')
      .classed('overlay_item', true)
      .attr('x', -imageInfo.x)
      .attr('y', -imageInfo.y)
      .attr('width', 1000)
      .attr('height', 1000)
      .attr('xlink:href', 'assets/skeletonImages/' + imageInfo.name)
      .attr('transform', `translate(${ax} ${ay}) scale(${scaleX} ${scaleY}) rotate(${angle})`);
}

function getAdjacencyImageInfo(name) {
  switch(name) {
    case 'rightElbow_rightWrist' :    return { name: 'rightForearm.png', y: 40, height: 500};
    case 'leftElbow_leftWrist' :      return { name:'leftForearm.png', y: 40, height: 500};
    case 'rightShoulder_rightElbow' : return { name:'rightBicep.png', y: 78, height: 888};
    case 'leftShoulder_leftElbow' :   return { name:'leftBicep.png', y: 78, height: 888};
    case 'rightHip_rightKnee' :       return { name:'rightThigh.png', y: 42, height: 918};
    case 'leftHip_leftKnee' :         return { name:'leftThigh.png', y: 42, height: 918};
    case 'rightKnee_rightAnkle' :     return { name:'rightShin.png', y: 36, height: 760};
    case 'leftKnee_leftAnkle' :       return { name:'leftShin.png', y: 36, height: 760};
  }
  console.log('missed adjacency name = ' + name);
  return 'missing.png';
}

function getSurfaceImageInfo(name) {
  switch(name) {
    case 'leftShoulder_rightShoulder_rightHip_leftHip' :
      return {name: 'torso.png', x: 130, y: 195, width: 740, height: 632, strength: 0};
    case 'leftEye_rightEye_rightShoulder_leftShoulder' :
      return {name: 'head.png', x: 400, y: 400, width: 300, height: 600, strength: 1};
    case 'leftEar_leftEye_rightShoulder_leftShoulder' :
      return {name: 'leftHead.png', x: 460, y: 400, width: 360, height: 600, strength: 0.5};
    case 'rightEye_rightEar_rightShoulder_leftShoulder' :
      return {name: 'rightHead.png', x: 180, y: 400, width: 360, height: 600, strength: 0.5};
    case 'leftEar_rightEye_rightShoulder_leftShoulder' :
        return {name: 'left32Head.png', x: 212, y: 450, width: 450, height: 600, strength: 0.4};
    case 'leftEye_rightEar_rightShoulder_leftShoulder' :
        return {name: 'right32Head.png', x: 338, y: 450, width: 450, height: 600, strength: 0.4};
  }
  console.log('missedSurfaceName = ' + name);
  return {name: 'missing.png', x: 300, y: 400, width: 400, height: 533, strength: 0};
}

/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 */
export function drawSkeleton(keypoints, minConfidence, selection, scale = 1) {
  const adjacentKeyPoints =
      posenet.getAdjacentKeyPoints(keypoints, minConfidence);

  adjacentKeyPoints.forEach((keypoints) => {
    const imageInfo = getAdjacencyImageInfo(keypoints[0].part + '_' + keypoints[1].part);
    drawSegment(
        toTuple(keypoints[0].position), toTuple(keypoints[1].position), imageInfo, selection);
  });
}

/**
 * Draws a surface looking up appropriate quad vertices
 */
export function drawSurfaces(keypoints, minConfidence, selection, scale = 1) {
    const surfaceKeyPoints = posenet.getSurfaceKeyPoints(keypoints, minConfidence);
    const surfaceImages = surfaceKeyPoints.map(kp => getSurfaceImageInfo(kp[0].part + '_' + kp[1].part + '_' + kp[2].part + '_' + kp[3].part));

    // torso
    const torsoIndex = surfaceImages.findIndex(si => si.name.includes('torso'));
    if(torsoIndex >= 0)
        drawSurface(surfaceKeyPoints[torsoIndex], surfaceImages[torsoIndex], selection);

    // head
    let headIndex = -1;
    let bestHeadDistance = 0;
    surfaceImages.forEach((si, i) => {
      const a = toTuple(surfaceKeyPoints[i][0].position);
      const b = toTuple(surfaceKeyPoints[i][1].position);
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      const dist = Math.sqrt(dx*dx + dy*dy) * si.strength;

      if(dist > bestHeadDistance) {
          headIndex = i;
          bestHeadDistance = dist;
      }
    });
    if(headIndex >= 0)
      drawSurface(surfaceKeyPoints[headIndex], surfaceImages[headIndex], selection);
}

/**
 * Draw pose keypoints onto a canvas
 */
export function drawKeypoints(keypoints, minConfidence, selection, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const {y, x} = keypoint.position;
    drawPoint(selection, y * scale, x * scale, 3, color);
  }
}

/**
 * Draw the bounding box of a pose. For example, for a whole person standing
 * in an image, the bounding box will begin at the nose and extend to one of
 * ankles
 */
export function drawBoundingBox(keypoints, selection) {
  const boundingBox = posenet.getBoundingBox(keypoints);

  selection.append('rect')
      .classed('overlay_item', true)
      .attr('x', boundingBox.minX)
      .attr('y', boundingBox.minY)
      .attr('width', boundingBox.maxX - boundingBox.minX)
      .attr('height', boundingBox.maxY - boundingBox.minY)
      .attr('stroke', boundingBoxColor)
      .attr('fill', 'transparent')
      .attr('stroke-width', 4);
}

/**
 * Converts an arary of pixel data into an ImageData object
 */
export async function renderToCanvas(a, ctx) {
  const [height, width] = a.shape;
  const imageData = new ImageData(width, height);

  const data = await a.data();

  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    const k = i * 3;

    imageData.data[j + 0] = data[k + 0];
    imageData.data[j + 1] = data[k + 1];
    imageData.data[j + 2] = data[k + 2];
    imageData.data[j + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draw an image on a canvas
 */
export function renderImageToCanvas(image, size, canvas) {
  canvas.width = size[0];
  canvas.height = size[1];
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);
}

/**
 * Draw heatmap values, one of the model outputs, on to the canvas
 * Read our blog post for a description of PoseNet's heatmap outputs
 * https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5
 */
export function drawHeatMapValues(heatMapValues, outputStride, canvas) {
  const ctx = canvas.getContext('2d');
  const radius = 5;
  const scaledValues = heatMapValues.mul(tf.scalar(outputStride, 'int32'));

  drawPoints(ctx, scaledValues, radius, color);
}

/**
 * Used by the drawHeatMapValues method to draw heatmap points on to
 * the canvas
 */
function drawPoints(ctx, points, radius, color) {
  const data = points.buffer().values;

  for (let i = 0; i < data.length; i += 2) {
    const pointY = data[i];
    const pointX = data[i + 1];

    if (pointX !== 0 && pointY !== 0) {
      ctx.beginPath();
      ctx.arc(pointX, pointY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
}

/**
 * Draw offset vector values, one of the model outputs, on to the canvas
 * Read our blog post for a description of PoseNet's offset vector outputs
 * https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5
 */
export function drawOffsetVectors(
    heatMapValues, offsets, outputStride, scale = 1, ctx) {
  const offsetPoints =
      posenet.singlePose.getOffsetPoints(heatMapValues, outputStride, offsets);

  const heatmapData = heatMapValues.buffer().values;
  const offsetPointsData = offsetPoints.buffer().values;

  for (let i = 0; i < heatmapData.length; i += 2) {
    const heatmapY = heatmapData[i] * outputStride;
    const heatmapX = heatmapData[i + 1] * outputStride;
    const offsetPointY = offsetPointsData[i];
    const offsetPointX = offsetPointsData[i + 1];

    drawSegment(
        [heatmapY, heatmapX], [offsetPointY, offsetPointX], color, scale, ctx);
  }
}
