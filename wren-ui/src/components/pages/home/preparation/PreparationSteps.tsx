import { useMemo } from 'react';
import styled from 'styled-components';
import { Timeline, Badge } from 'antd';
import FileDoneOutlined from '@ant-design/icons/FileDoneOutlined';
import Retrieving from './step/Retrieving';
import Organizing from './step/Organizing';
import Generating from './step/Generating';
import FixedSQLFinished from './step/FixedSQLFinished';
import ViewFinished from './step/ViewFinished';
import { PROCESS_STATE } from '@/utils/enum';
import {
  ProcessStateMachine,
  convertAskingTaskToProcessState,
} from '@/hooks/useAskProcessState';
import type { Props } from './index';

const StyledBadge = styled(Badge)`
  position: absolute;
  top: -5px;
  left: -3px;
  .ant-badge-status-dot {
    width: 7px;
    height: 7px;
  }
  .ant-badge-status-text {
    display: none;
  }
`;

const retrievingNextStates = ProcessStateMachine.getAllNextStates(
  PROCESS_STATE.SEARCHING,
  true,
);
const organizingNextStates = ProcessStateMachine.getAllNextStates(
  PROCESS_STATE.PLANNING,
  true,
);
const generatingNextStates = ProcessStateMachine.getAllNextStates(
  PROCESS_STATE.GENERATING,
  true,
);

const getProcessDot = (processing: boolean) => {
  return processing ? (
    <StyledBadge color="geekblue" status="processing" />
  ) : null;
};

export default function PreparationSteps(props: Props) {
  const { className, data, askingStreamTask, isAnswerFinished } = props;
  const { askingTask, view, sql } = data;

  const processState = useMemo(
    () => convertAskingTaskToProcessState(askingTask),
    [askingTask],
  );
  const isFixedSQL = useMemo(() => {
    return sql && askingTask?.invalidSql;
  }, [sql, askingTask?.invalidSql]);

  // displays
  const showView = !!view;
  const showRetrieving =
    retrievingNextStates.includes(processState) && !showView;
  const showOrganizing =
    organizingNextStates.includes(processState) && !showView;
  const showGenerating =
    generatingNextStates.includes(processState) && !showView;

  // data
  const retrievedTables = askingTask.retrievedTables || [];
  const sqlGenerationReasoning =
    askingTask.sqlGenerationReasoning || askingStreamTask || '';

  // loadings
  const retrieving = processState === PROCESS_STATE.SEARCHING;
  const organizing = processState === PROCESS_STATE.PLANNING;
  const generating = processState === PROCESS_STATE.GENERATING;
  const correcting = processState === PROCESS_STATE.CORRECTING;
  const wrapping = !isAnswerFinished;

  // templates
  if (showView) return <ViewTimelineSteps {...props} />;
  if (isFixedSQL) return <FixedSQLTimelineSteps {...props} />;

  // default
  return (
    <Timeline className={className}>
      {showRetrieving && (
        <Timeline.Item dot={getProcessDot(retrieving)}>
          <Retrieving loading={retrieving} tables={retrievedTables} />
        </Timeline.Item>
      )}
      {showOrganizing && (
        <Timeline.Item dot={getProcessDot(organizing)}>
          <Organizing loading={organizing} stream={sqlGenerationReasoning} />
        </Timeline.Item>
      )}
      {showGenerating && (
        <Timeline.Item dot={getProcessDot(generating || correcting)}>
          <Generating
            generating={generating}
            correcting={correcting}
            loading={wrapping}
          />
        </Timeline.Item>
      )}
    </Timeline>
  );
}

const fileDone = (
  <FileDoneOutlined
    className="gray-6"
    style={{ position: 'relative', top: -2, left: 2 }}
  />
);

function FixedSQLTimelineSteps(props: Props) {
  const { className } = props;

  return (
    <Timeline className={className}>
      <Timeline.Item dot={fileDone}>
        <FixedSQLFinished />
      </Timeline.Item>
    </Timeline>
  );
}

function ViewTimelineSteps(props: Props) {
  const { className } = props;

  return (
    <Timeline className={className}>
      <Timeline.Item dot={fileDone}>
        <ViewFinished />
      </Timeline.Item>
    </Timeline>
  );
}
