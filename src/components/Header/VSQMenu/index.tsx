import { useState } from 'react';
import { getAddresses, TOKEN_DECIMALS, DEFAULT_NETWORK } from '../../../constants';
import { useSelector } from 'react-redux';
import { Link, SvgIcon, Popper, Button, Paper, Typography, Divider, Box, Fade, makeStyles } from '@material-ui/core';
import { ReactComponent as ArrowUpIcon } from '../../../assets/icons/arrow-up.svg';
import './vsq-menu.scss';
import { IReduxState } from '../../../store/slices/state.interface';
import { getTokenUrl, Token } from '../../../helpers';

const addTokenToWallet = (tokenSymbol: string, tokenAddress: string) => async () => {
  const tokenImage = getTokenUrl(tokenSymbol.toLowerCase() as Token);

  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: TOKEN_DECIMALS,
            image: tokenImage,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
};

const useStyles = makeStyles(theme => ({
  popperMenu: {
    '& .MuiButton-containedSecondary': {
      backgroundColor: theme.palette.mode.lightGray200,
    },
  },
}));

function VSQMenu() {
  const styles = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const isEthereumAPIAvailable = window.ethereum;

  const networkID = useSelector<IReduxState, number>(state => {
    return (state.app && state.app.networkID) || DEFAULT_NETWORK;
  });

  const addresses = getAddresses(networkID);

  const { VSQ_ADDRESS, sVSQ_ADDRESS } = addresses;

  const handleClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = 'ohm-popper';
  return (
    <>
      <Box
        component="div"
        onMouseEnter={e => handleClick(e)}
        onMouseLeave={e => handleClick(e)}
        id="ohm-menu-button-hover"
      >
        <Box color="text.primary" className="ohm-button">
          <p>BUY VSQ</p>
        </Box>

        <Popper id={id} open={open} anchorEl={anchorEl} transition>
          {({ TransitionProps }) => {
            return (
              <Fade {...TransitionProps} timeout={400}>
                <Paper className={`${styles.popperMenu} ohm-menu`} elevation={1}>
                  <Box component="div" className="buy-tokens">
                    <Link
                      href={'https://app.sushi.com/#/swap?outputCurrency=' + VSQ_ADDRESS}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="large" variant="text" color="primary" fullWidth>
                        <Typography className="buy-text" align="left">
                          Buy on SushiSwap <SvgIcon component={ArrowUpIcon} htmlColor="#A3A3A3" />
                        </Typography>
                      </Button>
                    </Link>
                  </Box>

                  {isEthereumAPIAvailable ? (
                    <Box className="add-tokens">
                      <Divider color="secondary" />
                      <p>ADD TOKEN TO WALLET</p>
                      <Button
                        size="large"
                        variant="text"
                        color="primary"
                        onClick={addTokenToWallet('vsq', VSQ_ADDRESS)}
                      >
                        <Typography className="buy-text">VSQ</Typography>
                      </Button>
                      <Button
                        variant="text"
                        size="large"
                        color="primary"
                        onClick={addTokenToWallet('svsq', sVSQ_ADDRESS)}
                      >
                        <Typography className="buy-text">sVSQ</Typography>
                      </Button>
                    </Box>
                  ) : null}
                </Paper>
              </Fade>
            );
          }}
        </Popper>
      </Box>
    </>
  );
}

export default VSQMenu;
