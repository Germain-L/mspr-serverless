import React, { useState, type JSX } from 'react';
import { 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  CssBaseline
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff, ArrowBack, QrCode } from '@mui/icons-material';

// Types pour les props et les états
type ViewType = 'login' | 'register' | 'setupPassword' | 'setup2FA' | 'verifyUser' | 'renewCredentials';
type SetViewFunction = (view: ViewType) => void;

interface ViewProps {
  setView: SetViewFunction;
}

// Création d'un thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    }
  },
});

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('login');

  // Différentes vues de l'application
  const views: Record<ViewType, JSX.Element> = {
    login: <LoginView setView={setCurrentView} />,
    register: <RegisterView setView={setCurrentView} />,
    setupPassword: <SetupPasswordView setView={setCurrentView} />,
    setup2FA: <Setup2FAView setView={setCurrentView} />,
    verifyUser: <VerifyUserView setView={setCurrentView} />,
    renewCredentials: <RenewCredentialsView setView={setCurrentView} />,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Conteneur principal qui couvre tout l'écran */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          height: '100vh',
          bgcolor: 'background.default',
          margin: 0,
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Card centrée avec une largeur fixe et des marges */}
        <Card 
          variant="outlined" 
          sx={{ 
            borderRadius: 2, 
            boxShadow: 3,
            width: '400px',
            maxWidth: '90%',
            m: 3,
            position: 'absolute', 
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              {currentView === 'login' && 'Connexion'}
              {currentView === 'register' && 'Création de compte'}
              {currentView === 'setupPassword' && 'Configuration du mot de passe'}
              {currentView === 'setup2FA' && 'Configuration 2FA'}
              {currentView === 'verifyUser' && 'Vérification utilisateur'}
              {currentView === 'renewCredentials' && 'Renouvellement des identifiants'}
            </Typography>
            {views[currentView]}
          </CardContent>
        </Card>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ 
            position: 'absolute',
            bottom: '16px',
            width: '100%'
          }}
        >
          Application de démonstration OpenFaaS - {new Date().getFullYear()}
        </Typography>
      </Box>
    </ThemeProvider>
  );
};

// Vue de connexion
const LoginView: React.FC<ViewProps> = ({ setView }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Nom d'utilisateur"
        variant="outlined"
        fullWidth
        margin="normal"
        placeholder="Entrez votre nom d'utilisateur"
      />
      <TextField
        label="Mot de passe"
        variant="outlined"
        fullWidth
        margin="normal"
        type={showPassword ? 'text' : 'password'}
        placeholder="Entrez votre mot de passe"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Code 2FA"
        variant="outlined"
        fullWidth
        margin="normal"
        placeholder="Entrez votre code 2FA"
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
        >
          Se connecter
        </Button>
        <Button
          variant="text"
          color="primary"
          onClick={() => setView('register')}
        >
          Créer un compte
        </Button>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Button
        variant="text"
        color="secondary"
        onClick={() => setView('renewCredentials')}
        size="small"
      >
        Renouveler identifiants expirés
      </Button>
    </Box>
  );
};

// Vue de création de compte
const RegisterView: React.FC<ViewProps> = ({ setView }) => {
  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Nom d'utilisateur"
        variant="outlined"
        fullWidth
        margin="normal"
        placeholder="Choisissez un nom d'utilisateur"
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setView('setupPassword')}
        >
          Continuer
        </Button>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => setView('login')}
        >
          Retour
        </Button>
      </Box>
    </Box>
  );
};

// Vue de configuration du mot de passe avec QR code
const SetupPasswordView: React.FC<ViewProps> = ({ setView }) => {
  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <Typography variant="body1" align="center">
        Scannez ce QR code pour configurer votre mot de passe à usage unique
      </Typography>
      
      <Paper 
        elevation={1} 
        sx={{ 
          width: 200, 
          height: 200, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          bgcolor: 'grey.100'
        }}
      >
        <QrCode sx={{ fontSize: 100, color: 'grey.600' }} />
      </Paper>
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={() => setView('setup2FA')}
        sx={{ mt: 2 }}
      >
        J'ai scanné le QR code
      </Button>
    </Box>
  );
};

// Vue de configuration 2FA avec QR code
const Setup2FAView: React.FC<ViewProps> = ({ setView }) => {
  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <Typography variant="body1" align="center">
        Scannez ce QR code avec votre application d'authentification 2FA
      </Typography>
      
      <Paper 
        elevation={1} 
        sx={{ 
          width: 200, 
          height: 200, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          bgcolor: 'grey.100'
        }}
      >
        <QrCode sx={{ fontSize: 100, color: 'grey.600' }} />
      </Paper>
      
      <TextField
        label="Code de vérification"
        variant="outlined"
        fullWidth
        margin="normal"
        placeholder="Entrez le code 2FA"
      />
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={() => setView('login')}
      >
        Valider
      </Button>
    </Box>
  );
};

// Vue de vérification d'utilisateur
const VerifyUserView: React.FC<ViewProps> = ({ setView }) => {
  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body1" gutterBottom>
        Entrez votre code 2FA pour vérifier votre identité
      </Typography>
      
      <TextField
        label="Code 2FA"
        variant="outlined"
        fullWidth
        margin="normal"
        placeholder="Entrez le code 2FA"
      />
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={() => setView('login')}
        sx={{ mt: 2 }}
      >
        Vérifier
      </Button>
    </Box>
  );
};

// Vue de renouvellement des identifiants
const RenewCredentialsView: React.FC<ViewProps> = ({ setView }) => {
  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Nom d'utilisateur"
        variant="outlined"
        fullWidth
        margin="normal"
        placeholder="Entrez votre nom d'utilisateur"
      />
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={() => setView('setupPassword')}
        sx={{ mt: 2 }}
      >
        Renouveler les identifiants
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        fullWidth
        onClick={() => setView('login')}
        sx={{ mt: 1 }}
      >
        Retour à la connexion
      </Button>
    </Box>
  );
};

export default App;