const totalSceneConfig: Record<string, any> = {
  config: {
    id: '4722291311627180485',
    scene_info_config_data: {
      environments: {},
    },
    scene_agents_config_data: [
      {
        agent_id: '-4479657652713996465',
        agent_config_data: {
          profile: {
            name: 'fsfesfe',
          },
          ai_backend_config: {
            api_key: null,
            organization: null,
            base_url: null,
            azure_endpoint: null,
            azure_deployment: null,
            api_version: null,
            is_azure: false,
            max_retries: 2,
            timeout: 60,
            model: 'gpt-3.5-turbo-instruct',
          },
        },
      },
    ],
    additional_config_data: {
      dataset_config: {
        path: 'AsakusaRinne/gaokao_bench',
        name: '2010-2022_History_MCQs',
        split: 'dev',
        question_column: 'question',
        golden_answer_column: 'answer',
        num_questions: -1,
        filter_conditions: null,
        question_preprocessor: null,
        data_dir: null,
        data_files: null,
      },
    },
  },
};

export default totalSceneConfig;
