import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { JournalScreem } from '../components/journal/JournalScreem';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoutes } from './PublicRoutes';
import { AuthRouter } from './AuthRouter';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAppDispatch } from '../redux/hooks';
import { login } from '../redux/slices/auth.slice';
import { loadNotes } from '../helpers/loadNotes';
import { notesLoad } from '../redux/slices/notes.slice';
import { ErrorPage } from '../components/ErrorPage';

export const AppRouter = () => {
  const dispatch = useAppDispatch();

  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user != null) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // ...
        setIsLoggedIn(true);
        const notes = loadNotes(user.uid);
        notes
          .then((notes) => dispatch(notesLoad(notes)))
          .catch((error) => {
            console.log(error);
          });

        dispatch(login({ uid: user.uid, name: user.displayName }));
      } else {
        setIsLoggedIn(false);
      }
      setChecking(false);
    });
  }, [dispatch, setChecking, setIsLoggedIn]);

  if (checking) return <h1>Espere...</h1>;

  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route
            path="/auth/*"
            element={
              <PublicRoutes isAuthenticated={isLoggedIn}>
                <AuthRouter />
              </PublicRoutes>
            }
            errorElement={<ErrorPage />}
          />
          <Route
            path="/"
            element={
              <PrivateRoute isAuthenticated={isLoggedIn}>
                <JournalScreem />
              </PrivateRoute>
            }
            errorElement={<ErrorPage />}
          />
          <Route path="/*" element={<ErrorPage />} />
          <Route />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
