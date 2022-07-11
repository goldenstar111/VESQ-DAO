import { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import BondLogo from '../../components/BondLogo';
import AdvancedSettings from './AdvancedSettings';
import { IconButton, SvgIcon, Link } from '@material-ui/core';
import SettingsIcon from './SettingsIcon';
import { ReactComponent as XIcon } from '../../assets/icons/icon_close.svg';
import { useEscape } from '../../hooks';
import { Bond } from 'src/constants';
import logo_xl from '../../assets/images/logo_xl.png';

interface IBondHeaderProps {
  bond: Bond;
  slippage: number;
  recipientAddress: string;
  onRecipientAddressChange: (e: any) => void;
  onSlippageChange: (e: any) => void;
}

function BondHeader({
  bond,
  slippage,
  recipientAddress,
  onRecipientAddressChange,
  onSlippageChange,
}: IBondHeaderProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  let history = useHistory();

  useEscape(() => {
    if (open) handleClose;
    else history.push('/bonds');
  });

  return (
    <>
      <div className="bond-header">
        <div className="bond-settings">
          <IconButton onClick={handleOpen}>
            <SettingsIcon />
          </IconButton>
          <AdvancedSettings
            open={open}
            handleClose={handleClose}
            slippage={slippage}
            recipientAddress={recipientAddress}
            onRecipientAddressChange={onRecipientAddressChange}
            onSlippageChange={onSlippageChange}
          />
        </div>
        <div className="bond-header-logo">
          <div className="bond-header-name">
            <p style={{ color: '#000000', fontWeight: 200, fontSize: 21 }}>
              {bond.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </p>
          </div>
        </div>

        <Link component={NavLink} to="/bonds" className="cancel-bond">
          <SvgIcon color="primary" component={XIcon} />
        </Link>
      </div>
      <div className="logoBrand">
        <BondLogo bond={bond} />
      </div>
    </>
  );
}

export default BondHeader;
