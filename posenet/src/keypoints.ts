/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

export type Tuple<T> = [T, T];
export type StringTuple = Tuple<string>;
export type NumberTuple = Tuple<number>;

export type Quad<T> = [T, T, T, T];
export type StringQuad = Quad<string>;

export const partNames = [
  'nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar', 'leftShoulder',
  'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist',
  'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'
];

export const NUM_KEYPOINTS = partNames.length;

export interface NumberDict {
  [jointName: string]: number;
}

export const partIds =
    partNames.reduce((result: NumberDict, jointName, i): NumberDict => {
      result[jointName] = i;
      return result;
    }, {}) as NumberDict;

const connectedPartNames: StringTuple[] = [
  ['leftShoulder', 'leftElbow'],
  ['leftElbow', 'leftWrist'], ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'],
  ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
  ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle']
];

const connectedSurfaceNames: StringQuad[] = [
    ['leftShoulder', 'rightShoulder', 'rightHip', 'leftHip'],
    ['leftEar', 'leftEye', 'rightShoulder', 'leftShoulder'],
    ['rightEye', 'rightEar', 'rightShoulder', 'leftShoulder'],
    ['leftEar', 'rightEye', 'rightShoulder', 'leftShoulder'],
    ['leftEye', 'rightEar', 'rightShoulder', 'leftShoulder'],
    ['leftEye', 'rightEye', 'rightShoulder', 'leftShoulder']
];

/*
 * Define the skeleton. This defines the parent->child relationships of our
 * tree. Arbitrarily this defines the nose as the root of the tree, however
 * since we will infer the displacement for both parent->child and
 * child->parent, we can define the tree root as any node.
 */
export const poseChain: StringTuple[] = [
  ['nose', 'leftEye'], ['leftEye', 'leftEar'], ['nose', 'rightEye'],
  ['rightEye', 'rightEar'], ['nose', 'leftShoulder'],
  ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
  ['leftShoulder', 'leftHip'], ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'], ['nose', 'rightShoulder'],
  ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
  ['rightShoulder', 'rightHip'], ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightAnkle']
];

export const connectedSurfaceIndices = connectedSurfaceNames.map(
    ([jointNameA, jointNameB, jointNameC, jointNameD]) =>
        ([partIds[jointNameA], partIds[jointNameB], partIds[jointNameC], partIds[jointNameD]]));

export const connectedPartIndices = connectedPartNames.map(
    ([jointNameA, jointNameB]) => ([partIds[jointNameA], partIds[jointNameB]]));

export const partChannels: string[] = [
  'left_face',
  'right_face',
  'right_upper_leg_front',
  'right_lower_leg_back',
  'right_upper_leg_back',
  'left_lower_leg_front',
  'left_upper_leg_front',
  'left_upper_leg_back',
  'left_lower_leg_back',
  'right_feet',
  'right_lower_leg_front',
  'left_feet',
  'torso_front',
  'torso_back',
  'right_upper_arm_front',
  'right_upper_arm_back',
  'right_lower_arm_back',
  'left_lower_arm_front',
  'left_upper_arm_front',
  'left_upper_arm_back',
  'left_lower_arm_back',
  'right_hand',
  'right_lower_arm_front',
  'left_hand'
];
