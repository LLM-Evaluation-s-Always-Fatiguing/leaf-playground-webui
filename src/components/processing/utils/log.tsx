import { SceneLogJSONContent, SceneLogMediaType, SceneLogMessage, SceneLogTextContent } from '@/types/server/Log';

export function getSceneLogMessageDisplayContent(message: SceneLogMessage) {
  switch (message.content.type) {
    case SceneLogMediaType.TEXT: {
      const content = message.content as SceneLogTextContent;
      return content.display_text || content.text;
    }
    case SceneLogMediaType.AUDIO:
      return 'Audio';
    case SceneLogMediaType.IMAGE:
      return 'Image';
    case SceneLogMediaType.VIDEO:
      return 'Video';
    case SceneLogMediaType.JSON: {
      const content = message.content as SceneLogJSONContent;
      return content.display_text || JSON.stringify(content.data, null, 2);
    }
    default:
      return message.content.display_text || 'Log Type Unknown';
  }
}
