import {
  SceneLogContent,
  SceneLogJSONContent,
  SceneLogMediaType,
  SceneLogMessage,
  SceneLogTextContent,
} from '@/types/server/Log';
import Markdown from '@/components/markdown/Markdown';

export function getSceneLogMessageDisplayContent(message: SceneLogMessage, markdown = false) {
  switch (message.content.type) {
    case SceneLogMediaType.TEXT: {
      const content = message.content as SceneLogTextContent;
      const displayContent = content.display_text || content.text;
      return markdown ? <Markdown content={displayContent} /> : displayContent;
    }
    case SceneLogMediaType.AUDIO:
      return 'Audio';
    case SceneLogMediaType.IMAGE:
      return 'Image';
    case SceneLogMediaType.VIDEO:
      return 'Video';
    case SceneLogMediaType.JSON: {
      const content = message.content as SceneLogJSONContent;
      if (content.display_text) return markdown ? <Markdown content={content.display_text} /> : content.display_text;
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
