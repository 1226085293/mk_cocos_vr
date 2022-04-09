import { _decorator, Component, Node, RenderStage } from "cc";
import * as cc from "cc";
import { EDITOR, JSB } from "cc/env";

const colors: cc.Color[] = [new cc.Color(0, 0, 0, 1)];
cc.PostProcessStage.prototype.render = function (camera: any) {
	const pipeline = this._pipeline;
	const device = pipeline.device;
	const sceneData = pipeline.pipelineSceneData;
	const cmdBuff = pipeline.commandBuffers[0];
	pipeline.pipelineUBO.updateCameraUBO(camera);

	const vp = camera.viewport;
	this._renderArea.x = vp.x * camera.window.width;
	this._renderArea.y = vp.y * camera.window.height;
	this._renderArea.width = vp.width * camera.window.width;
	this._renderArea.height = vp.height * camera.window.height;
	const renderData = pipeline.getPipelineRenderData();
	const framebuffer = camera.window.framebuffer;
	const renderPass = pipeline.getRenderPass(camera.clearFlag, framebuffer);

	if (camera.clearFlag & cc.gfx.ClearFlagBit.COLOR) {
		colors[0].x = camera.clearColor.x;
		colors[0].y = camera.clearColor.y;
		colors[0].z = camera.clearColor.z;
	}

	colors[0].w = camera.clearColor.w;

	cmdBuff.beginRenderPass(
		renderPass,
		framebuffer,
		this._renderArea,
		colors,
		camera.clearDepth,
		camera.clearStencil
	);
	cmdBuff.bindDescriptorSet(cc.pipeline.SetIndex.GLOBAL, pipeline.descriptorSet);
	// Postprocess
	const builtinPostProcess = sceneData.postprocessMaterial;
	const pass = builtinPostProcess.passes[0];
	const shader = pass.getShaderVariant();

	if (pipeline.bloomEnabled) {
		pass.descriptorSet.bindTexture(0, renderData.bloom!.combineTex);
	} else {
		pass.descriptorSet.bindTexture(0, renderData.outputRenderTargets[0]);
	}
	pass.descriptorSet.bindSampler(0, renderData.sampler);
	pass.descriptorSet.update();

	cmdBuff.bindDescriptorSet(cc.pipeline.SetIndex.MATERIAL, pass.descriptorSet);

	const inputAssembler = camera.window.swapchain
		? pipeline.quadIAOnscreen
		: pipeline.quadIAOffscreen;
	let pso: cc.gfx.PipelineState | null = null;
	if (pass != null && shader != null && inputAssembler != null) {
		pso = cc.PipelineStateManager.getOrCreatePipelineState(
			device,
			pass,
			shader,
			renderPass,
			inputAssembler
		);
	}

	const renderObjects = pipeline.pipelineSceneData.renderObjects;
	if (pso != null && renderObjects.length > 0) {
		cmdBuff.bindPipelineState(pso);
		cmdBuff.bindInputAssembler(inputAssembler);
		cmdBuff.draw(inputAssembler);
	}

	// this._uiPhase.render(camera, renderPass);

	// 调试信息
	// renderProfiler(device, renderPass, cmdBuff, pipeline.profiler, camera);

	cmdBuff.endRenderPass();
};
