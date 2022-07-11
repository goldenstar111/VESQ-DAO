import {
  AppBar,
  Toolbar,
  SvgIcon,
  Link,
  FormControl,
  Select,
  MenuList,
  ClickAwayListener,
  MenuItem,
  IconButton,
  Grow,
  Paper,
  Popper,
  Collapse,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import MenuIcon from '@material-ui/icons/Menu';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import VSQMenu from './VSQMenu';
import ConnectMenu from './ConnectMenu';
import './topbar.scss';
import logo from '../../assets/images/logo.png';
import { ReactComponent as Logo_SVG } from '../../assets/images/logo.svg';
import { ReactComponent as Logo_VSQ } from '../../assets/images/vesq-icon.svg';
import logo_bnb from '../../assets/images/bnbprice.png';
import { NavLink, useLocation } from 'react-router-dom';
import { useCallback, useContext, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { IReduxState } from '../../store/slices/state.interface';
import { Skeleton } from '@material-ui/lab';
import { getTokenImage, trim } from '../../helpers';

const drawerWidth = 0;
const transitionDuration = 969;

type Page = 'dashboard' | 'stake' | 'choose_bond' | 'bonds' | 'migrate' | 'swap' | 'ivsq' | 'iivsq' | 'pvsq' | 'wrap';

const useStyles = makeStyles(theme => ({
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: '100%',
      padding: '20px 0 30px 0',
    },
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    background: 'transparent',
    backdropFilter: 'none',
    zIndex: 10,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  topBar: {
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: transitionDuration,
    }),
    marginLeft: drawerWidth,
  },
  topBarShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: transitionDuration,
    }),
    marginLeft: 0,
  },
  dappMenItem: {
    fontWeight: 'lighter',
    fontSize: '21px',
    paddingTop: '9px',
  },
  activeLink: {
    color: '#31CB9E',
    fontSize: 19,
  },
  inactiveLink: {
    color: '#ffffff',
    fontSize: 19,
  },
  boxBnbPrice: {
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    backgroundColor: '#27272E',
    fontWeight: 'lighter',
    padding: '10px',
    margin: '5px',
    fontSize: 15,
  },
  buybtn: {
    borderRadius: '5px',
    alignItems: 'center',
    fontWeight: 100,
    color: '#fff',
    backgroundColor: '#31CB9E',
    padding: '10px 20px',
    margin: '6px',
    fontSize: '18px',
    textDecoration: 'none',
  },
}));
interface IHeader {
  handleDrawerToggle: () => void;
  drawe: boolean;
}

