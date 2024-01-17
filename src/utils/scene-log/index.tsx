import {
  SceneActionLog,
  SceneLogContent,
  SceneLogJSONContent,
  SceneLogMediaType,
  SceneLogMessage,
  SceneLogTextContent,
} from '@/types/server/common/Log';
import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import Scene from '@/types/server/meta/Scene';
import Markdown from '@/components/markdown/Markdown';

export function getSceneLogMessageDisplayContent(message: SceneLogMessage, markdown = false, projectId: string) {
  switch (message.content.type) {
    case SceneLogMediaType.TEXT: {
      const content = message.content as SceneLogTextContent;
      const displayContent = content.display_text || content.text;
      return markdown ? (
        <Markdown content={displayContent} useHubAssets={true} hubAssetsProjectId={projectId} />
      ) : (
        displayContent
      );
    }
    case SceneLogMediaType.AUDIO:
      return 'Audio';
    case SceneLogMediaType.IMAGE:
      return 'Image';
    case SceneLogMediaType.VIDEO:
      return 'Video';
    case SceneLogMediaType.JSON: {
      const content = message.content as SceneLogJSONContent;
      if (content.display_text)
        return markdown ? (
          <Markdown content={content.display_text} useHubAssets={true} hubAssetsProjectId={projectId} />
        ) : (
          content.display_text
        );
      return JSON.stringify(content.data, null, 2);
    }
    default:
      return message.content.display_text || 'Log Type Unknown';
  }
}

export function getSceneLogGroundTruthDisplayContent(content: SceneLogContent, markdown = false) {
  switch (content.type) {
    case SceneLogMediaType.TEXT: {
      const textContent = content as SceneLogTextContent;
      const displayContent = textContent.display_text || textContent.text;
      return markdown ? <Markdown content={displayContent} /> : displayContent;
    }
    case SceneLogMediaType.AUDIO:
      return 'Audio';
    case SceneLogMediaType.IMAGE:
      return 'Image';
    case SceneLogMediaType.VIDEO:
      return 'Video';
    case SceneLogMediaType.JSON: {
      const jsonContent = content as SceneLogJSONContent;
      if (content.display_text) return markdown ? <Markdown content={content.display_text} /> : content.display_text;
      return JSON.stringify(jsonContent.data, null, 2);
    }
    default:
      return content.display_text || 'Content Type Unknown';
  }
}

export function getSceneActionLogMetricInfo(
  log: SceneActionLog,
  scene: Scene,
  createSceneTaskParams: CreateSceneTaskParams
) {
  const [logRoleName, logActionName] = log.action_belonged_chain ? log.action_belonged_chain.split('.') : [];
  const metrics =
    scene.scene_metadata.scene_definition.roles
      .find((r) => r.name === logRoleName)
      ?.actions.find((a) => a.name === logActionName)?.metrics || [];
  const metricsConfig =
    createSceneTaskParams.scene_obj_config.scene_config_data.roles_config[logRoleName]?.actions_config[logActionName]
      ?.metrics_config || {};
  const enabledMetrics = metrics.filter((metric) => {
    return metricsConfig[metric.name]?.enable;
  });
  const hasMetrics = enabledMetrics.length > 0;
  return {
    metrics,
    metricsConfig,
    enabledMetrics,
    hasMetrics,
  };
}

export function getSceneActionLogMetricEvalRecordDisplayInfo(log: SceneActionLog, metricName: string) {
  const metricKey = `${log.action_belonged_chain}.${metricName}`;
  const humanRecord = log.human_eval_records?.[metricKey];
  const evaluatorRecord = Array.isArray(log.eval_records?.[metricKey])
    ? log.eval_records[metricKey][log.eval_records[metricKey].length - 1]
    : undefined;
  const record = humanRecord || evaluatorRecord;
  const valueStr: string | undefined = record?.value !== undefined ? record.value.toString() : '-';
  const recordReason = record?.reason;
  return {
    value: record?.value,
    valueStr: valueStr,
    reason: recordReason,
    human: !!humanRecord,
  };
}
