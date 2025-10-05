import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { socket } from './socket';

import HomePage from './pages/HomePage';
import PollPage from './pages/PollPage';

import { 
    setPollState, 
    updateStudents, 
    setQuestion, 
    setResults,
    setError, 
    setPollId
} from './features/pollSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Teacher listeners
    socket.on('server:pollCreated', ({ pollId }) => {
      dispatch(setPollId(pollId));
    });

    // Universal listeners
    socket.on('server:pollState', (state) => dispatch(setPollState(state)));
    socket.on('server:studentsUpdated', (students) => dispatch(updateStudents(students)));
    socket.on('server:newQuestion', (question) => dispatch(setQuestion(question)));
    socket.on('server:showResults', (results) => dispatch(setResults(results)));
    socket.on('server:error', (error) => dispatch(setError(error.message)));

    return () => {
      socket.off('server:pollCreated');
      socket.off('server:pollState');
      socket.off('server:studentsUpdated');
      socket.off('server:newQuestion');
      socket.off('server:showResults');
      socket.off('server:error');
    };
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/poll/:pollId" element={<PollPage />} />
      </Routes>
    </Router>
  );
}

export default App;