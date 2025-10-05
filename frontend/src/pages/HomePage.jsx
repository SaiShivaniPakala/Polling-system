import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../socket';
import { setUser, clearPoll } from '../features/pollSlice';
import { Container, Button, Input, Card } from '../components/Styled';
import styled from 'styled-components';

const HomePageContainer = styled(Container)`
  text-align: center;
`;
const Section = styled(Card)`
  margin-top: 2rem;
  h2 { margin-top: 0; }
`;
const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;


function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pollId = useSelector(state => state.poll.pollId);

  const [joinPollId, setJoinPollId] = useState('');
  const [studentName, setStudentName] = useState('');

  // Clear previous poll state when returning to home
  useEffect(() => {
    dispatch(clearPoll());
  }, [dispatch]);
  
  // Navigate teacher once poll is created
  useEffect(() => {
    if (pollId) {
      navigate(`/poll/${pollId}`);
    }
  }, [pollId, navigate]);

  const handleCreatePoll = () => {
    dispatch(setUser({ isTeacher: true, name: 'Teacher' }));
    socket.emit('teacher:createPoll');
  };
  
  const handleJoinPoll = (e) => {
    e.preventDefault();
    if (joinPollId && studentName) {
      dispatch(setUser({ isTeacher: false, name: studentName }));
      // We pass pollId in URL, name in state. PollPage will handle the join event.
      navigate(`/poll/${joinPollId.toUpperCase()}`);
    }
  };

  return (
    <HomePageContainer>
      <h1>Live Polling System</h1>
      <Section>
        <h2>For Teachers</h2>
        <Button onClick={handleCreatePoll}>Create a New Poll</Button>
      </Section>
      <Section>
        <h2>For Students</h2>
        <Form onSubmit={handleJoinPoll}>
          <Input 
            type="text" 
            placeholder="Enter Poll ID" 
            value={joinPollId}
            onChange={(e) => setJoinPollId(e.target.value)}
            maxLength="5"
            style={{textTransform: 'uppercase'}}
          />
          <Input 
            type="text" 
            placeholder="Enter Your Name" 
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
          <Button type="submit">Join Poll</Button>
        </Form>
      </Section>
    </HomePageContainer>
  );
}

export default HomePage;