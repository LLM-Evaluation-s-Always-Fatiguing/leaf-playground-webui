export interface EvaluatorConfigData {
  [key: string]: any;
}

export default interface EvaluatorConfig {
  evaluator_name: string;
  evaluator_config_data: EvaluatorConfigData;
}
