import DynamicObject from '@/types/server/DynamicObject';

export interface MetricEvaluatorConfigData {
  [key: string]: any;
}

export interface MetricEvaluatorObjConfig {
  evaluator_obj: DynamicObject;
  evaluator_config_data: MetricEvaluatorConfigData;
}

export interface MetricEvaluatorObjsConfig {
  evaluators: MetricEvaluatorObjConfig[];
}
