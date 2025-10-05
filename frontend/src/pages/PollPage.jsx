import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { socket } from '../socket';
import { setPollId } from '../features/pollSlice';

// Import Components
import TeacherView from '../components/TeacherView';
import StudentView from '../components/StudentView';
import { Container } from '../components/Styled';
import styled from 'styled-components';

const ErrorMessage = styled.div`
    color: red;
    text-align: center;
    font-size: 1.2rem;
`;

function PollPage() {
  const { pollId: urlPollId } = useParams();
  const dispatch = useDispatch();
  const { user, error } = useSelector((state) => state.poll);

  // Effect to join the poll once the component mounts
  useEffect(() => {
    dispatch(setPollId(urlPollId));
    if (!user.isTeacher && user.name) {
      socket.emit('student:joinPoll', { pollId: urlPollId, name: user.name });
    }
  }, [urlPollId, user.isTeacher, user.name, dispatch]);

  if (error) {
      return <Container><ErrorMessage>{error}</ErrorMessage></Container>;
  }

  return (
    <div>
      {user.isTeacher ? <TeacherView /> : <StudentView />}
    </div>
  );
}

export default PollPage;