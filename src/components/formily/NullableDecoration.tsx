import { PropsWithChildren } from 'react';

interface NullableDecorationProps extends PropsWithChildren {}

const NullableDecoration = (props: NullableDecorationProps) => {
  return <div>{props.children}</div>;
};

export default NullableDecoration;
