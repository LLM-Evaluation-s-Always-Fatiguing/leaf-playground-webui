import dynamic from 'next/dynamic';

const VegaChart = dynamic(() => import('./VegaChart'), { ssr: false });

export default VegaChart;
