# LEAF Playground WebUI

A browser interface based on Next.js for [leaf-playground](https://github.com/LLM-Evaluation-s-Always-Fatiguing/leaf-playground).

## Development

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Requirements

- yarn >= 1.22.10
- node >= 18
- Running [leaf-playground](https://github.com/LLM-Evaluation-s-Always-Fatiguing/leaf-playground)

### Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The Playground is initially configured to use the address `http://127.0.0.1:8000`. If you wish to change this, you can do so by setting a new address through the `PLAYGROUND_SERVER_BASE_URL` environment variable.


### Custom Scene Visualization Components

To tailor visualization components for specific Scenes, create your custom components within the `src/components/processing/specialized` directory. These components should have their props extending from `DefaultProcessingVisualizationComponentProps` for consistent integration.

Once your component is developed, register it within the `getProcessingVisualizationComponent` function located in `src/app/processing/[taskId]/page.tsx`. This is done by adding a case statement for the scene name.

### Make WebUI Bundle

To make a production-ready bundle, run the following command:

```bash
yarn bundle
```

This will create a `bundle` directory with the bundled files.

### Learn More

To learn more about this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Ant Design](https://github.com/ant-design/ant-design) - An enterprise-class UI design language and React UI library.
- [antd-style](https://github.com/ant-design/antd-style) - A business-level `css-in-js` solution built on the Ant Design V5 Token System.
- [Formily](https://github.com/alibaba/formily) - Dynamic Form Solution
- [Emotion](https://github.com/emotion-js/emotion) - The Next Generation of CSS-in-JS
- [zustand](https://github.com/pmndrs/zustand) - 🐻 Bear necessities for state management in React
