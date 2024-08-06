// Copyright © 2024 Code on Bleu. All rights reserved.

import {Filter, GlProgram} from './../pixi.min.mjs'
import {vertex} from './defaultVertex.mjs'

export function makeJuliaFilter(args) {
	args = args || {}
	
	const maxIterations = Math.floor(args.maxIterations == null ? 10 : args.maxIterations)
	
	const fragment = `
in vec2 vTextureCoord;

uniform float uTime;
uniform float uScreenWidth;
uniform float uScreenHeight;
uniform float uRealC;
uniform float uImagC;

void main() {
	float aspect = uScreenWidth / uScreenHeight;
	float za = (vTextureCoord.x - 0.5) * 3.0 * aspect;
	float zb = (vTextureCoord.y - 0.5) * 3.0;
	float a = uRealC;
	float b = uImagC;
	
	for (int i = 0; i < ${maxIterations}; ++i) {
		float za2 = za * za;
		float zb2 = zb * zb;
		
		if (za2 + zb2 > 4.0) {
			float c = float(i) / ${maxIterations + '.0'};
			float t1 = (cos(uTime * 0.2) + 1.0) * 0.5;
			float t2 = (cos(uTime * 0.21) + 1.0) * 0.5;
			float t3 = (cos(uTime * 0.23) + 1.0) * 0.5;
			gl_FragColor = vec4(min(t1 * c + 0.02, 1.0), min(t2 * c + 0.02, 1.0), min(t3 * c + 0.02, 1.0), 1.0);
			return;
		}

        float zaPrev = za;
        za = a + za2 - zb2;
        zb = b + 2.0 * zaPrev * zb;
	}
	
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
}`

	return new Filter({
		glProgram: GlProgram.from({
			fragment,
			vertex
		}),
		resources: {
			testUniforms: {
				uTime: {value: 0.0, type: 'f32'},
				uScreenWidth: {value: 0.0, type: 'f32'},
				uScreenHeight: {value: 0.0, type: 'f32'},
				uRealC: {value: 0.0, type: 'f32'},
				uImagC: {value: 0.0, type: 'f32'}
			}
		}
	})
}
