import App from './App';
import Landing from './Landing';
import IDO from './IDO';
import { HashRouter } from 'react-router-dom';
import { light as lightTheme } from '../themes';
import { ThemeProvider } from '@material-ui/core';
import { AppThemeProvider } from 'src/helpers/app-theme-context';

function Root() {
  return (
    <HashRouter>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </HashRouter>
  );
}

export default Root;
