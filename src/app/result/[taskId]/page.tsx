'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const TaskResultPage = ({ params }: { params: { taskId: string } }) => {
  const taskId = params.taskId;
  const searchParams = useSearchParams();
  const taskResultSavedDir = searchParams.get('taskResultSavedDir');

  console.log(taskResultSavedDir);

  const loadDataFromLocal = async () => {};

  useEffect(() => {}, []);

  return <div></div>;
};

export default TaskResultPage;