function Header({ handleDrawerToggle, drawe }: IHeader) {
  const [open, setOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const dropdownLabel = 'Redeem';

  const [values, setValues] = useState([dropdownLabel, 'IVSQ', 'IIVSQ', 'PVSQ']);

  const [selected, setSelected] = useState(dropdownLabel);

  function handleChange(event: any) {
    if (dropdownLabel == event.target.value) return;
    setSelected(event.target.value);
    let pagestr: string = event.target.value;
    window.location.href = '/#/' + event.target.value;
  }

  const checkPage = useCallback((location: any, page: Page): boolean => {
    const currentPath = location.pathname.replace('/', '');
    // if ((currentPath.indexOf('bonds') >= 0 || currentPath.indexOf('choose_bond') >= 0) && page === 'bonds') {
    //   return true;
    // }
    if (currentPath.indexOf(page) >= 0) {
      console.log(page + '----true-----' + currentPath);
      return true;
    } else {
      console.log(page + '----false-----' + currentPath);
      return false;
    }
  }, []);

  const classes = useStyles();
  const isVerySmallScreen = useMediaQuery('(max-width: 400px)');
  const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
  const marketPrice = useSelector<IReduxState, number>(state => {
    return state.app.marketPrice;
  });

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
    setOpenSubMenu(false);
  };

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  const LogoLink = (
    <NavLink to="/">
      <SvgIcon component={Logo_SVG} viewBox="0 0 118 40" style={{ height: '40px', width: '118px' }} />
    </NavLink>
  );

  const MenuListComponent = (
    <div className="flex items-center justify-between md:justify-around flex-1 px-8">
      <Link
        component={NavLink}
        id="stake-nav"
        to="/dashboard"
        isActive={(match: any, location: any) => {
          return checkPage(location, 'dashboard');
        }}
        activeClassName="active"
      >
        <div className={classes.dappMenItem}>
          {checkPage(location, 'dashboard') ? (
            <div className={classes.activeLink}>Stats</div>
          ) : (
            <div className={classes.inactiveLink}>Stats</div>
          )}
        </div>
      </Link>
      <Link
        component={NavLink}
        id="stake-nav"
        to="/stake"
        isActive={(match: any, location: any) => {
          return checkPage(location, 'stake');
        }}
        activeClassName="active"
      >
        <div className={classes.dappMenItem}>
          {checkPage(location, 'stake') ? (
            <div className={classes.activeLink}>Stake</div>
          ) : (
            <div className={classes.inactiveLink}>Stake</div>
          )}
        </div>
      </Link>
      <Link
        component={NavLink}
        id="stake-nav"
        to="/bonds"
        isActive={(match: any, location: any) => {
          return checkPage(location, 'bonds');
        }}
        activeClassName="active"
      >
        <div className={classes.dappMenItem}>
          {checkPage(location, 'bonds') ? (
            <div className={classes.activeLink}>Bond</div>
          ) : (
            <div className={classes.inactiveLink}>Bond</div>
          )}
        </div>
      </Link>
      <Link
        component={NavLink}
        id="stake-nav"
        to="/wrap"
        isActive={(match: any, location: any) => {
          return checkPage(location, 'wrap');
        }}
        activeClassName="active"
      >
        <div className={classes.dappMenItem}>
          {checkPage(location, 'wrap') ? (
            <div className={classes.activeLink}>Wrap</div>
          ) : (
            <div className={classes.inactiveLink}>Wrap</div>
          )}
        </div>
      </Link>
      <FormControl>
        <Select
          value={selected}
          onChange={handleChange}
          inputProps={{
            name: 'agent',
            id: 'age-simple',
          }}
          style={{ fontSize: '19px', marginTop: '3.5px', color: 'white' }}
        >
          {values.map((value, index) => {
            return (
              <MenuItem
                onClick={() => {
                  if (value == dropdownLabel) return;
                  if ('/#/' + value == window.location.href) return;
                  //setSelected('IVSQ');
                  window.location.href = '/#/' + value;
                }}
                value={value}
                style={{ color: 'black', fontSize: '19px', fontWeight: 100 }}
              >
                {value}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );

  const ButtonList = (
    <div className="flex items-center justify-center xs:justify-start">
      <a
        href="https://app.sushi.com/swap?outputCurrency=0x29f1e986fca02b7e54138c04c4f503dddd250558"
        target="_blank"
        className={classes.buybtn}
      >
        Buy
      </a>
      <Link component={NavLink} to="/ivsq/vsq">
        <button className={classes.boxBnbPrice}>
          {/* <img src={logo_bnb}></img> */}
          <SvgIcon component={Logo_VSQ} viewBox="0 0 23 23" style={{ height: '23px', width: '23px' }} />

          <p>{isAppLoading ? <Skeleton width="100px" /> : `$${trim(marketPrice, 2)}`}</p>
          {/* <p>$ 0.00</p> */}
        </button>
      </Link>
      <ConnectMenu />
    </div>
  );
  return (
    <div className={`${classes.topBar} ${!drawe && classes.topBarShift}`}>
      <div style={{ maxWidth: 1200, margin: 'auto', width: '89%', paddingTop: '15px' }} id="specificHeader">
        <AppBar position="sticky" className={classes.appBar} elevation={0}>
          <Toolbar disableGutters className="dapp-topbar">
            <div className="w-full">
              <div className="flex items-center justify-between w-full">
                {LogoLink}
                <div className="hidden md:block flex-1">{MenuListComponent}</div>
                <div className="hidden xs:block">{ButtonList}</div>
                <div className="xs:hidden">
                  <IconButton
                    ref={anchorRef}
                    aria-controls={open ? 'menu-list-grow' : undefined}
                    aria-haspopup="true"
                    onClick={handleToggle}
                  >
                    <MenuIcon className="text-white" />
                  </IconButton>
                </div>
              </div>
              <div className="hidden xs:block md:!hidden flex-1 pb-4 sm:pb-0">{MenuListComponent}</div>
              <div className="xs:hidden py-4">{ButtonList}</div>
            </div>
          </Toolbar>
        </AppBar>
      </div>
      <Popper className="z-10" open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                  <NavLink to="/">
                    <MenuItem onClick={handleClose}>Stats</MenuItem>
                  </NavLink>
                  <NavLink to="/stake">
                    <MenuItem onClick={handleClose}>Stake</MenuItem>
                  </NavLink>
                  <NavLink to="/bonds">
                    <MenuItem onClick={handleClose}>Bond</MenuItem>
                  </NavLink>
                  <NavLink to="/wrap">
                    <MenuItem onClick={handleClose}>Wrap</MenuItem>
                  </NavLink>
                  <MenuItem className="flex-col" onClick={() => setOpenSubMenu(prevOpen => !prevOpen)}>
                    <div className="flex items-center justify-between gap-x-8">
                      Redeem
                      {openSubMenu ? <ExpandLess /> : <ExpandMore />}
                    </div>
                    <Collapse className="w-full" in={openSubMenu} timeout="auto" unmountOnExit>
                      <MenuList>
                        <NavLink to="/ivsq">
                          <MenuItem onClick={handleClose}>IVSQ</MenuItem>
                        </NavLink>
                        <NavLink to="/iivsq">
                          <MenuItem onClick={handleClose}>IIVSQ</MenuItem>
                        </NavLink>
                        <NavLink to="/pvsq">
                          <MenuItem onClick={handleClose}>PVSQ</MenuItem>
                        </NavLink>
                      </MenuList>
                    </Collapse>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
}

export default Header;
