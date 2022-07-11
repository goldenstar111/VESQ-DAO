import { useSelector } from 'react-redux';
import { prettifySeconds } from '../../helpers';
import { Box } from '@material-ui/core';
import './rebasetimer.scss';
import { Skeleton } from '@material-ui/lab';
import { useMemo } from 'react';
import { IReduxState } from '../../store/slices/state.interface';

function RebaseTimer() {
  const currentBlockTime = useSelector<IReduxState, number>(state => {
    return state.app.currentBlockTime;
  });

  const nextRebase = useSelector<IReduxState, number>(state => {
    return state.app.nextRebase;
  });

  const timeUntilRebase = useMemo(() => {
    if (currentBlockTime && nextRebase) {
      const seconds = nextRebase - currentBlockTime;
      console.log('pretty seconds ', seconds);
      return prettifySeconds(seconds);
    }
  }, [currentBlockTime, nextRebase]);

  console.log('timeUntilRebase ', timeUntilRebase);
  console.log('currentBlockTime ', currentBlockTime);
  console.log('nextRebase ', nextRebase);

  return (
    <Box className="rebase-timer">
      <p>
        {currentBlockTime ? (
          timeUntilRebase ? (
            <>{timeUntilRebase} to next rebase</>
          ) : (
            <>Harvesting</>
          )
        ) : (
          <Skeleton width="200px" />
        )}
      </p>
    </Box>
  );
}

export default RebaseTimer;
