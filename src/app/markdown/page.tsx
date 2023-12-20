import Markdown from '@/components/markdown/Markdown';

export default function MarkdownTestPage() {
  const content =
    `\n\n当然，我可以使用 Markdown 输出一个具有三列的表格。以下是一个示例：\n\n|  列1  |  列2  |  列3  |\n|-------|-------|-------|\n|   a   |   b   |   c   |\n\n希望这个表格符合您的要求！如果您还有其他问题，请随时向我提问。` +
    `\n\n你好！当然，我可以为您使用mermaid语法帮您绘制一个快速排序算法的时序图。以下是使用mermaid语法绘制的快速排序算法的时序图：\n\n\`\`\`mermaid\nsequenceDiagram\n    participant 输入数组\n    participant 枢轴选择\n    participant 分区操作\n    participant 递归调用\n\n    输入数组->>枢轴选择: 选择第一个元素作为枢轴\n    枢轴选择->>分区操作: 将数组分为两部分\n    分区操作->>递归调用: 对左右子数组递归调用快速排序\n    递归调用->>分区操作: 递归调用快速排序\n\n    Note right of 分区操作: 分区操作将数组分为<br>小于枢轴的元素和<br>大于等于枢轴的元素\n\n    输入数组-->分区操作: 输入数组作为参数调用快速排序\n\n\`\`\`\n\n这个时序图展示了快速排序算法的执行过程。首先，我们选择输入数组的第一个元素作为枢轴，然后进行分区操作，将数组分为小于枢轴的元素和大于等于枢轴的元素。接下来，我们对左右子数组递归调用快速排序，并在每次递归调用中进行分区操作，直到最终得到排序后的数组。\n\n希望这个时序图能够帮助您更好地理解快速排序算法的执行过程！如果您有任何其他问题，请随时向我提问。`;
  return <Markdown content={content} />;
}
